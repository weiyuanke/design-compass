import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Bot, User, Plus, ChevronDown, MessageSquare,
  Sparkles, AtSign, Users, X, Search, Check, ArrowRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAllChatAgents } from "@/data/agents";

const { platform, mine, all } = getAllChatAgents();

interface Message {
  id: string;
  role: "user" | "agent" | "master";
  content: string;
  timestamp: string;
  mentionedAgentId?: string;
  routedFromAgentId?: string;
  routedFromAgentName?: string;
  routedFromAgentEmoji?: string;
}

interface Session {
  id: string;
  agentId: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

const suggestedQuestions = [
  "今天的舆情怎么样？",
  "@Kubernetes 运维专家 集群状态如何？",
  "帮我生成一个 Python 爬虫脚本",
  "总结一下最近的会议纪要",
];

const ChatPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialAgentId = searchParams.get("agent") || searchParams.get("tool") || "";

  const [selectedAgentId, setSelectedAgentId] = useState<string>(initialAgentId || "master");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionCursorPos, setMentionCursorPos] = useState<number>(-1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isMasterMode = selectedAgentId === "master";
  const activeAgent = all.find((a) => a.id === selectedAgentId);
  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  const filteredAgents = all.filter((a) =>
    a.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialAgentId && all.find((a) => a.id === initialAgentId) && sessions.length === 0) {
      createSession(initialAgentId);
    }
  }, []);

  const createSession = (agentId: string) => {
    const a = all.find((ag) => ag.id === agentId);
    const agentName = agentId === "master" ? "Master Agent" : a?.name;
    const newSession: Session = {
      id: Date.now().toString(),
      agentId,
      title: `与 ${agentName} 的对话`,
      updatedAt: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      messages: [
        {
          id: "welcome",
          role: agentId === "master" ? "master" : "agent",
          content: agentId === "master"
            ? `你好！我是 Master Agent，你的智能助手。

我可以直接回答问题，也可以帮你调用各种专家 Agent。

**试试这样说：**
• "今天的舆情怎么样？" - 我会自动调用舆情监控 Agent
• "@Kubernetes 运维专家 集群状态" - 直接指定专家回答
• "帮我写个爬虫脚本" - 我会调用 CodeAgent 帮你写代码`
            : `你好！我是${agentName}，${a?.description}。有什么可以帮你的吗？`,
          timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleSend = (text?: string) => {
    const content = text || input.trim();
    if (!content || !activeSessionId) return;

    const mentionMatch = content.match(/@(\S+)/);
    let mentionedAgentId: string | undefined;
    let mentionedAgent: typeof all[0] | undefined;

    if (mentionMatch) {
      const mentionName = mentionMatch[1];
      mentionedAgent = all.find((a) => a.name.toLowerCase().includes(mentionName.toLowerCase()));
      if (mentionedAgent) {
        mentionedAgentId = mentionedAgent.id;
      }
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      mentionedAgentId,
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [...s.messages, userMsg], updatedAt: userMsg.timestamp }
          : s
      )
    );
    setInput("");
    setShowMentionDropdown(false);
    setMentionQuery("");

    setTimeout(() => {
      let agentMsg: Message;

      if (mentionedAgentId) {
        agentMsg = {
          id: (Date.now() + 1).toString(),
          role: "agent",
          content: `收到你的问题："${content.replace(/@\S+\s*/, "")}"\n\n正在调用 @${mentionedAgent?.name}...`,
          timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
          routedFromAgentId: mentionedAgentId,
          routedFromAgentName: mentionedAgent?.name,
          routedFromAgentEmoji: mentionedAgent?.emoji,
        };

        setTimeout(() => {
          const specialistMsg: Message = {
            id: (Date.now() + 2).toString(),
            role: "agent",
            content: `我是${mentionedAgent?.name}，${mentionedAgent?.description}\n\n已为你处理：${content.replace(/@\S+\s*/, "")}\n\n（这是模拟回复，实际会调用对应的 Agent）`,
            timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
          };
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? { ...s, messages: [...s.messages, specialistMsg], updatedAt: specialistMsg.timestamp }
                : s
            )
          );
        }, 1500);
      } else if (isMasterMode) {
        agentMsg = {
          id: (Date.now() + 1).toString(),
          role: "master",
          content: `我来帮你处理："${content}"\n\n正在分析你的需求...`,
          timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        };

        setTimeout(() => {
          const randomAgent = all[Math.floor(Math.random() * all.length)];
          const routingMsg: Message = {
            id: (Date.now() + 2).toString(),
            role: "master",
            content: `已调用 @${randomAgent.name} 来处理你的请求...`,
            timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
          };
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? { ...s, messages: [...s.messages, routingMsg], updatedAt: routingMsg.timestamp }
                : s
            )
          );

          setTimeout(() => {
            const specialistMsg: Message = {
              id: (Date.now() + 3).toString(),
              role: "agent",
              content: `我是${randomAgent.name}，已为你处理：${content}\n\n（这是模拟回复，实际会调用对应的 Agent）`,
              timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
              routedFromAgentId: randomAgent.id,
              routedFromAgentName: randomAgent.name,
              routedFromAgentEmoji: randomAgent.emoji,
            };
            setSessions((prev) =>
              prev.map((s) =>
                s.id === activeSessionId
                  ? { ...s, messages: [...s.messages, specialistMsg], updatedAt: specialistMsg.timestamp }
                  : s
              )
            );
          }, 1000);
        }, 1000);
      } else {
        agentMsg = {
          id: (Date.now() + 1).toString(),
          role: "agent",
          content: `收到你的问题："${content}"\n\n正在处理...（这是模拟回复，实际会调用对应的 Agent）`,
          timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        };
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, agentMsg], updatedAt: agentMsg.timestamp }
            : s
        )
      );
    }, 800);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    const atIndex = value.lastIndexOf("@");
    if (atIndex !== -1 && atIndex === value.length - 1) {
      setShowMentionDropdown(true);
      setMentionQuery("");
      setMentionCursorPos(atIndex);
    } else if (atIndex !== -1 && atIndex > value.length - 2) {
      const query = value.slice(atIndex + 1);
      if (!query.includes(" ")) {
        setShowMentionDropdown(true);
        setMentionQuery(query);
        setMentionCursorPos(atIndex);
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
    }
  };

  const insertMention = (agentId: string) => {
    const agent = all.find((a) => a.id === agentId);
    if (!agent) return;

    const beforeMention = input.slice(0, mentionCursorPos);
    const afterMention = input.slice(mentionCursorPos + 1).replace(/^\S+\s*/, "");
    const newInput = `${beforeMention}@${agent.name} ${afterMention}`;
    
    setInput(newInput);
    setShowMentionDropdown(false);
    setMentionQuery("");
    inputRef.current?.focus();
  };

  const handleSuggestedQuestion = (question: string) => {
    if (!activeSessionId) {
      createSession("master");
      setTimeout(() => handleSend(question), 100);
    } else {
      handleSend(question);
    }
  };

  // Landing: Big input box
  if (!activeSessionId) {
    return (
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl space-y-8"
          >
            {/* Logo / Title */}
            <div className="text-center space-y-3">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold"
              >
                有什么可以帮你的？
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground"
              >
                与 Master Agent 对话，智能路由到专家 Agent
              </motion.p>
            </div>

            {/* Big Input Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="输入问题，或使用 @ 提及专家..."
                  className="w-full min-h-[140px] p-4 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                  autoFocus
                />
                <div className="flex items-center justify-between p-3 border-t border-border bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground"
                      onClick={() => setShowAgentPicker(!showAgentPicker)}
                    >
                      <Users className="h-3.5 w-3.5 mr-1" />
                      专家列表
                    </Button>
                  </div>
                  <Button
                    onClick={() => handleSend()}
                    disabled={!input.trim()}
                    className="gap-2"
                  >
                    发送
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Mention dropdown */}
              <AnimatePresence>
                {showMentionDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto"
                  >
                    <div className="p-2 border-b border-border">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-lg">
                        <Search className="h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          value={mentionQuery}
                          onChange={(e) => setMentionQuery(e.target.value)}
                          placeholder="搜索专家..."
                          className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="py-2">
                      {filteredAgents.length === 0 ? (
                        <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                          未找到匹配的专家
                        </div>
                      ) : (
                        filteredAgents.map((agent) => (
                          <button
                            key={agent.id}
                            onClick={() => insertMention(agent.id)}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-secondary/50 transition-colors"
                          >
                            <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-sm flex-shrink-0`}>
                              {agent.emoji}
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-sm font-medium text-foreground">{agent.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{agent.description}</p>
                            </div>
                            <Check className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Suggested questions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <p className="text-sm text-muted-foreground text-center">或者试试这些问题：</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {suggestedQuestions.map((question, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-left p-3 rounded-xl bg-card border border-border/50 hover:border-primary/50 hover:bg-secondary/50 transition-all text-sm group"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-foreground">{question}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Agent list sidebar */}
        <AnimatePresence>
          {showAgentPicker && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="absolute right-0 top-0 bottom-0 w-80 border-l border-border/50 flex-col flex-shrink-0 bg-card shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">专家列表</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowAgentPicker(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-medium">智能助手</h4>
                  </div>
                  <div
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      isMasterMode ? "border-primary/50 bg-primary/5" : "border border-border/50 hover:border-primary/30"
                    }`}
                    onClick={() => {
                      setSelectedAgentId("master");
                      createSession("master");
                      setShowAgentPicker(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Master Agent</p>
                        <p className="text-xs text-muted-foreground">智能路由到专家</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">平台 Agent</h4>
                  <div className="space-y-2">
                    {platform.map((a) => (
                      <div
                        key={a.id}
                        className={`p-3 rounded-xl cursor-pointer transition-all ${
                          selectedAgentId === a.id ? "border-primary/50 bg-primary/5" : "border border-border/50 hover:border-primary/30"
                        }`}
                        onClick={() => {
                          setSelectedAgentId(a.id);
                          createSession(a.id);
                          setShowAgentPicker(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${a.gradient} flex items-center justify-center text-sm`}>
                            {a.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{a.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{a.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {mine.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">我的 Agent</h4>
                    <div className="space-y-2">
                      {mine.map((a) => (
                        <div
                          key={a.id}
                          className={`p-3 rounded-xl cursor-pointer transition-all ${
                            selectedAgentId === a.id ? "border-accent/50 bg-accent/5" : "border border-border/50 hover:border-accent/30"
                          }`}
                          onClick={() => {
                            setSelectedAgentId(a.id);
                            createSession(a.id);
                            setShowAgentPicker(false);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-sm">
                              {a.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{a.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{a.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Chat view (existing implementation...)
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Session sidebar */}
      <div className="w-56 border-r border-border/50 flex-col flex-shrink-0 hidden md:flex">
        <div className="p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between gap-2 h-9 text-sm">
                <span className="flex items-center gap-2 truncate">
                  {isMasterMode ? (
                    <Sparkles className="h-4 w-4 text-primary" />
                  ) : (
                    <span>{activeAgent?.emoji}</span>
                  )}
                  <span className="truncate">{isMasterMode ? "Master Agent" : activeAgent?.name}</span>
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 max-h-80 overflow-y-auto">
              <DropdownMenuLabel className="text-xs text-muted-foreground">快速切换</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => { setSelectedAgentId("master"); createSession("master"); }} className="gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Master Agent</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">平台 Agent</DropdownMenuLabel>
              {platform.map((a) => (
                <DropdownMenuItem key={a.id} onClick={() => { setSelectedAgentId(a.id); createSession(a.id); }} className="gap-2">
                  <span>{a.emoji}</span><span>{a.name}</span>
                </DropdownMenuItem>
              ))}
              {mine.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground">我的 Agent</DropdownMenuLabel>
                  {mine.map((a) => (
                    <DropdownMenuItem key={a.id} onClick={() => { setSelectedAgentId(a.id); createSession(a.id); }} className="gap-2">
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
                {s.agentId === "master" ? (
                  <Sparkles className="h-3.5 w-3.5" />
                ) : (
                  <span className="text-xs">{all.find((a) => a.id === s.agentId)?.emoji}</span>
                )}
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
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
              isMasterMode 
                ? "bg-gradient-to-br from-primary/20 to-primary/5" 
                : `bg-gradient-to-br ${activeAgent?.gradient}`
            }`}>
              {isMasterMode ? (
                <Sparkles className="h-5 w-5 text-primary" />
              ) : (
                activeAgent?.emoji
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">
                  {isMasterMode ? "Master Agent" : activeAgent?.name}
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {isMasterMode ? "智能路由" : activeAgent?.type === "platform" ? "平台" : "我的"}
                </Badge>
              </div>
              <span className="text-xs text-emerald-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 在线
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAgentPicker(!showAgentPicker)}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">专家列表</span>
          </Button>
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
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user" 
                    ? "bg-accent/15 text-accent" 
                    : msg.routedFromAgentId
                    ? "bg-gradient-to-br from-primary/20 to-primary/5 text-primary"
                    : "bg-primary/10 text-primary"
                }`}>
                  {msg.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : msg.routedFromAgentEmoji ? (
                    <span className="text-lg">{msg.routedFromAgentEmoji}</span>
                  ) : isMasterMode ? (
                    <Sparkles className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div className={`max-w-[75%] space-y-1 ${msg.role === "user" ? "items-end" : ""}`}>
                  {msg.routedFromAgentName && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <AtSign className="h-3 w-3" />
                      <span>{msg.routedFromAgentName}</span>
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-primary/15 text-foreground rounded-tr-md" 
                      : "bg-secondary/60 text-foreground rounded-tl-md"
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

        {/* Input */}
        <div className="px-4 pb-4 pt-2">
          <div className="relative">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
              className="flex items-end gap-2 p-2 rounded-xl bg-secondary/40 border border-border/50 focus-within:border-primary/50 transition-colors"
            >
              <Textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={isMasterMode ? "输入问题，或使用 @ 提及专家..." : `向 ${activeAgent?.name} 提问...`}
                className="flex-1 min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm py-2"
                rows={1}
              />
              <Button type="submit" size="icon" disabled={!input.trim()} className="h-8 w-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 flex-shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>

            {/* Mention dropdown */}
            <AnimatePresence>
              {showMentionDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto"
                >
                  <div className="p-2 border-b border-border">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-lg">
                      <Search className="h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={mentionQuery}
                        onChange={(e) => setMentionQuery(e.target.value)}
                        placeholder="搜索专家..."
                        className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="py-2">
                    {filteredAgents.length === 0 ? (
                      <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                        未找到匹配的专家
                      </div>
                    ) : (
                      filteredAgents.map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => insertMention(agent.id)}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-secondary/50 transition-colors"
                        >
                          <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-sm flex-shrink-0`}>
                            {agent.emoji}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-foreground">{agent.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{agent.description}</p>
                          </div>
                          <Check className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Agent list sidebar */}
      <AnimatePresence>
        {showAgentPicker && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="w-80 border-l border-border/50 flex-col flex-shrink-0 bg-card"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">专家列表</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowAgentPicker(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-medium">智能助手</h4>
                </div>
                <div
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    isMasterMode ? "border-primary/50 bg-primary/5" : "border border-border/50 hover:border-primary/30"
                  }`}
                  onClick={() => {
                    setSelectedAgentId("master");
                    createSession("master");
                    setShowAgentPicker(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Master Agent</p>
                      <p className="text-xs text-muted-foreground">智能路由到专家</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">平台 Agent</h4>
                <div className="space-y-2">
                  {platform.map((a) => (
                    <div
                      key={a.id}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        selectedAgentId === a.id ? "border-primary/50 bg-primary/5" : "border border-border/50 hover:border-primary/30"
                      }`}
                      onClick={() => {
                        setSelectedAgentId(a.id);
                        createSession(a.id);
                        setShowAgentPicker(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${a.gradient} flex items-center justify-center text-sm`}>
                          {a.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{a.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{a.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {mine.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">我的 Agent</h4>
                  <div className="space-y-2">
                    {mine.map((a) => (
                      <div
                        key={a.id}
                        className={`p-3 rounded-xl cursor-pointer transition-all ${
                          selectedAgentId === a.id ? "border-accent/50 bg-accent/5" : "border border-border/50 hover:border-accent/30"
                        }`}
                        onClick={() => {
                          setSelectedAgentId(a.id);
                          createSession(a.id);
                          setShowAgentPicker(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-sm">
                            {a.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{a.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{a.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
