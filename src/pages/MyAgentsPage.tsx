import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, MoreHorizontal, Play, Pause, Trash2, Settings, MessageSquare, Plus,
  Server, Shield, HardDrive, ExternalLink, Terminal, Power
} from "lucide-react";
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
  DropdownMenuSeparator,
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

  const toggleVM = (id: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id ? {
          ...a,
          vmStatus: a.vmStatus === "running" ? "stopped" : "running",
          status: a.vmStatus === "running" ? "inactive" : "active"
        } : a
      )
    );
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header with self-hosted highlight */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">自托管 Agent</h1>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <Shield className="h-3 w-3 mr-1" />
                独立部署
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              每个 Agent 独立部署在专属虚拟机，数据完全隔离，需通过外部工作台进行交互
            </p>
          </div>
          <Button onClick={() => navigate("/create")} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            创建 Agent
          </Button>
        </div>
      </motion.div>

      {/* Features highlight */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Server className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-400">独立虚拟机部署</p>
            <p className="text-xs text-emerald-500/70">每个 Agent 独占 VM 资源</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-400">数据完全隔离</p>
            <p className="text-xs text-blue-500/70">敏感数据不出 VM</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
          <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Terminal className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-purple-400">完全控制权</p>
            <p className="text-xs text-purple-500/70">SSH 直连，任意配置</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="搜索自托管 Agent..." className="pl-10 bg-secondary/50 border-border/50 h-10" />
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30 bg-card overflow-hidden">
              {/* VM Status Bar */}
              <div className={`h-1 w-full ${
                agent.vmStatus === "running"
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  : agent.vmStatus === "stopped"
                  ? "bg-gradient-to-r from-muted to-muted"
                  : "bg-gradient-to-r from-amber-500 to-amber-400"
              }`} />

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      {agent.emoji}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-foreground">{agent.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={agent.status === "active" ? "default" : "secondary"} className={`text-xs h-5 ${
                          agent.status === "active"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {agent.status === "active" ? "运行中" : "已停止"}
                        </Badge>
                        <Badge variant="outline" className="text-xs h-5">
                          {agent.template}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pb-3 space-y-3">
                {/* VM Info */}
                <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Server className="h-3 w-3" />
                      虚拟机 ID
                    </span>
                    <code className="text-foreground font-mono">{agent.vmId}</code>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Power className="h-3 w-3" />
                      VM 状态
                    </span>
                    <span className={
                      agent.vmStatus === "running" ? "text-emerald-500" :
                      agent.vmStatus === "stopped" ? "text-muted-foreground" :
                      "text-amber-500"
                    }>
                      {agent.vmStatus === "running" ? "● 运行中" :
                       agent.vmStatus === "stopped" ? "● 已停止" :
                       "● 部署中"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      数据存储
                    </span>
                    <span className="text-foreground">{agent.dataLocation}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      部署区域
                    </span>
                    <span className="text-foreground">{agent.vmRegion}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>调用 {agent.calls} 次</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                    <span>创建于 {agent.created}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0 flex items-center justify-between gap-2">
                {agent.requiresExternalInterface && agent.externalUrl ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8 border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                    onClick={() => window.open(agent.externalUrl, '_blank')}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    访问工作台
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8 border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                    onClick={() => navigate(`/chat?agent=${agent.id}`)}
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                    对话
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border w-48">
                    <DropdownMenuItem onClick={() => toggleVM(agent.id)} className="gap-2">
                      {agent.vmStatus === "running" ? (
                        <Pause className="h-3.5 w-3.5" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                      {agent.vmStatus === "running" ? "停止 VM" : "启动 VM"}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Terminal className="h-3.5 w-3.5" /> SSH 连接
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(`/agent/${agent.id}/settings`)} className="gap-2">
                      <Settings className="h-3.5 w-3.5" /> 配置
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2"
                      onClick={() => agent.externalUrl && window.open(agent.externalUrl, '_blank')}
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> 访问 VM
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
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

      {/* Empty state */}
      {agents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-lg font-semibold mb-2">还没有自托管 Agent</h3>
          <p className="text-muted-foreground mb-4">
            创建第一个 Agent，享受完全的数据隔离和控制权
          </p>
          <Button onClick={() => navigate("/create")}>
            <Plus className="h-4 w-4 mr-2" />
            创建 Agent
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyAgentsPage;
