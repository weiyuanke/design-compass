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

  return (
    <div className="p-6 lg:p-8 max-w-full space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">平台 Agent</h1>
        <p className="text-sm text-muted-foreground mt-1">
          平台内置的公共 Agent，开箱即用，直接对话交互
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

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex flex-col gap-3 p-5 rounded-xl bg-card border border-border/50 hover:border-border transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center text-xl flex-shrink-0">
                {agent.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{agent.name}</span>
                  <Badge variant="secondary" className="text-xs">{agent.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{agent.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">已被调用 {agent.calls.toLocaleString()} 次</span>
              <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => navigate(`/chat?agent=${agent.id}`)}>
                <MessageSquare className="h-3.5 w-3.5" />
                开始对话
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ToolsPage;
