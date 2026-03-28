import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Bot, User, Plus, ChevronDown, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "react-router-dom";
import { getAllChatAgents } from "@/data/agents";
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

const ChatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialAgentId = searchParams.get("agent") || searchParams.get("tool") || "";

  const [selectedAgentId, setSelectedAgentId] = useState<string>(initialAgentId);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agent = selectedAgentId ? agentLookup[selectedAgentId] : null;
  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialAgentId && agentLookup[initialAgentId] && sessions.length === 0) {
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
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setSelectedAgentId(agentId);
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

  // Landing: no agent selected
  if (!agent || !activeSessionId) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-3.5rem)] px-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 max-w-lg">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">开始新对话</h2>
            <p className="text-sm text-muted-foreground mt-2">选择一个 Agent 开始交互</p>
          </div>

          {/* Platform agents */}
          <div className="text-left space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">平台 Agent</h3>
            <div className="grid grid-cols-2 gap-3">
              {platform.map((a) => (
                <button
                  key={a.id}
                  onClick={() => selectAgent(a.id)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
                >
                  <span className="text-xl">{a.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* My agents */}
          {mine.length > 0 && (
            <div className="text-left space-y-3">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">我的 Agent</h3>
              <div className="grid grid-cols-2 gap-3">
                {mine.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => selectAgent(a.id)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-accent/30 hover:bg-accent/5 transition-all text-left"
                  >
                    <span className="text-xl">{a.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{a.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{a.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
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
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg">{agent.emoji}</div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">{agent.name}</h2>
                <Badge variant="secondary" className="text-xs">{agent.type === "platform" ? "平台" : "我的"}</Badge>
              </div>
              <span className="text-xs text-emerald-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 在线
              </span>
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
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user" ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"
                }`}>
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
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
            {agent.quickCommands.map((cmd) => (
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
