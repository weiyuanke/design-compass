import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MoreHorizontal, Play, Pause, Trash2, Settings, MessageSquare, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { myAgents as initialAgents } from "@/data/agents";

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
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">我的 Agent</h1>
          <p className="text-sm text-muted-foreground mt-1">管理你创建的所有 Agent 实例</p>
        </div>
        <Button onClick={() => navigate("/create")} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          创建 Agent
        </Button>
      </motion.div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="搜索我的 Agent..." className="pl-10 bg-secondary/50 border-border/50 h-10" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50 bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    {agent.emoji}
                  </div>
                  <Badge variant={agent.status === "active" ? "default" : "secondary"} className={`text-xs ${agent.status === "active" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-muted text-muted-foreground"}`}>
                    {agent.status === "active" ? "运行中" : "已停止"}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-semibold mt-3 text-foreground">{agent.name}</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  模版：{agent.template}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>调用 {agent.calls} 次</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                    <span>{agent.created}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8 border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  onClick={() => navigate(`/chat?agent=${agent.id}`)}
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  对话
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
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MyAgentsPage;
