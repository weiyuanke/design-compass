import { motion } from "framer-motion";
import { Search, Bot, LayoutGrid, Activity, Zap, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { AgentCard } from "@/components/AgentCard";
import { TemplateCard } from "@/components/TemplateCard";
import { StatsCard } from "@/components/StatsCard";
import { platformAgents, myAgents, templates } from "@/data/agents";

const pinnedAgents = [
  ...platformAgents.slice(0, 4).map((a) => ({ id: a.id, name: a.name, emoji: a.emoji })),
  ...myAgents.filter((a) => a.status === "active").slice(0, 2).map((a) => ({ id: a.id, name: a.name, emoji: a.emoji })),
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          欢迎回来，<span className="text-gradient-primary">张三</span>
        </h1>
        <p className="text-muted-foreground">探索 Agent，或创建属于你自己的</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="搜索 Agent、模板、功能..." className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 h-11" />
      </motion.div>

      {/* Pinned agents */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }} className="space-y-3">
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
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Bot} label="已创建 Agent" value={String(myAgents.length)} trend="+2" />
        <StatsCard icon={Activity} label="运行中" value={String(myAgents.filter((a) => a.status === "active").length)} trend="" />
        <StatsCard icon={Zap} label="今日调用" value="1,234" trend="+18%" />
        <StatsCard icon={LayoutGrid} label="可用模版" value={String(templates.length)} trend="" />
      </motion.div>

      {/* Platform agents & Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" /> 平台 Agent
            </h2>
            <button onClick={() => navigate("/tools")} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              查看全部 <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {platformAgents.slice(0, 4).map((agent) => (
              <AgentCard key={agent.id} name={agent.name} emoji={agent.emoji} desc={agent.description} status="online" onClick={() => navigate(`/chat?agent=${agent.id}`)} />
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-accent" /> Agent 模版
            </h2>
            <button onClick={() => navigate("/templates")} className="text-sm text-muted-foreground hover:text-accent flex items-center gap-1 transition-colors">
              查看全部 <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {templates.map((tpl) => (
              <TemplateCard key={tpl.id} {...tpl} onClick={() => navigate(`/create?template=${tpl.id}`)} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
