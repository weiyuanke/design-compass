import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Paperclip,
  Bot,
  User,
  Plus,
  MessageSquare,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  Brain,
  Search,
  MoreVertical,
  Copy,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Share2,
  ChevronRight,
  ChevronLeft,
  X,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
  FileText,
  Code2,
} from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Message {
  id: string;
  role: "user" | "agent" | "system";
  content: string;
  timestamp: string;
  agentId?: string;
  agentName?: string;
  agentEmoji?: string;
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

  return platform.length > 0 ? platform[0].id : null;
};

// 模拟工具推荐
const getRecommendedTools = (agentId: string) => {
  const tools: Record<string, { icon: React.ReactNode; label: string; action: string }[]> = {
    "k8s-ops": [
      { icon: <FileText className="h-3.5 w-3.5" />, label: "查看监控", action: "monitor" },
      { icon: <Search className="h-3.5 w-3.5" />, label: "Pod 列表", action: "pods" },
      { icon: <Code2 className="h-3.5 w-3.5" />, label: "生成报告", action: "report" },
    ],
    "project-mgr": [
      { icon: <FileText className="h-3.5 w-3.5" />, label: "创建 Jira", action: "jira" },
      { icon: <Clock className="h-3.5 w-3.5" />, label: "查看进度", action: "progress" },
      { icon: <Code2 className="h-3.5 w-3.5" />, label: "生成周报", action: "report" },
    ],
    sentinel: [
      { icon: <FileText className="h-3.5 w-3.5" />, label: "今日舆情", action: "today" },
      { icon: <AlertCircle className="h-3.5 w-3.5" />, label: "告警列表", action: "alerts" },
      { icon: <TrendingUp className="h-3.5 w-3.5" />, label: "情绪分析", action: "sentiment" },
    ],
  };

  return tools[agentId] || [
    { icon: <Wrench className="h-3.5 w-3.5" />, label: "更多工具", action: "more" },
  ];
};

// 模拟追问建议
const getFollowUpSuggestions = (lastMessage: string, agentId: string): string[] => {
  const suggestions: Record<string, string[]> = {
    "k8s-ops": [
      "如何优化资源限制？",
      "查看节点详细信息",
      "生成诊断报告",
    ],
    "project-mgr": [
      "同步到 Jira",
      "邀请相关人员",
      "设置截止日期",
    ],
    sentinel: [
      "查看负面新闻详情",
      "生成情绪趋势图",
      "设置监控告警",
    ],
  };

  return suggestions[agentId] || ["了解更多", "继续深入", "换个话题"];
};

const ChatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialAgentId = searchParams.get("agent") || searchParams.get("tool") || "";

  const [selectedAgentId, setSelectedAgentId] = useState<string>(initialAgentId);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isRouting, setIsRouting] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agent = selectedAgentId ? agentLookup[selectedAgentId] : null;
  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (sessions.length === 0) {
      // 默认不创建会话，显示首页
    } else if (initialAgentId && agentLookup[initialAgentId] && !activeSessionId) {
      createSession(initialAgentId);
    }
  }, []);

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
          agentId: a.id,
          agentName: a.name,
          agentEmoji: a.emoji,
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setSelectedAgentId(agentId);
  };

  const handleSmartSend = () => {
    const content = input.trim();
    if (!content) return;

    setIsRouting(true);
    const matchedAgentId = routeToAgent(content);

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

        setTimeout(() => {
          const agentMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "agent",
            content: `收到你的问题："${content}"\n\n正在为你处理...`,
            timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
            agentId: agentLookup[matchedAgentId]?.id,
            agentName: agentLookup[matchedAgentId]?.name,
            agentEmoji: agentLookup[matchedAgentId]?.emoji,
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
        agentId: agent?.id,
        agentName: agent?.name,
        agentEmoji: agent?.emoji,
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

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // 首页模式（未选择 Agent）
  if (!activeSessionId) {
    return (
      <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto">
        <div className="bg-gradient-to-b from-primary/5 to-transparent px-6 py-12">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
            >
              <Brain className="h-4 w-4" />
              <span>智能路由，自动匹配专家 Agent</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold text-foreground"
            >
              有什么可以帮你的？
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto"
            >
              输入问题，系统将自动为你匹配最合适的专家 Agent
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl mx-auto mt-8"
            >
              <div className="flex items-center gap-2 p-2 rounded-xl bg-card border border-border/50 shadow-lg shadow-primary/5 focus-within:border-primary/30 focus-within:shadow-primary/10 transition-all">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSmartSend();
                    }
                  }}
                  placeholder="例如：帮我分析今日舆情、诊断集群问题、生成本周工作汇总..."
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-auto text-sm"
                  disabled={isRouting}
                />
                <Button
                  onClick={handleSmartSend}
                  disabled={!input.trim() || isRouting}
                  className="h-9 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 flex-shrink-0"
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

              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors py-2 px-3 text-xs"
                  onClick={() => setInput("帮我分析今日舆情")}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  分析今日舆情
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors py-2 px-3 text-xs"
                  onClick={() => setInput("诊断集群问题")}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  诊断集群问题
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors py-2 px-3 text-xs"
                  onClick={() => setInput("生成本周工作汇总")}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  生成工作汇总
                </Badge>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="flex-1 px-6 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
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

  const currentAgent = agent;
  const recommendedTools = getRecommendedTools(currentAgent?.id || "");
  const followUpSuggestions = messages.length > 0
    ? getFollowUpSuggestions(messages[messages.length - 1].content, currentAgent?.id || "")
    : [];

  // 对话详情页（方案三）
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* 左侧会话列表（窄栏） */}
      <div className="w-16 border-r border-border/50 flex-col flex-shrink-0 hidden md:flex bg-card/30">
        <div className="p-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 mx-auto"
                  onClick={() => createSession(selectedAgentId)}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">新建对话</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1">
            {sessions.map((s) => (
              <TooltipProvider key={s.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => { setActiveSessionId(s.id); setSelectedAgentId(s.agentId); }}
                      className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${
                        s.id === activeSessionId
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <span className="text-xl">{agentLookup[s.agentId]?.emoji}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="text-sm font-medium">{s.title}</div>
                    <div className="text-xs text-muted-foreground">{s.updatedAt}</div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* 中间对话区域 */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* 顶部信息栏 */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border/50 bg-card/80 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${currentAgent?.gradient || 'from-primary/20 to-primary/5'} flex items-center justify-center text-2xl flex-shrink-0 shadow-lg`}>
              {currentAgent?.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">{currentAgent?.name}</h2>
                <Badge variant="secondary" className="text-xs">{currentAgent?.type === "platform" ? "平台" : "我的"}</Badge>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-emerald-500 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> 在线
                </span>
                {currentAgent?.capabilities && (
                  <div className="hidden lg:flex items-center gap-1">
                    {currentAgent.capabilities.slice(0, 3).map((cap, i) => (
                      <span key={i} className="text-xs text-muted-foreground">
                        {i > 0 && "·"} {cap}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Agent 切换 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Bot className="h-4 w-4" />
                  <span className="hidden sm:inline">切换 Agent</span>
                  <ChevronRight className="h-3.5 w-3.5 rotate-90" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
                <DropdownMenuLabel className="text-xs text-muted-foreground">平台 Agent</DropdownMenuLabel>
                {platform.map((a) => (
                  <DropdownMenuItem key={a.id} onClick={() => selectAgent(a.id)} className="gap-2 cursor-pointer">
                    <span>{a.emoji}</span><span>{a.name}</span>
                  </DropdownMenuItem>
                ))}
                {mine.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-muted-foreground">我的 Agent</DropdownMenuLabel>
                    {mine.map((a) => (
                      <DropdownMenuItem key={a.id} onClick={() => selectAgent(a.id)} className="gap-2 cursor-pointer">
                        <span>{a.emoji}</span><span>{a.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6" />

            {/* 右侧面板切换 */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowRightPanel(!showRightPanel)}
                    className={showRightPanel ? "bg-primary/10 text-primary" : ""}
                  >
                    {showRightPanel ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronLeft className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showRightPanel ? "收起面板" : "展开详情"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" /> 分享对话
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" /> 导出记录
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  清空对话
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 消息列表 */}
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onMouseEnter={() => setHoveredMessageId(msg.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                  className={`group flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user"
                      ? "bg-accent/15 text-accent"
                      : `bg-gradient-to-br ${currentAgent?.gradient || 'from-primary/20 to-primary/5'} text-primary`
                  }`}>
                    {msg.role === "user" ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <span className="text-lg">{msg.agentEmoji || currentAgent?.emoji}</span>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 max-w-[75%] ${msg.role === "user" ? "flex flex-col items-end" : ""}`}>
                    {/* Name & Time */}
                    <div className={`flex items-center gap-2 mb-1 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      <span className="text-xs font-medium text-foreground">
                        {msg.role === "user" ? "你" : msg.agentName || currentAgent?.name}
                      </span>
                      <span className="text-xs text-muted-foreground/50">{msg.timestamp}</span>
                    </div>

                    {/* Bubble */}
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary/15 text-foreground rounded-tr-md"
                        : "bg-card border border-border/50 text-foreground rounded-tl-md shadow-sm"
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {/* Message Actions (hover) */}
                    {hoveredMessageId === msg.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center gap-1 mt-2 ${msg.role === "user" ? "justify-end" : ""}`}
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyMessage(msg.content)}>
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>复制</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <RotateCcw className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>重新生成</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <ThumbsUp className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>有用</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <ThumbsDown className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>无用</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* 快捷命令 */}
        {currentAgent?.quickCommands && currentAgent.quickCommands.length > 0 && (
          <div className="px-6 pb-2">
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-wrap gap-2">
                {currentAgent.quickCommands.map((cmd) => (
                  <button
                    key={cmd}
                    onClick={() => handleSend(cmd)}
                    className="text-xs px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all hover:bg-primary/5"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 追问建议 */}
        {followUpSuggestions.length > 0 && messages.length > 0 && (
          <div className="px-6 pb-2">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">推荐追问</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {followUpSuggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(suggestion)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-card border border-border/50 text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all text-left max-w-[200px]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 输入框 */}
        <div className="px-6 pb-4 pt-2">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-card border border-border/50 shadow-lg focus-within:border-primary/30 focus-within:shadow-primary/10 transition-all">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9 flex-shrink-0">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>添加附件</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`向 ${currentAgent?.name} 提问... (Shift+Enter 换行)`}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-auto text-sm"
              />

              <Button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="h-9 w-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              AI 生成内容可能不准确，请核实重要信息
            </p>
          </div>
        </div>
      </div>

      {/* 右侧详情面板 */}
      <AnimatePresence>
        {showRightPanel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-l border-border/50 bg-card/30 flex-shrink-0 hidden lg:block overflow-hidden"
          >
            <div className="h-full flex flex-col p-4">
              {/* Agent 卡片 */}
              <div className="mb-6">
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${currentAgent?.gradient} flex items-center justify-center text-4xl mx-auto mb-3 shadow-lg`}>
                  {currentAgent?.emoji}
                </div>
                <h3 className="text-base font-semibold text-center text-foreground">{currentAgent?.name}</h3>
                <p className="text-xs text-muted-foreground text-center mt-1">{currentAgent?.description}</p>

                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">{currentAgent?.category}</Badge>
                  <Badge variant="secondary" className="text-xs">{currentAgent?.type === "platform" ? "平台" : "我的"}</Badge>
                </div>

                {currentAgent?.expertise && (
                  <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">{currentAgent.expertise}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              {/* 能力标签 */}
              {currentAgent?.capabilities && (
                <div className="mb-6">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">核心能力</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentAgent.capabilities.map((cap, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="my-4" />

              {/* 推荐工具 */}
              <div className="mb-6">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Wrench className="h-3.5 w-3.5" />
                  推荐工具
                </h4>
                <div className="space-y-2">
                  {recommendedTools.map((tool, i) => (
                    <Button
                      key={i}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 h-9 text-xs"
                    >
                      {tool.icon}
                      {tool.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator className="my-4" />

              {/* 统计信息 */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5" />
                  使用统计
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">总调用</span>
                    <span className="text-xs font-medium text-foreground">{currentAgent?.calls?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">会话数</span>
                    <span className="text-xs font-medium text-foreground">{sessions.filter(s => s.agentId === currentAgent?.id).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">最后使用</span>
                    <span className="text-xs font-medium text-foreground">今天</span>
                  </div>
                </div>
              </div>

              <div className="flex-1" />

              {/* 外部链接 */}
              <Button variant="outline" size="sm" className="w-full gap-2 mt-4">
                <ExternalLink className="h-3.5 w-3.5" />
                查看文档
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
