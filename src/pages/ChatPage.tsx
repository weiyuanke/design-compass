import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Bot, User, ArrowLeft, Settings, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
  table?: string[][];
}

const agentMap: Record<string, { name: string; emoji: string }> = {
  "k8s": { name: "Kubernetes Agent", emoji: "☸️" },
  "admin": { name: "行政支持 Agent", emoji: "🤖" },
  "data": { name: "数据分析 Agent", emoji: "📊" },
  "search": { name: "搜索助手", emoji: "🔍" },
  "it": { name: "IT 支持 Agent", emoji: "🎫" },
  "pm": { name: "项目管理 Agent", emoji: "📋" },
};

const quickCommands = ["查看 Pod", "查看 Deployment", "查看日志", "重启服务"];

const initialMessages: Message[] = [
  {
    id: "1",
    role: "agent",
    content: "你好！我是 Kubernetes Agent，可以帮你管理 K8s 集群。你可以问我关于 Pod、Service、Deployment 等资源的问题。",
    timestamp: "10:30",
  },
];

const ChatPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const agentId = searchParams.get("agent") || "k8s";
  const agent = agentMap[agentId] || agentMap["k8s"];

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate agent response
    setTimeout(() => {
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: `正在处理你的请求："${input}"...\n\n已为你查询相关信息。如果需要更多帮助，请继续提问。`,
        timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        table: input.includes("Pod") || input.includes("pod")
          ? [
              ["NAME", "READY", "STATUS", "RESTARTS"],
              ["nginx-abc123", "1/1", "Running", "0"],
              ["api-def456", "1/1", "Running", "2"],
              ["redis-ghi789", "1/1", "Running", "0"],
            ]
          : undefined,
      };
      setMessages((prev) => [...prev, agentMsg]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
            {agent.emoji}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{agent.name}</h2>
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 在线
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8">
            <History className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
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
                msg.role === "user"
                  ? "bg-accent/15 text-accent"
                  : "bg-primary/10 text-primary"
              }`}>
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`max-w-[75%] space-y-2 ${msg.role === "user" ? "items-end" : ""}`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary/15 text-foreground rounded-tr-md"
                    : "bg-secondary/60 text-foreground rounded-tl-md"
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.table && (
                    <div className="mt-3 overflow-x-auto rounded-lg border border-border/50">
                      <table className="w-full text-xs font-mono">
                        <thead>
                          <tr className="bg-muted/50">
                            {msg.table[0].map((h, i) => (
                              <th key={i} className="px-3 py-2 text-left text-muted-foreground font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {msg.table.slice(1).map((row, ri) => (
                            <tr key={ri} className="border-t border-border/30">
                              {row.map((cell, ci) => (
                                <td key={ci} className="px-3 py-1.5">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
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

      {/* Quick commands */}
      <div className="px-4 pb-2">
        <div className="flex flex-wrap gap-2">
          {quickCommands.map((cmd) => (
            <button
              key={cmd}
              onClick={() => setInput(cmd)}
              className="text-xs px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2 p-2 rounded-xl bg-secondary/40 border border-border/50 focus-within:border-primary/30 transition-colors"
        >
          <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8 flex-shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入消息..."
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-8 text-sm"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim()}
            className="h-8 w-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
