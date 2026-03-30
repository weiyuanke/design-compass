import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Bot, User, Plus, ChevronDown, Sparkles, Globe, Mic, ArrowUp, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { getAllChatAgents } from "@/data/agents";
import { AgentHubPanel } from "@/components/AgentHubPanel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
  invokedAgents?: string[];
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
const agentHubId = "agent-hub";

const routeToAgents = (question: string): string[] => {
  const q = question.toLowerCase();

  const multiAgentPatterns = [
    { patterns: ["分析", "并", "生成报告", "汇总", "综合"], agents: ["sentinel", "report-analyzer", "project-mgr"] },
    { patterns: ["诊断", "并", "创建", "工单", "jira"], agents: ["k8s-ops", "project-mgr"] },
    { patterns: ["监控", "并", "通知", "告警"], agents: ["sentinel", "admin-helper"] },
  ];

  for (const pattern of multiAgentPatterns) {
    if (pattern.patterns.every((p) => q.includes(p))) {
      return pattern.agents;
    }
  }

  const rules: { keywords: string[]; agentId: string }[] = [
    { keywords: ["k8s", "kubernetes", "集群", "pod", "节点", "运维", "诊断"], agentId: "k8s-ops" },
    { keywords: ["jira", "项目", "会议", "需求", "周报", "进度"], agentId: "project-mgr" },
    { keywords: ["ask", "离线任务", "虚拟机", "日志"], agentId: "ask-support" },
    { keywords: ["请假", "报销", "行政", "证明"], agentId: "admin-helper" },
    { keywords: ["研报", "报告", "分析", "解读", "目标价", "盈利预测"], agentId: "report-analyzer" },
    { keywords: ["舆情", "新闻", "情绪", "监控", "告警", "交易信号"], agentId: "sentinel" },
  ];
  for (const rule of rules) {
    if (rule.keywords.some((k) => q.includes(k))) return [rule.agentId];
  }
  return [];
};

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

const ConversationDetailPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialAgentId = searchParams.get("agent") || agentHubId;
  const initialMessage = (location.state as { initialMessage?: string })?.initialMessage;

  const [selectedAgentId, setSelectedAgentId] = useState<string>(initialAgentId);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isRouting, setIsRouting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useAutoResize(input);

  const agent = selectedAgentId ? agentLookup[selectedAgentId] : null;
  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = useMemo(() => activeSession?.messages || [], [activeSession?.messages]);
  const isAgentHubMode = selectedAgentId === agentHubId;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (sessions.length === 0) {
      createSession(agentHubId);
      // If there's an initial message from navigation, send it
      if (initialMessage) {
        setTimeout(() => {
          setInput(initialMessage);
          handleSmartSend(initialMessage);
        }, 100);
      }
    }
  }, [sessions.length]);

  const selectAgent = (agentId: string) => {
    setSelectedAgentId(agentId);
    setSearchParams({ agent: agentId });
    createSession(agentId);
  };

  const createSession = (agentId: string) => {
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
          content: agentId === agentHubId
            ? `你好！我是${a.name}，${a.description}。你可以直接向我描述复杂任务，我会智能协调各专业 Agent 帮你完成。`
            : `你好！我是${a.name}，${a.description}。有什么可以帮你的吗？`,
          timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setSelectedAgentId(agentId);
  };

  const handleSmartSend = (content?: string) => {
    const text = content || input.trim();
    if (!text) return;
    setIsRouting(true);

    if (isAgentHubMode) {
      const invokedAgentIds = routeToAgents(text);

      setTimeout(() => {
        if (!activeSessionId) {
          createSession(agentHubId);
          return;
        }

        const userMsg: Message = {
          id: Date.now().toString(),
          role: "user",
          content: text,
          timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        };
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: [...s.messages, userMsg], updatedAt: userMsg.timestamp }
              : s
          )
        );
        setInput("");

        setTimeout(() => {
          let agentContent = `收到你的任务："${text}"\n\n`;

          if (invokedAgentIds.length > 1) {
            agentContent += `🔄 正在协调多个 Agent 协作处理：\n`;
            invokedAgentIds.forEach((id) => {
              const a = agentLookup[id];
              if (a) agentContent += `  • ${a.name}\n`;
            });
            agentContent += `\n请稍候，正在聚合结果...`;
          } else if (invokedAgentIds.length === 1) {
            const a = agentLookup[invokedAgentIds[0]];
            agentContent += `📋 已委派给专家：${a?.name}\n\n正在处理中...`;
          } else {
            agentContent += `正在为你处理...`;
          }

          const agentMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "agent",
            content: agentContent,
            timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
            invokedAgents: invokedAgentIds,
          };
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? { ...s, messages: [...s.messages, agentMsg], updatedAt: agentMsg.timestamp }
                : s
            )
          );
          setIsRouting(false);

          if (invokedAgentIds.length > 0) {
            setTimeout(() => {
              const finalMsg: Message = {
                id: (Date.now() + 2).toString(),
                role: "agent",
                content: `✅ 任务已完成！\n\n已综合以下 Agent 的分析结果：\n${invokedAgentIds.map((id) => `• ${agentLookup[id]?.name}`).join("\n")}\n\n如需查看详细报告或继续处理，请告诉我。`,
                timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
              };
              setSessions((prev) =>
                prev.map((s) =>
                  s.id === activeSessionId
                    ? { ...s, messages: [...s.messages, finalMsg], updatedAt: finalMsg.timestamp }
                    : s
                )
              );
            }, 2000);
          }
        }, 600);
      }, 300);
      return;
    }

    const matchedAgentId = routeToAgents(text)[0] || selectedAgentId;
    setTimeout(() => {
      if (matchedAgentId) {
        let existingSession = sessions.find((s) => s.agentId === matchedAgentId);
        if (!existingSession) {
          const a = agentLookup[matchedAgentId];
          if (!a) return;
          const newSession: Session = {
            id: Date.now().toString(),
            agentId: matchedAgentId,
            title: `与 ${a.name} 的对话`,
            updatedAt: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
            messages: [],
          };
          setSessions((prev) => [newSession, ...prev]);
          existingSession = newSession;
        }
        setActiveSessionId(existingSession.id);
        setSelectedAgentId(matchedAgentId);
        setSearchParams({ agent: matchedAgentId });
        setInput("");
        setIsRouting(false);

        const userMsg: Message = {
          id: Date.now().toString(),
          role: "user",
          content: text,
          timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        };
        setSessions((prev) =>
          prev.map((s) =>
            s.id === existingSession!.id
              ? { ...s, messages: [...s.messages, userMsg], updatedAt: userMsg.timestamp }
              : s
          )
        );
        setTimeout(() => {
          const agentMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "agent",
            content: `收到你的问题："${text}"\n\n正在为你处理...`,
            timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
          };
          setSessions((prev) =>
            prev.map((s) =>
              s.id === existingSession!.id
                ? { ...s, messages: [...s.messages, agentMsg], updatedAt: agentMsg.timestamp }
                : s
            )
          );
        }, 600);
      }
    }, 500);
  };

  const handleSend = (text?: string) => {
    const content = text || input.trim();
    if (!content || !activeSessionId) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    };
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [...s.messages, userMsg], updatedAt: userMsg.timestamp }
          : s
      )
    );
    setInput("");

    setTimeout(() => {
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: isAgentHubMode
          ? `收到你的任务："${content}"\n\n正在协调相关 Agent 处理，请稍候...`
          : `正在处理你的请求："${content}"...\n\n已为你完成处理。如果需要更多帮助，请继续提问。`,
        timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, agentMsg], updatedAt: agentMsg.timestamp }
            : s
        )
      );
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isAgentHubMode && !activeSessionId) {
        handleSmartSend();
      } else if (agent && activeSessionId) {
        handleSend();
      }
    }
  };

  if (isAgentHubMode && !activeSessionId) {
    return (
      <AgentHubPanel
        onSelectAgent={selectAgent}
        onSmartSend={handleSmartSend}
      />
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Session sidebar */}
      <div className="w-64 border-r border-border/50 flex-col flex-shrink-0 hidden md:flex">
        <div className="p-3 border-b border-border/50">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 mb-2"
            onClick={() => navigate('/chat')}
          >
            <ArrowLeft className="h-4 w-4" /> 返回对话首页
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between gap-2 h-9 text-sm">
                <span className="flex items-center gap-2 truncate">
                  <span>{agent?.emoji || "🎯"}</span>
                  <span className="truncate">{agent?.name || "Agent Hub"}</span>
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 max-h-80 overflow-y-auto">
              <DropdownMenuItem
                onClick={() => { setSelectedAgentId(agentHubId); setSearchParams({}); setSessions([]); setActiveSessionId(null); }}
                className="gap-2"
              >
                <span>🎯</span><span>Agent Hub</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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

        <div className="p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground h-8"
            onClick={() => isAgentHubMode ? createSession(agentHubId) : createSession(selectedAgentId)}
          >
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
                <span className="text-xs">{agentLookup[s.agentId]?.emoji || "🎯"}</span>
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
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${agent?.gradient || 'from-emerald-500/20 to-teal-500/5'} flex items-center justify-center text-xl flex-shrink-0`}>
              {agent?.emoji || "🎯"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">{agent?.name || "Agent Hub"}</h2>
                <Badge variant="secondary" className="text-xs">{isAgentHubMode ? "智能调度" : agent?.type === "platform" ? "平台" : "我的"}</Badge>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-emerald-500 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 在线
                </span>
                {agent?.capabilities && (
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
                <DropdownMenuItem
                  onClick={() => { setSelectedAgentId(agentHubId); setSearchParams({}); setSessions([]); setActiveSessionId(null); }}
                  className="gap-2"
                >
                  <span>🎯</span><span>Agent Hub</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.invokedAgents && msg.invokedAgents.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {msg.invokedAgents.map((id) => {
                            const a = agentLookup[id];
                            return a ? (
                              <Badge key={id} variant="outline" className="text-[10px]">
                                {a.emoji} {a.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
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
        {agent?.quickCommands && agent.quickCommands.length > 0 && (
          <div className="px-4 pb-2">
            <div className="max-w-3xl mx-auto flex flex-wrap gap-2">
              {agent.quickCommands.map((cmd) => (
                <button key={cmd} onClick={() => handleSend(cmd)} className="text-xs px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-4 pt-2">
          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-2xl bg-card border border-border/60 shadow-sm focus-within:border-primary/40 focus-within:shadow-md focus-within:shadow-primary/[0.05] transition-all duration-300">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isAgentHubMode ? "描述你的任务，我会协调 Agent 协作..." : `向 ${agent?.name} 提问...`}
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
                  onClick={() => isAgentHubMode ? handleSmartSend() : handleSend()}
                  disabled={!input.trim()}
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
            <p className="text-[11px] text-muted-foreground/50 text-center mt-2">
              {isAgentHubMode ? "Agent Hub 智能调度 · Enter 发送" : `与 ${agent?.name} 对话 · Enter 发送`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationDetailPage;
