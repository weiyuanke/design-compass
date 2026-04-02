/**
 * Kagent (k8s-agent) HTTP client — sessions via Next.js RSC routes, chat via A2A JSON-RPC + SSE.
 * Configure VITE_KAGENT_* env vars; see vite-env.d.ts.
 */

const KAGENT_NAMESPACE = "kagent";
const KAGENT_AGENT_SLUG = "k8s-agent";
const KAGENT_AGENT_REF = `${KAGENT_NAMESPACE}/${KAGENT_AGENT_SLUG}`;

/** Matches the Referer / router state for the k8s-agent chat page in kagent UI */
export const KAGENT_NEXT_ROUTER_STATE_TREE =
  "%5B%22%22%2C%7B%22children%22%3A%5B%22agents%22%2C%7B%22children%22%3A%5B%5B%22namespace%22%2C%22kagent%22%2C%22d%22%5D%2C%7B%22children%22%3A%5B%5B%22name%22%2C%22k8s-agent%22%2C%22d%22%5D%2C%7B%22children%22%3A%5B%22chat%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D";

export interface KagentSessionRow {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  agent_id: string;
}

/**
 * 实际发起 fetch 的 base：开发环境下若配置了远程 `http(s)://...` 且与当前页不同源，
 * 自动改为 `/kagent-proxy`，由 Vite 代理到 `VITE_KAGENT_BASE_URL`，避免浏览器 CORS。
 * 生产构建仍直接使用 `VITE_KAGENT_BASE_URL`（需在网关或 Kagent 侧放行 CORS）。
 */
function getBaseUrl(): string {
  const raw = import.meta.env.VITE_KAGENT_BASE_URL?.trim().replace(/\/$/, "") ?? "";
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

/** Next.js server action hash for "list sessions" — optional; omit to skip remote list */
export function kagentHasListAction(): boolean {
  return Boolean(import.meta.env.VITE_KAGENT_NEXT_ACTION_LIST?.trim());
}

/** Required for creating a remote Kagent session from this app */
export function kagentHasCreateAction(): boolean {
  return Boolean(import.meta.env.VITE_KAGENT_NEXT_ACTION_CREATE?.trim());
}

function kagentUserId(): string {
  return import.meta.env.VITE_KAGENT_USER_ID?.trim() || "admin@kagent.dev";
}

function chatPath(): string {
  return `/agents/${KAGENT_NAMESPACE}/${KAGENT_AGENT_SLUG}/chat`;
}

function a2aPath(): string {
  return `/a2a/${KAGENT_NAMESPACE}/${KAGENT_AGENT_SLUG}`;
}

function rscHeaders(nextAction: string): HeadersInit {
  const raw = import.meta.env.VITE_KAGENT_BASE_URL?.trim() ?? "";
  let origin = "";
  try {
    if (/^https?:\/\//i.test(raw)) origin = new URL(raw).origin;
  } catch {
    origin = "";
  }
  return {
    Accept: "text/x-component",
    "Content-Type": "text/plain;charset=UTF-8",
    "next-action": nextAction,
    "next-router-state-tree": KAGENT_NEXT_ROUTER_STATE_TREE,
    ...(origin ? { Origin: origin, Referer: `${origin}${chatPath()}` } : {}),
  };
}

/** Parses multi-line RSC-style response: `0:{...}\n1:{...}` → object with `data` */
function parseRscPayload<T>(text: string): { message?: string; data: T } {
  const lines = text.trim().split(/\n/);
  for (const line of lines) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const jsonStr = line.slice(colon + 1);
    try {
      const obj = JSON.parse(jsonStr) as { message?: string; data?: T };
      if (obj && typeof obj === "object" && "data" in obj && obj.data !== undefined) {
        return obj as { message?: string; data: T };
      }
    } catch {
      /* next line */
    }
  }
  throw new Error("无法解析 Kagent 会话接口响应");
}

export async function fetchKagentSessions(): Promise<KagentSessionRow[]> {
  const base = getBaseUrl();
  const action = import.meta.env.VITE_KAGENT_NEXT_ACTION_LIST?.trim();
  if (!base || !action) throw new Error("缺少 VITE_KAGENT_NEXT_ACTION_LIST");

  const res = await fetch(`${base}${chatPath()}`, {
    method: "POST",
    headers: rscHeaders(action),
    body: JSON.stringify([KAGENT_NAMESPACE, KAGENT_AGENT_SLUG]),
  });
  if (!res.ok) throw new Error(`获取会话列表失败 (${res.status})`);
  const text = await res.text();
  const parsed = parseRscPayload<KagentSessionRow[]>(text);
  return Array.isArray(parsed.data) ? parsed.data : [];
}

export async function createKagentSession(name: string): Promise<KagentSessionRow> {
  const base = getBaseUrl();
  const action = import.meta.env.VITE_KAGENT_NEXT_ACTION_CREATE?.trim();
  if (!base || !action) throw new Error("缺少 VITE_KAGENT_NEXT_ACTION_CREATE");

  const body = [{ user_id: kagentUserId(), agent_ref: KAGENT_AGENT_REF, name }];
  const res = await fetch(`${base}${chatPath()}`, {
    method: "POST",
    headers: rscHeaders(action),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`创建会话失败 (${res.status})`);
  const text = await res.text();
  const parsed = parseRscPayload<KagentSessionRow>(text);
  if (!parsed.data?.id) throw new Error("创建会话返回数据无效");
  return parsed.data;
}

export interface StreamKagentCallbacks {
  onAgentText?: (text: string, done: boolean) => void;
  onError?: (err: Error) => void;
}

function extractAgentTextFromPayload(parsed: Record<string, unknown>): string | null {
  const result = parsed.result as Record<string, unknown> | undefined;
  if (!result) return null;

  if (result.kind === "artifact-update" && result.artifact) {
    const art = result.artifact as { parts?: { kind?: string; text?: string }[] };
    const t = art.parts?.map((p) => p.text).filter(Boolean).join("") ?? "";
    return t || null;
  }

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
        const streamDone = isStreamFinished(parsed, eventName);
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
