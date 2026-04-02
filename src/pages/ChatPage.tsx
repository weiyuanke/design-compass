import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Bot, User, Plus, ChevronDown, MessageSquare, Sparkles, Zap, Shield, TrendingUp, Brain, Globe, Mic, ArrowUp, Hash, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useSearchParams, useNavigate } from "react-router-dom";
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

const routeToAgent = (question: string): string | null => {
  const q = question.toLowerCase();
  const rules: { keywords: string[]; agentId: string }[] = [
    { keywords: ["k8s", "kubernetes", "集群", "pod", "节点", "运维", "诊断"], agentId: "k8s-ops" },
    { keywords: ["jira", "项目", "会议", "需求", "周报", "进度"], agentId: "project-mgr" },
    { keywords: ["ask", "离线任务", "虚拟机", "日志"], agentId: "ask-support" },
    { keywords: ["请假", "报销", "行政", "证明"], agentId: "admin-helper" },
    { keywords: ["研报", "报告", "分析", "解读", "目标价", "盈利预测"], agentId: "report-analyzer" },
    { keywords: ["舆情", "新闻", "情绪", "监控", "告警", "交易信号"], agentId: "sentinel" },
  ];
  for (const rule of rules) {
    if (rule.keywords.some((k) => q.includes(k))) return rule.agentId;
  }
  return platform.length > 0 ? platform[0].id : null;
};

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

const ChatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialAgentId = searchParams.get("agent") || searchParams.get("tool") || "";

  const [selectedAgentId, setSelectedAgentId] = useState<string>(initialAgentId);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isRouting, setIsRouting] = useState(false);
  const [kagentBootstrapping, setKagentBootstrapping] = useState(false);
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
  }, []);

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

  const handleSmartSend = () => {
    const content = input.trim();
    if (!content) return;

    // Navigate to conversation detail page with the message
    const agentParam = selectedAgentId ? `?agent=${selectedAgentId}` : '';
    navigate(`/conversation${agentParam}`, { state: { initialMessage: content } });
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
                    m.id === agentMsgId ? { ...m, content: t || m.content } : m
                  ),
                  updatedAt: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
                };
              })
            );
          },
          onError: (err) => {
            toast.error(err.message);
            setSessions((prev) =>
              prev.map((s) => {
                if (s.id !== sid) return s;
                return {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === agentMsgId ? { ...m, content: `请求失败：${err.message}` } : m
                  ),
                };
              })
            );
          },
        },
        ac.signal
      );
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
      if (!agent || !activeSessionId) {
        handleSmartSend();
      } else {
        void handleSend();
      }
    }
  };

  // Suggestion chips for landing page
  const suggestions = [
    { icon: <Sparkles className="h-3.5 w-3.5" />, text: "帮我分析今日舆情动态" },
    { icon: <Zap className="h-3.5 w-3.5" />, text: "诊断 K8s 集群异常" },
    { icon: <MessageSquare className="h-3.5 w-3.5" />, text: "生成本周工作汇总" },
    { icon: <Shield className="h-3.5 w-3.5" />, text: "帮我提交一个请假申请" },
  ];

  // ==================== LANDING PAGE ====================
  if (!agent || !activeSessionId) {
    return (
      <div className="flex flex-col h-[calc(100vh-3.5rem)] items-center justify-center relative overflow-hidden">
        {/* Background subtle pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent pointer-events-none" />

        {/* Main content - vertically centered */}
        <div className="w-full max-w-3xl mx-auto px-6 space-y-8 -mt-16">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              有什么可以帮你的？
            </h1>
            <p className="text-muted-foreground text-sm">
              输入问题自动匹配专家 Agent，或选择下方 Agent 开始对话
            </p>
          </motion.div>

          {/* Input container - Open WebUI style */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative rounded-2xl bg-card border border-border/60 shadow-lg shadow-primary/[0.03] focus-within:border-primary/40 focus-within:shadow-primary/[0.08] transition-all duration-300">
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入任何问题..."
                rows={1}
                disabled={isRouting}
                className="w-full resize-none bg-transparent px-5 pt-4 pb-14 text-sm md:text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none min-h-[56px] max-h-[200px]"
              />

              {/* Bottom toolbar */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2.5">
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
                  onClick={handleSmartSend}
                  disabled={!input.trim() || isRouting || kagentBootstrapping}
                  size="icon"
                  className="h-8 w-8 rounded-lg bg-foreground text-background hover:bg-foreground/90 disabled:opacity-20 transition-all"
                >
                  {isRouting ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Sparkles className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Suggestion chips */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => { setInput(s.text); textareaRef.current?.focus(); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/60 bg-card/50 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-card transition-all duration-200"
              >
                {s.icon}
                {s.text}
              </button>
            ))}
          </motion.div>

          {/* Agent grid - compact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-medium text-muted-foreground">选择 Agent 开始对话</h2>
              <div className="flex-1 h-px bg-border/50" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {platform.slice(0, 6).map((a, i) => (
                <motion.button
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.04 }}
                  onClick={() => selectAgent(a.id)}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-card/60 border border-border/40 hover:border-primary/40 hover:bg-card hover:shadow-md transition-all duration-200 text-left"
                >
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    {a.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{a.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{a.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
            {mine.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-medium text-muted-foreground">我的 Agent</h2>
                  <div className="flex-1 h-px bg-border/50" />
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {mine.map((a, i) => (
                    <motion.button
                      key={a.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.04 }}
                      onClick={() => selectAgent(a.id)}
                      className="group flex items-center gap-3 p-3 rounded-xl bg-card/60 border border-border/40 hover:border-accent/40 hover:bg-card hover:shadow-md transition-all duration-200 text-left"
                    >
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                        {a.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">{a.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{a.description}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
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
          <div className="max-w-3xl mx-auto space-y-4">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user" ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"
                  }`}>
                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`max-w-[75%] space-y-1 ${msg.role === "user" ? "items-end" : ""}`}>
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
            <div className="max-w-3xl mx-auto flex flex-wrap gap-2">
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
          <div className="max-w-3xl mx-auto">
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

export default ChatPage;
