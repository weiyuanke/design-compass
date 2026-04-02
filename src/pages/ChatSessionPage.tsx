import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Bot, User, Plus, ChevronDown, Globe, Mic, ArrowUp, Wrench, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { getAllChatAgents } from "@/data/agents";
import { toast } from "sonner";
import {
  isKagentConfigured,
  streamKagentMessage,
} from "@/lib/kagent";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ChatMarkdown } from "@/components/ChatMarkdown";

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
  /** 流式响应状态 */
  streamingStatus?: {
    state?: string;
    message?: string;
    isFinal?: boolean;
  };
  /** MCP 工具调用状态 */
  toolCalls?: {
    name: string;
    args?: Record<string, unknown>;
    status: "start" | "running" | "complete" | "error";
    result?: string;
    error?: string;
  }[];
}

interface Session {
  id: string;
  agentId: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

const { platform, mine, all } = getAllChatAgents();
const agentLookup = Object.fromEntries(all.map((a) => [a.id, a]));
const K8S_OPS_ID = "k8s-ops";

function k8sKagentWelcomeContent(): string {
  return "已连接 Kagent Kubernetes 助手。请输入集群相关问题（Pod、节点、Deployment 等）。";
}

function isK8sKagentBackendEnabled(): boolean {
  return isKagentConfigured();
}

/** 将 A2A 状态转换为中文显示 */
function getStateDisplayText(state?: string): string {
  if (!state) return "";
  const stateMap: Record<string, string> = {
    submitted: "已提交任务",
    working: "正在处理",
    waiting: "等待中",
    input_required: "需要更多信息",
    completed: "已完成",
    failed: "处理失败",
    canceled: "已取消",
  };
  return stateMap[state] || state;
}

// Auto-expanding textarea hook
const useAutoResize = (value: string) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [value]);
  return ref;
};

const ChatSessionPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialAgentId = searchParams.get("agent") || "";
  const initialMessage = location.state?.initialMessage as string | undefined;

  const [selectedAgentId, setSelectedAgentId] = useState<string>(initialAgentId);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [kagentBootstrapping, setKagentBootstrapping] = useState(false);
  const [streamingState, setStreamingState] = useState<{
    state?: string;
    message?: string;
    isFinal?: boolean;
  } | null>(null);
  const [activeToolCalls, setActiveToolCalls] = useState<{
    name: string;
    args?: Record<string, unknown>;
    status: "start" | "running" | "complete" | "error";
    result?: string;
    error?: string;
  }[]>([]);
  const streamAbortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useAutoResize(input);
  const k8sKagent = isK8sKagentBackendEnabled();

  const agent = selectedAgentId ? agentLookup[selectedAgentId] : null;
  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialAgentId && agentLookup[initialAgentId] && sessions.length === 0) {
      void bootstrapInitialSession(initialAgentId);
    }
  }, [initialAgentId]);

  // 处理从 Landing Page 传来的初始消息
  useEffect(() => {
    if (initialMessage && activeSessionId && selectedAgentId) {
      void handleSend(initialMessage);
      // 清除状态，避免重复发送
      window.history.replaceState({}, document.title);
    }
  }, [initialMessage, activeSessionId, selectedAgentId]);

  const selectAgent = (agentId: string) => {
    setSelectedAgentId(agentId);
    setSearchParams({ agent: agentId });
    void bootstrapInitialSession(agentId);
  };

  /** Local-only session (mock or non-k8s kagent) */
  const createLocalSession = (agentId: string) => {
    const a = agentLookup[agentId];
    if (!a) return;
    const newSession: Session = {
      id: Date.now().toString(),
      agentId,
      title: `与 ${a.name} 的对话`,
      updatedAt: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      messages: [
        {
          id: "welcome",
          role: "agent",
          content:
            agentId === K8S_OPS_ID && k8sKagent
              ? k8sKagentWelcomeContent()
              : `你好！我是${a.name}，${a.description}。有什么可以帮你的吗？`,
          timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setSelectedAgentId(agentId);
  };

  const createRemoteK8sSession = async (agentId: string) => {
    const a = agentLookup[agentId];
    if (!a) return;
    setKagentBootstrapping(true);
    // 新会话：生成随机 contextId（以 ctx- 开头）
    const contextId = `ctx-${crypto.randomUUID()}`;
    const newSession: Session = {
      id: contextId,
      agentId,
      title: `与 ${a.name} · ${new Date().toLocaleString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`,
      updatedAt: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      messages: [
        {
          id: "welcome",
          role: "agent",
          content: k8sKagentWelcomeContent(),
          timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setSelectedAgentId(agentId);
    setKagentBootstrapping(false);
  };

  const bootstrapInitialSession = async (agentId: string) => {
    const a = agentLookup[agentId];
    if (!a) return;

    if (agentId === K8S_OPS_ID && k8sKagent) {
      await createRemoteK8sSession(agentId);
      return;
    }

    createLocalSession(agentId);
  };

  const createSession = (agentId: string) => {
    if (agentId === K8S_OPS_ID && k8sKagent) {
      void createRemoteK8sSession(agentId);
      return;
    }
    createLocalSession(agentId);
  };

  const handleSend = async (text?: string) => {
    const content = text || input.trim();
    if (!content || !activeSessionId) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    };
    const sid = activeSessionId;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sid ? { ...s, messages: [...s.messages, userMsg], updatedAt: userMsg.timestamp } : s
      )
    );
    setInput("");

    if (selectedAgentId === K8S_OPS_ID && k8sKagent) {
      if (!sid.startsWith("ctx-")) {
        toast.error("当前会话不是有效的 Kagent 会话，请新建对话。");
        return;
      }
      streamAbortRef.current?.abort();
      const ac = new AbortController();
      streamAbortRef.current = ac;

      const agentMsgId = `agent-${Date.now()}`;
      const ts = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
      const placeholder: Message = {
        id: agentMsgId,
        role: "agent",
        content: "正在连接 Kagent…",
        timestamp: ts,
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sid ? { ...s, messages: [...s.messages, placeholder], updatedAt: ts } : s
        )
      );

      // 重置流式状态
      setStreamingState({ state: "submitted", message: "正在提交任务..." });

      await streamKagentMessage(
        sid,
        content,
        {
          onAgentText: (t, _done) => {
            setSessions((prev) =>
              prev.map((s) => {
                if (s.id !== sid) return s;
                return {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === agentMsgId
                      ? { ...m, content: t || m.content, streamingStatus: undefined }
                      : m
                  ),
                  updatedAt: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
                };
              })
            );
          },
          onStatusUpdate: (status, state) => {
            // 更新流式状态，显示在消息上方
            const statusText = status || getStateDisplayText(state);
            if (statusText || state) {
              setStreamingState({ state, message: statusText });
              setSessions((prev) =>
                prev.map((s) => {
                  if (s.id !== sid) return s;
                  return {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === agentMsgId
                        ? { ...m, streamingStatus: { state, message: statusText } }
                        : m
                    ),
                  };
                })
              );
            }
          },
          onTaskUpdate: (message, kind) => {
            // 任务事件：更新流式状态
            if (message) {
              setStreamingState((prev) => ({ ...prev, message }));
            }
          },
          onTaskStatusUpdate: (status, state, isFinal) => {
            // task_status_update 事件：更新流式状态
            const statusText = status || getStateDisplayText(state);
            if (statusText || state) {
              setStreamingState({ state, message: statusText, isFinal });
              setSessions((prev) =>
                prev.map((s) => {
                  if (s.id !== sid) return s;
                  return {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === agentMsgId
                        ? { ...m, streamingStatus: { state, message: statusText, isFinal } }
                        : m
                    ),
                  };
                })
              );
            }
            if (isFinal) {
              setStreamingState(null);
              setActiveToolCalls([]);
            }
          },
          onToolCall: (toolCall) => {
            // MCP 工具调用状态更新
            setActiveToolCalls((prev) => {
              const existing = prev.findIndex((t) => t.name === toolCall.name);
              if (existing >= 0) {
                // 更新现有工具状态
                const updated = [...prev];
                updated[existing] = { ...updated[existing], ...toolCall };
                return updated;
              }
              // 添加新工具
              return [...prev, toolCall];
            });

            // 同时更新消息中的工具调用状态
            setSessions((prev) =>
              prev.map((s) => {
                if (s.id !== sid) return s;
                return {
                  ...s,
                  messages: s.messages.map((m) => {
                    if (m.id !== agentMsgId) return m;
                    const existingTools = m.toolCalls || [];
                    const existingIndex = existingTools.findIndex((t) => t.name === toolCall.name);
                    let updatedTools;
                    if (existingIndex >= 0) {
                      updatedTools = [...existingTools];
                      updatedTools[existingIndex] = { ...updatedTools[existingIndex], ...toolCall };
                    } else {
                      updatedTools = [...existingTools, toolCall];
                    }
                    return { ...m, toolCalls: updatedTools };
                  }),
                };
              })
            );
          },
          onError: (err) => {
            toast.error(err.message);
            setStreamingState(null);
            setActiveToolCalls([]);
            setSessions((prev) =>
              prev.map((s) => {
                if (s.id !== sid) return s;
                return {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === agentMsgId
                      ? { ...m, content: `请求失败：${err.message}`, streamingStatus: undefined, toolCalls: undefined }
                      : m
                  ),
                };
              })
            );
          },
        },
        ac.signal
      );
      // 流式结束后清除状态
      setStreamingState(null);
      setActiveToolCalls([]);
      return;
    }

    setTimeout(() => {
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: `正在处理你的请求："${content}"...\n\n已为你完成处理。如果需要更多帮助，请继续提问。`,
        timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sid ? { ...s, messages: [...s.messages, agentMsg], updatedAt: agentMsg.timestamp } : s
        )
      );
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  if (!agent || !activeSessionId) {
    // 如果没有选择 Agent，重定向到 Landing Page
    navigate("/chat");
    return null;
  }

  // ==================== CHAT VIEW ====================
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Session sidebar */}
      <div className="w-56 border-r border-border/50 flex-col flex-shrink-0 hidden md:flex">
        <div className="p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between gap-2 h-9 text-sm">
                <span className="flex items-center gap-2 truncate">
                  <span>{agent.emoji}</span>
                  <span className="truncate">{agent.name}</span>
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 max-h-80 overflow-y-auto">
              <DropdownMenuLabel className="text-xs text-muted-foreground">平台 Agent</DropdownMenuLabel>
              {platform.map((a) => (
                <DropdownMenuItem key={a.id} onClick={() => selectAgent(a.id)} className="gap-2">
                  <span>{a.emoji}</span><span>{a.name}</span>
                </DropdownMenuItem>
              ))}
              {mine.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground">我的 Agent</DropdownMenuLabel>
                  {mine.map((a) => (
                    <DropdownMenuItem key={a.id} onClick={() => selectAgent(a.id)} className="gap-2">
                      <span>{a.emoji}</span><span>{a.name}</span>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="p-3 pt-0">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground h-8" onClick={() => createSession(selectedAgentId)}>
            <Plus className="h-3.5 w-3.5" /> 新建对话
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => { setActiveSessionId(s.id); setSelectedAgentId(s.agentId); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate ${
                s.id === activeSessionId ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs">{agentLookup[s.agentId]?.emoji}</span>
                <span className="truncate">{s.title}</span>
              </div>
              <p className="text-xs text-muted-foreground/60 mt-0.5">{s.updatedAt}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/50 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${'gradient' in agent ? agent.gradient : 'from-primary/20 to-primary/5'} flex items-center justify-center text-xl flex-shrink-0`}>
              {agent.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">{agent.name}</h2>
                <Badge variant="secondary" className="text-xs">{agent.type === "platform" ? "平台" : "我的"}</Badge>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-emerald-500 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 在线
                </span>
                {'capabilities' in agent && agent.capabilities && (
                  <span className="text-xs text-muted-foreground hidden lg:inline">
                    · {agent.capabilities.slice(0, 3).join(" · ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                  切换 <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
                <DropdownMenuLabel className="text-xs text-muted-foreground">平台 Agent</DropdownMenuLabel>
                {platform.map((a) => (
                  <DropdownMenuItem key={a.id} onClick={() => selectAgent(a.id)} className="gap-2">
                    <span>{a.emoji}</span><span>{a.name}</span>
                  </DropdownMenuItem>
                ))}
                {mine.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-muted-foreground">我的 Agent</DropdownMenuLabel>
                    {mine.map((a) => (
                      <DropdownMenuItem key={a.id} onClick={() => selectAgent(a.id)} className="gap-2">
                        <span>{a.emoji}</span><span>{a.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto space-y-4 max-w-full">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user" ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"
                  }`}>
                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`max-w-[95%] space-y-1 ${msg.role === "user" ? "items-end" : ""}`}>
                    {/* 流式状态指示器 */}
                    {msg.streamingStatus && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <motion.span
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary"
                        >
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                          {msg.streamingStatus.message || getStateDisplayText(msg.streamingStatus.state) || "处理中..."}
                        </motion.span>
                      </div>
                    )}
                    {/* MCP 工具调用状态 */}
                    {msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="flex flex-col gap-2 mb-2">
                        {msg.toolCalls.map((tool, idx) => (
                          <motion.div
                            key={`${tool.name}-${idx}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex flex-col gap-1 px-3 py-2 rounded-lg text-xs border ${
                              tool.status === "error"
                                ? "bg-red-500/10 border-red-500/20 text-red-600"
                                : tool.status === "complete"
                                ? "bg-green-500/10 border-green-500/20 text-green-600"
                                : "bg-amber-500/10 border-amber-500/20 text-amber-600"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {tool.status === "running" || tool.status === "start" ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : tool.status === "complete" ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : tool.status === "error" ? (
                                <XCircle className="h-3 w-3" />
                              ) : (
                                <Wrench className="h-3 w-3" />
                              )}
                              <span className="font-medium">{tool.name}</span>
                              {tool.status === "running" && (
                                <span className="text-amber-600/70">执行中...</span>
                              )}
                              {tool.status === "complete" && (
                                <span className="text-green-600/70">已完成</span>
                              )}
                              {tool.status === "error" && (
                                <span className="text-red-600/70">失败</span>
                              )}
                            </div>
                            {/* 显示工具参数 */}
                            {tool.args && Object.keys(tool.args).length > 0 && (
                              <div className="mt-1 pl-5 text-[10px] opacity-80 font-mono">
                                {Object.entries(tool.args).map(([key, value]) => (
                                  <span key={key} className="mr-2">
                                    {key}: {String(value)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-md" : "bg-secondary/60 text-foreground rounded-tl-md"
                    }`}>
                      {msg.role === "user" ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <ChatMarkdown content={msg.content} variant="agent" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground/50 px-1">{msg.timestamp}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick commands */}
        {agent.quickCommands && agent.quickCommands.length > 0 && (
          <div className="px-4 pb-2">
            <div className="mx-auto flex flex-wrap gap-2 max-w-full">
              {agent.quickCommands.map((cmd) => (
                <button key={cmd} onClick={() => void handleSend(cmd)} className="text-xs px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input - Open WebUI style */}
        <div className="px-4 pb-4 pt-2">
          <div className="mx-auto max-w-full">
            <div className="relative rounded-2xl bg-card border border-border/60 shadow-sm focus-within:border-primary/40 focus-within:shadow-md focus-within:shadow-primary/[0.05] transition-all duration-300">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`向 ${agent.name} 提问...`}
                rows={1}
                className="w-full resize-none bg-transparent px-5 pt-3.5 pb-12 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none min-h-[52px] max-h-[200px]"
              />
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-1">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80">
                    <Globe className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80">
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={() => void handleSend()}
                  disabled={!input.trim() || kagentBootstrapping}
                  size="icon"
                  className="h-8 w-8 rounded-lg bg-foreground text-background hover:bg-foreground/90 disabled:opacity-20 transition-all"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground/50 text-center mt-2">
              Enter 发送 · Shift + Enter 换行
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSessionPage;
