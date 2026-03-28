import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MoreHorizontal, Play, Pause, Trash2, Settings, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { myAgents as initialAgents } from "@/data/agents";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MyAgentsPage = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState(initialAgents);

  const toggleStatus = (id: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === "active" ? "inactive" : "active" } : a
      )
    );
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">我的 Agent</h1>
          <p className="text-sm text-muted-foreground mt-1">管理你创建的所有 Agent 实例</p>
        </div>
        <Button onClick={() => navigate("/create")} className="bg-primary text-primary-foreground hover:bg-primary/90">
          创建 Agent
        </Button>
      </motion.div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="搜索我的 Agent..." className="pl-10 bg-secondary/50 border-border/50 h-10" />
      </div>

      <div className="space-y-3">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-colors"
          >
            <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center text-xl flex-shrink-0">
              {agent.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-foreground">{agent.name}</span>
                <Badge variant={agent.status === "active" ? "default" : "secondary"} className={`text-xs ${agent.status === "active" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-muted text-muted-foreground"}`}>
                  {agent.status === "active" ? "运行中" : "已停止"}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span>模版：{agent.template}</span>
                <span>调用 {agent.calls} 次</span>
                <span>创建于 {agent.created}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => navigate(`/chat?agent=${agent.id}`)}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                  <DropdownMenuItem onClick={() => toggleStatus(agent.id)} className="gap-2">
                    {agent.status === "active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    {agent.status === "active" ? "停止" : "启动"}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Settings className="h-3.5 w-3.5" /> 配置
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" /> 删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MyAgentsPage;
