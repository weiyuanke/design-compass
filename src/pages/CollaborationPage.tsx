import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Play,
  Pause,
  Trash2,
  MoreHorizontal,
  Users,
  Clock,
  Zap,
  TrendingUp,
  ChevronRight,
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
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { mockSessions, collaborationTemplates, collaborationModes, roleDefinitions } from "@/data/collaboration";

const CollaborationPage = () => {
  const navigate = useNavigate();
  const [sessions] = useState(mockSessions);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const styles = {
      running: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
      completed: "bg-blue-500/15 text-blue-400 border-blue-500/20",
      pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
      failed: "bg-red-500/15 text-red-400 border-red-500/20",
    };
    const labels = {
      running: "运行中",
      completed: "已完成",
      pending: "待开始",
      failed: "已失败",
    };
    return (
      <Badge variant="outline" className={`text-xs ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getModeInfo = (mode: string) => {
    const modeData = collaborationModes.find((m) => m.id === mode);
    return { emoji: modeData?.emoji || "⚡", name: modeData?.name || mode };
  };

  const getTemplateInfo = (templateId?: string) => {
    if (!templateId) return null;
    return collaborationTemplates.find((t) => t.id === templateId);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">多 Agent 协作</h1>
          <p className="text-sm text-muted-foreground mt-1">
            让多个 AI Agent 像团队一样协作解决复杂问题
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              新建协作
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>创建多 Agent 协作</DialogTitle>
              <DialogDescription>
                选择预设模板或自定义协作流程
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="templates" className="mt-4">
              <TabsList>
                <TabsTrigger value="templates">预设模板</TabsTrigger>
                <TabsTrigger value="custom">自定义配置</TabsTrigger>
              </TabsList>
              <TabsContent value="templates" className="space-y-4 mt-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {collaborationTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setIsCreateOpen(false);
                        navigate(`/collaboration/new?template=${template.id}`);
                      }}
                      className="text-left p-4 rounded-xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{template.emoji}</span>
                        <div>
                          <h3 className="font-semibold text-sm">{template.name}</h3>
                          <p className="text-xs text-muted-foreground">{template.useCase}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getModeInfo(template.mode).emoji} {getModeInfo(template.mode).name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {template.roles.length} 个角色
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="custom" className="space-y-4 mt-4">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">自由组合 Agent 角色，配置协作模式和任务参数</p>
                  <Button
                    onClick={() => {
                      setIsCreateOpen(false);
                      navigate("/collaboration/new");
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    开始自定义配置
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                取消
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>运行中协作</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              {sessions.filter((s) => s.status === "running").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>已完成</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              {sessions.filter((s) => s.status === "completed").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>总 Token 消耗</CardDescription>
            <CardTitle className="text-2xl">
              {(sessions.reduce((acc, s) => acc + (s.cost?.tokens || 0), 0) / 1000).toFixed(0)}k
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">本月累计</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>总耗时</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              {(sessions.reduce((acc, s) => acc + (s.cost?.time || 0), 0) / 60).toFixed(1)}h
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">本月累计</p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索协作会话..."
              className="pl-10 bg-secondary/50 border-border/50 h-10"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {sessions.map((session) => {
            const template = getTemplateInfo(session.templateId);
            const modeInfo = getModeInfo(session.mode);
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/collaboration/detail?id=${session.id}`)}
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl flex-shrink-0">
                    {template?.emoji || modeInfo.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{session.name}</h3>
                      {getStatusBadge(session.status)}
                      {template && (
                        <Badge variant="outline" className="text-xs">
                          {template.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {session.agents.length} 个 Agent
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {modeInfo.name}
                      </span>
                      {session.cost && (
                        <>
                          <span>{(session.cost.tokens / 1000).toFixed(0)}k tokens</span>
                          <span>{(session.cost.time / 60).toFixed(0)} 分钟</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {session.status === "running" && (
                    <div className="w-32">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">进度</span>
                        <span className="text-primary">{session.progress}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${session.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CollaborationPage;
