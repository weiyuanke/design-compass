/**
 * Kagent (k8s-agent) HTTP client — 对接 kagent-controller 的 A2A JSON-RPC API.
 * Configure VITE_KAGENT_BASE_URL env var; see vite-env.d.ts.
 * 
 * 运行时配置：支持通过 window.APP_CONFIG 动态配置（用于 Docker 部署场景）
 */

const KAGENT_NAMESPACE = "kagent";
const KAGENT_AGENT_SLUG = "k8s-agent";

/** 获取运行时配置，优先从 window.APP_CONFIG 读取，其次从 import.meta.env 读取 */
function getRuntimeConfig(key: string): string | undefined {
  // 优先从 window.APP_CONFIG 读取（运行时注入）
  if (typeof window !== "undefined" && (window as Record<string, unknown>).APP_CONFIG) {
    const appConfig = (window as Record<string, unknown>).APP_CONFIG as Record<string, string>;
    const value = appConfig[key];
    if (value && !value.startsWith("${")) {
      return value.trim();
    }
  }
  // 其次从 import.meta.env 读取（构建时注入）
  const envValue = (import.meta.env as Record<string, string>)[key];
  return envValue?.trim();
}

/** 获取 Agent Card API 路径 */
function agentCardPath(): string {
  return `/api/a2a/${KAGENT_NAMESPACE}/${KAGENT_AGENT_SLUG}/.well-known/agent.json`;
}

/** A2A JSON-RPC API 路径 */
function a2aPath(): string {
  return `/api/a2a/${KAGENT_NAMESPACE}/${KAGENT_AGENT_SLUG}/`;
}

/**
 * 实际发起 fetch 的 base：开发环境下若配置了远程 `http(s)://...` 且与当前页不同源，
 * 自动改为 `/kagent-proxy`，由 Vite 代理到 `VITE_KAGENT_BASE_URL`，避免浏览器 CORS。
 * 生产构建仍直接使用 `VITE_KAGENT_BASE_URL`（需在网关或 Kagent 侧放行 CORS）。
 */
function getBaseUrl(): string {
  const raw = getRuntimeConfig("VITE_KAGENT_BASE_URL")?.replace(/\/$/, "") ?? "";
  if (!raw) return "";
  if (raw.startsWith("/")) return raw;
  if (import.meta.env.DEV && /^https?:\/\//i.test(raw)) {
    if (typeof window !== "undefined") {
      try {
        if (new URL(raw).origin !== window.location.origin) return "/kagent-proxy";
      } catch {
        return raw;
      }
    } else {
      return "/kagent-proxy";
    }
  }
  return raw;
}

export function isKagentConfigured(): boolean {
  return Boolean(getBaseUrl());
}

function kagentUserId(): string {
  return getRuntimeConfig("VITE_KAGENT_USER_ID") || "admin@kagent.dev";
}

/** Agent Card 信息 */
export interface KagentAgentCard {
  name: string;
  description: string;
  url: string;
  version: string;
  capabilities: {
    streaming: boolean;
    pushNotifications: boolean;
    stateTransitionHistory: boolean;
  };
  defaultInputModes: string[];
  defaultOutputModes: string[];
  skills: {
    id: string;
    name: string;
    description: string;
    tags: string[];
    examples: string[];
  }[];
}

/**
 * 获取 Agent Card - 用于验证服务是否可用
 */
export async function fetchAgentCard(): Promise<KagentAgentCard> {
  const base = getBaseUrl();
  if (!base) throw new Error("未配置 VITE_KAGENT_BASE_URL");

  const res = await fetch(`${base}${agentCardPath()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`获取 Agent Card 失败 (${res.status})`);
  }

  return res.json() as Promise<KagentAgentCard>;
}

export interface StreamKagentCallbacks {
  /** 最终文本内容（流式输出） */
  onAgentText?: (text: string, done: boolean) => void;
  /** 中间状态更新（如 "正在分析...", "执行命令中..."） */
  onStatusUpdate?: (status: string, state?: string) => void;
  /** 任务事件（如 "正在思考", "正在执行命令"） */
  onTaskUpdate?: (message: string, kind?: string) => void;
  /** task_status_update 事件（包含状态详情） */
  onTaskStatusUpdate?: (status: string, state?: string, final?: boolean) => void;
  onError?: (err: Error) => void;
}

/** 从 A2A JSON-RPC 响应中提取 Agent 文本 */
function extractAgentTextFromPayload(parsed: Record<string, unknown>): string | null {
  const result = parsed.result as Record<string, unknown> | undefined;
  if (!result) return null;

  // 处理 artifact-update 类型
  if (result.kind === "artifact-update" && result.artifact) {
    const art = result.artifact as { parts?: { kind?: string; text?: string }[] };
    const t = art.parts?.map((p) => p.text).filter(Boolean).join("") ?? "";
    return t || null;
  }

  // 处理 status-update 类型
  if (result.kind === "status-update" && result.status && typeof result.status === "object") {
    const st = result.status as {
      message?: { role?: string; parts?: { text?: string }[] };
    };
    if (st.message?.role === "agent" && st.message.parts?.length) {
      return st.message.parts.map((p) => p.text).filter(Boolean).join("") || null;
    }
  }
  return null;
}

/** 从 status-update 中提取状态消息 */
function extractStatusFromPayload(parsed: Record<string, unknown>): { status: string; state?: string } | null {
  const result = parsed.result as Record<string, unknown> | undefined;
  if (!result) return null;

  if (result.kind === "status-update" && result.status && typeof result.status === "object") {
    const st = result.status as {
      state?: string;
      message?: { role?: string; parts?: { text?: string }[] };
    };
    const statusMsg = st.message?.parts?.map((p) => p.text).filter(Boolean).join("") || "";
    if (statusMsg || st.state) {
      return { status: statusMsg, state: st.state };
    }
  }
  return null;
}

/** 从任何类型的响应中提取任务相关消息 */
function extractTaskMessage(parsed: Record<string, unknown>): { message: string; kind?: string } | null {
  const result = parsed.result as Record<string, unknown> | undefined;
  if (!result) return null;

  // 处理 status-update 类型（包含 agent 消息）
  if (result.kind === "status-update" && result.status && typeof result.status === "object") {
    const st = result.status as {
      message?: { role?: string; parts?: { text?: string }[] };
    };
    // 如果消息不是 agent 角色，也可能是任务事件
    if (st.message?.parts?.length) {
      const msg = st.message.parts.map((p) => p.text).filter(Boolean).join("");
      if (msg) {
        return { message: msg, kind: result.kind as string };
      }
    }
  }

  // 处理 message 类型（直接的消息）
  if (result.kind === "message" && typeof result.parts === "object") {
    const parts = result.parts as { kind?: string; text?: string }[];
    const msg = parts.map((p) => p.text).filter(Boolean).join("");
    if (msg) {
      return { message: msg, kind: result.kind as string };
    }
  }

  return null;
}

/** 判断流是否结束 */
function isStreamFinished(parsed: Record<string, unknown>, eventName: string): boolean {
  const result = parsed.result as Record<string, unknown> | undefined;
  if (!result) return false;
  if (result.kind === "artifact-update" && result.lastChunk === true) return true;
  if (
    eventName === "task_status_update" &&
    result.kind === "status-update" &&
    result.final === true &&
    (result.status as { state?: string } | undefined)?.state === "completed"
  ) {
    return true;
  }
  return false;
}

/**
 * POST message/stream to A2A endpoint; parses SSE and surfaces agent text (streaming + final).
 * @param contextId 会话 ID（以 "ctx-" 开头），新建会话时传入新的 UUID
 * @param userText 用户消息
 * @param cbs 回调函数
 * @param signal AbortSignal
 */
export async function streamKagentMessage(
  contextId: string,
  userText: string,
  cbs: StreamKagentCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const base = getBaseUrl();
  if (!base) {
    cbs.onError?.(new Error("未配置 VITE_KAGENT_BASE_URL"));
    return;
  }

  const messageId = crypto.randomUUID();
  const rpcId = crypto.randomUUID();
  const body = {
    jsonrpc: "2.0",
    method: "message/stream",
    params: {
      message: {
        kind: "message",
        messageId,
        role: "user",
        parts: [{ kind: "text", text: userText }],
        contextId,
        metadata: { displaySource: "user" },
      },
      metadata: {},
    },
    id: rpcId,
  };

  try {
    const res = await fetch(`${base}${a2aPath()}`, {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!res.ok) {
      cbs.onError?.(new Error(`A2A 请求失败 (${res.status})`));
      return;
    }
    if (!res.body) {
      cbs.onError?.(new Error("响应无正文"));
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let delim: RegExpExecArray | null;
      while ((delim = /\r?\n\r?\n/.exec(buffer))) {
        const idx = delim.index;
        const block = buffer.slice(0, idx);
        buffer = buffer.slice(idx + delim[0].length);
        let eventName = "";
        let dataLine = "";
        for (const line of block.split(/\n/)) {
          if (line.startsWith("event:")) eventName = line.slice(6).trim();
          else if (line.startsWith("data:")) dataLine += line.slice(5).trim();
        }
        if (!dataLine) continue;

        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(dataLine) as Record<string, unknown>;
        } catch {
          continue;
        }

        if ("error" in parsed && parsed.error) {
          cbs.onError?.(new Error(String(parsed.error)));
          return;
        }

        const text = extractAgentTextFromPayload(parsed);
        const statusInfo = extractStatusFromPayload(parsed);
        const taskMsg = extractTaskMessage(parsed);
        const streamDone = isStreamFinished(parsed, eventName);

        // 触发状态更新回调
        if (statusInfo && (statusInfo.status || statusInfo.state)) {
          cbs.onStatusUpdate?.(statusInfo.status, statusInfo.state);
        }

        // 触发任务事件回调（当没有提取到文本但有任务消息时）
        if (taskMsg && !text) {
          cbs.onTaskUpdate?.(taskMsg.message, taskMsg.kind);
        }

        // 触发 task_status_update 事件回调
        if (eventName === "task_status_update" && (parsed.result as Record<string, unknown>)?.kind === "status-update") {
          const resultData = parsed.result as Record<string, unknown>;
          const st = resultData.status as { state?: string; message?: { parts?: { text?: string }[] } } | undefined;
          const taskStatusMsg = st?.message?.parts?.map((p) => p.text).filter(Boolean).join("") || "";
          if (taskStatusMsg || st?.state) {
            const isFinal = resultData.final === true && st?.state === "completed";
            cbs.onTaskStatusUpdate?.(taskStatusMsg, st?.state, isFinal);
          }
        }

        if (text) {
          cbs.onAgentText?.(text, streamDone);
        } else if (streamDone) {
          cbs.onAgentText?.("", true);
        }
      }
    }
  } catch (e) {
    if (isAbortError(e)) return;
    cbs.onError?.(e instanceof Error ? e : new Error(String(e)));
  }
}

function isAbortError(e: unknown): boolean {
  return (
    e instanceof DOMException && e.name === "AbortError" ||
    (e !== null && typeof e === "object" && "name" in e && (e as { name: string }).name === "AbortError")
  );
}