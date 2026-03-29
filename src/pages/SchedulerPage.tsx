import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Play,
  Pause,
  Trash2,
  Edit2,
  MoreHorizontal,
  Clock,
  Calendar,
  RefreshCw,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScheduledTask {
  id: string;
  name: string;
  targetType: "agent" | "workflow";
  targetName: string;
  schedule: string;
  scheduleDisplay: string;
  timezone: string;
  status: "active" | "paused";
  lastRunAt?: string;
  lastRunStatus?: "success" | "failed" | "running";
  nextRunAt: string;
}

const initialTasks: ScheduledTask[] = [
  {
    id: "task-1",
    name: "每日晨报生成",
    targetType: "workflow",
    targetName: "每日晨报生成",
    schedule: "0 7 * * *",
    scheduleDisplay: "每天 7:00",
    timezone: "Asia/Shanghai",
    status: "active",
    lastRunAt: "2026-03-29 07:00",
    lastRunStatus: "success",
    nextRunAt: "2026-03-30 07:00",
  },
  {
    id: "task-2",
    name: "盘后风控报告",
    targetType: "workflow",
    targetName: "盘后风控报告",
    schedule: "0 16 * * 1-5",
    scheduleDisplay: "工作日 16:00",
    timezone: "Asia/Shanghai",
    status: "active",
    lastRunAt: "2026-03-29 16:00",
    lastRunStatus: "success",
    nextRunAt: "2026-03-30 16:00",
  },
  {
    id: "task-3",
    name: "数据质量检查",
    targetType: "agent",
    targetName: "Kubernetes 运维专家",
    schedule: "*/30 * * * *",
    scheduleDisplay: "每 30 分钟",
    timezone: "Asia/Shanghai",
    status: "paused",
    lastRunAt: "2026-03-29 14:30",
    lastRunStatus: "success",
    nextRunAt: "-",
  },
  {
    id: "task-4",
    name: "持仓日报",
    targetType: "agent",
    targetName: "项目管理助手",
    schedule: "0 18 * * *",
    scheduleDisplay: "每天 18:00",
    timezone: "Asia/Shanghai",
    status: "active",
    lastRunAt: "2026-03-28 18:00",
    lastRunStatus: "failed",
    nextRunAt: "2026-03-30 18:00",
  },
];

const SchedulerPage = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const toggleStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "active" ? "paused" : "active" }
          : t
      )
    );
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
          <h1 className="text-2xl font-bold">定时任务</h1>
          <p className="text-sm text-muted-foreground mt-1">
            配置定时任务，让 Agent 和工作流按时自动执行
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              新建任务
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>创建定时任务</DialogTitle>
              <DialogDescription>
                配置一个定时任务，选择执行目标和调度规则
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="schedule" className="mt-4">
              <TabsList>
                <TabsTrigger value="schedule">调度配置</TabsTrigger>
                <TabsTrigger value="target">执行目标</TabsTrigger>
                <TabsTrigger value="policy">执行策略</TabsTrigger>
              </TabsList>
              <TabsContent value="schedule" className="space-y-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="task-name">任务名称</Label>
                  <Input id="task-name" placeholder="例如：每日晨报生成" />
                </div>
                <div className="grid gap-2">
                  <Label>调度类型</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择调度类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cron">Cron 表达式</SelectItem>
                      <SelectItem value="interval">固定间隔</SelectItem>
                      <SelectItem value="once">一次性执行</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cron">Cron 表达式</Label>
                  <div className="flex gap-2">
                    <Input id="cron" placeholder="0 7 * * *" defaultValue="0 7 * * *" />
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      生成器
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    当前配置：每天 7:00 执行
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="timezone">时区</Label>
                  <Select defaultValue="shanghai">
                    <SelectTrigger>
                      <SelectValue placeholder="选择时区" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shanghai">Asia/Shanghai (UTC+8)</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="ny">America/New_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              <TabsContent value="target" className="space-y-4 mt-4">
                <div className="grid gap-2">
                  <Label>目标类型</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择目标类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workflow">工作流</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>选择目标</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择一个工作流" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wf-1">每日晨报生成</SelectItem>
                      <SelectItem value="wf-2">盘后风控报告</SelectItem>
                      <SelectItem value="wf-3">策略异常告警</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              <TabsContent value="policy" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>失败重试</Label>
                    <p className="text-xs text-muted-foreground">
                      执行失败时自动重试
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>并发执行</Label>
                    <p className="text-xs text-muted-foreground">
                      允许同时运行多个实例
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>执行成功通知</Label>
                    <p className="text-xs text-muted-foreground">
                      完成后发送通知
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>执行失败通知</Label>
                    <p className="text-xs text-muted-foreground">
                      失败时立即告警
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                取消
              </Button>
              <Button onClick={() => setIsCreateOpen(false)}>创建任务</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索任务..."
          className="pl-10 bg-secondary/50 border-border/50 h-10"
        />
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50 bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/5 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    ⏰
                  </div>
                  <Badge
                    variant={task.status === "active" ? "default" : "secondary"}
                    className={`text-xs ${
                      task.status === "active"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {task.status === "active" ? "运行中" : "已暂停"}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-semibold mt-3 text-foreground">
                  {task.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  {task.targetType === "workflow" ? "工作流" : "Agent"}: {task.targetName}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{task.scheduleDisplay}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>下次执行：{task.nextRunAt}</span>
                </div>
                {task.lastRunAt && (
                  <div className="flex items-center gap-2 text-xs">
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span className="text-muted-foreground">最近运行:</span>
                    <span
                      className={
                        task.lastRunStatus === "success"
                          ? "text-emerald-500"
                          : task.lastRunStatus === "failed"
                          ? "text-red-500"
                          : "text-amber-500"
                      }
                    >
                      {task.lastRunStatus === "success"
                        ? "✅"
                        : task.lastRunStatus === "failed"
                        ? "❌"
                        : "⏳"}{" "}
                      {task.lastRunAt}
                    </span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8 border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                >
                  <Play className="h-3.5 w-3.5 mr-1" />
                  立即运行
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border">
                    <DropdownMenuItem className="gap-2">
                      <Edit2 className="h-3.5 w-3.5" /> 编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => toggleStatus(task.id)}
                      className="gap-2"
                    >
                      {task.status === "active" ? (
                        <>
                          <Pause className="h-3.5 w-3.5" /> 暂停
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5" /> 启用
                        </>
                      )}
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

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⏰</div>
          <h3 className="text-lg font-semibold mb-2">还没有定时任务</h3>
          <p className="text-muted-foreground mb-4">
            创建第一个定时任务，让 Agent 按时自动执行
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新建任务
          </Button>
        </div>
      )}
    </div>
  );
};

export default SchedulerPage;
