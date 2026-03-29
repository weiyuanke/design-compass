import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Bot, User, Plus, ChevronDown, MessageSquare, Sparkles, Zap, Shield, TrendingUp, Brain } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "react-router-dom";
import { getAllChatAgents, platformAgents } from "@/data/agents";
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

// 智能路由：根据问题内容匹配最合适的 Agent
const routeToAgent = (question: string): string | null => {
  const q = question.toLowerCase();

  // 关键词匹配规则
  const rules: { keywords: string[]; agentId: string }[] = [
    { keywords: ["k8s", "kubernetes", "集群", "pod", "节点", "运维", "诊断"], agentId: "k8s-ops" },
    { keywords: ["jira", "项目", "会议", "需求", "周报", "进度"], agentId: "project-mgr" },
    { keywords: ["ask", "离线任务", "虚拟机", "日志"], agentId: "ask-support" },
    { keywords: ["请假", "报销", "行政", "证明"], agentId: "admin-helper" },
    { keywords: ["研报", "报告", "分析", "解读", "目标价", "盈利预测"], agentId: "report-analyzer" },
    { keywords: ["舆情", "新闻", "情绪", "监控", "告警", "交易信号"], agentId: "sentinel" },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((k) => q.includes(k))) {
      return rule.agentId;
    }
  }

  // 如果没有匹配到，返回第一个平台 Agent 作为默认
  return platform.length > 0 ? platform[0].id : null;
};

const ChatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialAgentId = searchParams.get("agent") || searchParams.get("tool") || "";

  const [selectedAgentId, setSelectedAgentId] = useState<string>(initialAgentId);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isRouting, setIsRouting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agent = selectedAgentId ? agentLookup[selectedAgentId] : null;
  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  // 如果没有有效的 agent，回到首页
  if (selectedAgentId && !agent) {
    console.error('Agent not found for:', selectedAgentId);
    setSelectedAgentId('');
    setActiveSessionId(null);
  }

  // 调试日志
  useEffect(() => {
    console.log('ChatPage Debug:', {
      selectedAgentId,
      activeSessionId,
      hasAgent: !!agent,
      agentName: agent?.name,
      sessionsCount: sessions.length,
      platformCount: platform.length,
      mineCount: mine.length,
    });
  }, [selectedAgentId, activeSessionId, agent, sessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 初始化：如果 URL 有 agent 参数且没有会话，创建会话
  useEffect(() => {
    if (initialAgentId && agentLookup[initialAgentId] && !activeSessionId) {
      createSession(initialAgentId);
    }
  }, [initialAgentId]);

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
          content: `你好！我是${a.name}，${a.description}。有什么可以帮你的吗？`,
          timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setSelectedAgentId(agentId);
  };

  // 智能发送：根据问题内容自动路由到合适的 Agent
  const handleSmartSend = () => {
    const content = input.trim();
    if (!content) return;

    setIsRouting(true);

    // 智能路由到最合适的 Agent
    const matchedAgentId = routeToAgent(content);

    setTimeout(() => {
      if (matchedAgentId) {
        // 检查是否已有该 Agent 的会话
        let existingSession = sessions.find((s) => s.agentId === matchedAgentId);

        if (!existingSession) {
          // 创建新会话
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

        // 添加用户消息
        const userMsg: Message = {
          id: Date.now().toString(),
          role: "user",
          content,
          timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === existingSession!.id
              ? { ...s, messages: [...s.messages, userMsg], updatedAt: userMsg.timestamp }
              : s
          )
        );

        // 模拟 Agent 响应
        setTimeout(() => {
          const agentMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "agent",
            content: `收到你的问题："${content}"\n\n正在为你处理...`,
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
        content: `正在处理你的请求："${content}"...\n\n已为你完成处理。如果需要更多帮助，请继续提问。`,
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

  // Landing: no agent selected - Open WebUI Style
  if (!activeSessionId) {
    return (
      <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 max-w-3xl"
          >
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
              你好，今天有什么可以帮你的？
            </h1>
            <p className="text-muted-foreground text-sm">
              与 Master Agent 对话，或通过 @Agent 调用专业 Agent
            </p>
          </motion.div>

          {/* Input Box - Open WebUI Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full max-w-3xl"
          >
            <div className="relative">
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-card border border-border/50 shadow-lg focus-within:border-primary/30 focus-within:shadow-xl focus-within:shadow-primary/5 transition-all">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSmartSend();
                    }
                  }}
                  placeholder="输入你的问题..."
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-auto text-base resize-none"
                  disabled={isRouting}
                  autoFocus
                />
                <Button
                  onClick={handleSmartSend}
                  disabled={!input.trim() || isRouting}
                  className="h-9 w-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 flex-shrink-0"
                >
                  {isRouting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Example Suggestions - Open WebUI Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-6">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => setInput("帮我分析今日舆情")}
                className="group flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all text-left"
              >
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">分析今日舆情</p>
                  <p className="text-xs text-muted-foreground truncate">实时监控 · 情绪分析</p>
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                onClick={() => setInput("诊断集群问题")}
                className="group flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all text-left"
              >
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Zap className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">诊断集群问题</p>
                  <p className="text-xs text-muted-foreground truncate">K8s · 故障排查</p>
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => setInput("生成本周工作汇总")}
                className="group flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all text-left"
              >
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <MessageSquare className="h-4 w-4 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">生成工作汇总</p>
                  <p className="text-xs text-muted-foreground truncate">周报 · 项目管理</p>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Agent Grid */}
        <div className="flex-1 px-6 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Platform Agents */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">平台 Agent</h2>
                <Badge variant="secondary" className="ml-2">{platform.length} 个可用</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {platform.map((a, i) => (
                  <motion.button
                    key={a.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => selectAgent(a.id)}
                    className="group text-left p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4 mb-3">
                      <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        {a.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{a.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{a.category}</Badge>
                          <span className="text-xs text-muted-foreground">{(a.calls / 1000).toFixed(1)}k 次调用</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 h-8">{a.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {a.capabilities?.slice(0, 3).map((cap) => (
                        <span key={cap} className="text-xs px-2 py-1 rounded-md bg-secondary/50 text-secondary-foreground">
                          {cap}
                        </span>
                      ))}
                    </div>
                    {a.expertise && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-emerald-500 flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {a.expertise}
                        </p>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* My Agents */}
            {mine.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  <h2 className="text-lg font-semibold text-foreground">我的 Agent</h2>
                  <Badge variant="secondary" className="ml-2">{mine.length} 个可用</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {mine.map((a, i) => (
                    <motion.button
                      key={a.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => selectAgent(a.id)}
                      className="group text-left p-5 rounded-2xl bg-card border border-border/50 hover:border-accent/50 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          {a.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate group-hover:text-accent transition-colors">{a.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${agent.gradient || 'from-primary/20 to-primary/5'} flex items-center justify-center text-xl flex-shrink-0`}>
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
                {agent.capabilities && (
                  <span className="text-xs text-muted-foreground hidden lg:inline">
                    · {agent.capabilities.slice(0, 3).join(" · ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mobile agent switcher */}
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
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user" ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"
                }`}>
                  {msg.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                <div className={`max-w-[75%] space-y-1 ${msg.role === "user" ? "items-end" : ""}`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user" ? "bg-primary/15 text-foreground rounded-tr-md" : "bg-secondary/60 text-foreground rounded-tl-md"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground/50 px-1">{msg.timestamp}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Quick commands */}
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {agent.quickCommands?.map((cmd) => (
              <button key={cmd} onClick={() => handleSend(cmd)} className="text-xs px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2 p-2 rounded-xl bg-secondary/40 border border-border/50 focus-within:border-primary/30 transition-colors">
            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8 flex-shrink-0">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`向 ${agent.name} 提问...`}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-8 text-sm"
            />
            <Button type="submit" size="icon" disabled={!input.trim()} className="h-8 w-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 flex-shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
