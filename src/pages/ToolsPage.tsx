import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { platformAgents } from "@/data/agents";

const ToolsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = platformAgents.filter(
    (a) =>
      a.name.includes(search) ||
      a.description.includes(search) ||
      a.category.includes(search)
  );

  const categoryColors: Record<string, string> = {
    "运维": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "效率": "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "行政": "bg-pink-500/10 text-pink-400 border-pink-500/20",
    "投研": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">平台 Agent</h1>
        <p className="text-sm text-muted-foreground mt-1">
          平台预置的专业 Agent，覆盖运维、投研、行政等场景，无需配置即可使用
        </p>
      </motion.div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索平台 Agent..."
          className="pl-10 bg-secondary/50 border-border/50 h-10"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="group flex flex-col gap-3 p-5 rounded-xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start gap-3">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                {agent.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground">{agent.name}</span>
                  <Badge variant="outline" className={`text-xs border ${categoryColors[agent.category] || "bg-muted text-muted-foreground"}`}>
                    {agent.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{agent.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{agent.calls.toLocaleString()}</span> 次调用
              </span>
              <Button size="sm" variant="outline" className="gap-1.5 h-8 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors" onClick={() => navigate(`/chat/session?agent=${agent.id}`)}>
                <MessageSquare className="h-3.5 w-3.5" />
                对话
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">未找到匹配的 Agent</h3>
          <p className="text-muted-foreground">尝试其他搜索关键词</p>
        </div>
      )}
    </div>
  );
};

export default ToolsPage;
