import { motion } from "framer-motion";
import { Search, Bot, LayoutGrid, Activity, Zap, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { AgentCard } from "@/components/AgentCard";
import { TemplateCard } from "@/components/TemplateCard";
import { StatsCard } from "@/components/StatsCard";

const pinnedAgents = [
  { id: "k8s", name: "K8s Agent", emoji: "☸️", status: "online" as const },
  { id: "admin", name: "行政支持", emoji: "🤖", status: "online" as const },
  { id: "data", name: "数据分析", emoji: "📊", status: "online" as const },
  { id: "search", name: "搜索助手", emoji: "🔍", status: "online" as const },
  { id: "it", name: "IT 支持", emoji: "🎫", status: "online" as const },
  { id: "pm", name: "项目管理", emoji: "📋", status: "online" as const },
];

const toolAgents = [
  { id: "k8s", name: "Kubernetes Agent", emoji: "☸️", desc: "K8s 集群管理、资源查询、故障诊断", status: "online" as const },
  { id: "admin-support", name: "行政支持 Agent", emoji: "🤖", desc: "行政事务咨询、流程指引、资源申请", status: "online" as const },
  { id: "data-analysis", name: "数据分析 Agent", emoji: "📊", desc: "数据查询、报表生成、可视化分析", status: "online" as const },
  { id: "it-support", name: "IT 支持 Agent", emoji: "🎫", desc: "IT 问题诊断、工单创建、技术支持", status: "online" as const },
];

const templates = [
  { id: "opencrawl", name: "OpenCrawl", emoji: "🕷️", desc: "网页爬虫 Agent", category: "数据采集" },
  { id: "chatbot", name: "Chatbot", emoji: "💬", desc: "对话机器人模板", category: "对话" },
  { id: "coding", name: "Coding Agent", emoji: "💻", desc: "代码助手模板", category: "开发" },
  { id: "doc", name: "文档助手", emoji: "📝", desc: "文档生成、摘要、翻译", category: "办公" },
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero search */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold tracking-tight">
          欢迎回来，<span className="text-gradient-primary">张三</span>
        </h1>
        <p className="text-muted-foreground">探索 Agent，或创建属于你自己的</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="relative max-w-xl"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索 Agent、模板、功能..."
          className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 h-11"
        />
      </motion.div>

      {/* Pinned agents */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="space-y-3"
      >
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Zap className="h-3.5 w-3.5" /> 常用 Agent
        </h2>
        <div className="flex flex-wrap gap-2">
          {pinnedAgents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => navigate(`/chat?agent=${agent.id}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border/50 hover:border-primary/30 hover:bg-secondary transition-all text-sm group"
            >
              <span>{agent.emoji}</span>
              <span className="text-foreground group-hover:text-primary transition-colors">{agent.name}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatsCard icon={Bot} label="已创建 Agent" value="12" trend="+2" />
        <StatsCard icon={Activity} label="运行中" value="8" trend="" />
        <StatsCard icon={Zap} label="今日调用" value="1,234" trend="+18%" />
        <StatsCard icon={LayoutGrid} label="可用模版" value="5" trend="" />
      </motion.div>

      {/* Tool agents & Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" /> 工具类 Agent
            </h2>
            <button
              onClick={() => navigate("/chat")}
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              查看全部 <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {toolAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                {...agent}
                onClick={() => navigate(`/chat?agent=${agent.id}`)}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-accent" /> Agent 模版
            </h2>
            <button
              onClick={() => navigate("/templates")}
              className="text-sm text-muted-foreground hover:text-accent flex items-center gap-1 transition-colors"
            >
              查看全部 <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {templates.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                {...tpl}
                onClick={() => navigate(`/create?template=${tpl.id}`)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
