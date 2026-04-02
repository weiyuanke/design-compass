import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Paperclip, Sparkles, Zap, MessageSquare, Shield, ArrowUp, Globe, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { getAllChatAgents } from "@/data/agents";
import { isKagentConfigured } from "@/lib/kagent";

const { platform, mine } = getAllChatAgents();
const agentLookup = Object.fromEntries([...platform, ...mine].map((a) => [a.id, a]));

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

const LandingPage = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [kagentBootstrapping, setKagentBootstrapping] = useState(false);
  const textareaRef = useAutoResize(input);
  const k8sKagent = isKagentConfigured();

  const handleSmartSend = () => {
    const content = input.trim();
    if (!content) return;

    // 根据关键词路由到对应 Agent
    const q = content.toLowerCase();
    const rules: { keywords: string[]; agentId: string }[] = [
      { keywords: ["k8s", "kubernetes", "集群", "pod", "节点", "运维", "诊断"], agentId: "k8s-ops" },
      { keywords: ["jira", "项目", "会议", "需求", "周报", "进度"], agentId: "project-mgr" },
      { keywords: ["ask", "离线任务", "虚拟机", "日志"], agentId: "ask-support" },
      { keywords: ["请假", "报销", "行政", "证明"], agentId: "admin-helper" },
      { keywords: ["研报", "报告", "分析", "解读", "目标价", "盈利预测"], agentId: "report-analyzer" },
      { keywords: ["舆情", "新闻", "情绪", "监控", "告警", "交易信号"], agentId: "sentinel" },
    ];

    let selectedAgentId: string | null = null;
    for (const rule of rules) {
      if (rule.keywords.some((k) => q.includes(k))) {
        selectedAgentId = rule.agentId;
        break;
      }
    }

    if (!selectedAgentId && platform.length > 0) {
      selectedAgentId = platform[0].id;
    }

    // 跳转到聊天会话页
    const agentParam = selectedAgentId ? `?agent=${selectedAgentId}` : '';
    navigate(`/chat/session${agentParam}`, { state: { initialMessage: content } });
  };

  const selectAgent = (agentId: string) => {
    navigate(`/chat/session?agent=${agentId}`);
  };

  // Suggestion chips
  const suggestions = [
    { icon: <Sparkles className="h-3.5 w-3.5" />, text: "帮我分析今日舆情动态" },
    { icon: <Zap className="h-3.5 w-3.5" />, text: "诊断 K8s 集群异常" },
    { icon: <MessageSquare className="h-3.5 w-3.5" />, text: "生成本周工作汇总" },
    { icon: <Shield className="h-3.5 w-3.5" />, text: "帮我提交一个请假申请" },
  ];

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
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSmartSend();
                }
              }}
              placeholder="输入任何问题..."
              rows={1}
              disabled={kagentBootstrapping}
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
                disabled={!input.trim() || kagentBootstrapping}
                size="icon"
                className="h-8 w-8 rounded-lg bg-foreground text-background hover:bg-foreground/90 disabled:opacity-20 transition-all"
              >
                <ArrowUp className="h-4 w-4" />
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
};

export default LandingPage;
