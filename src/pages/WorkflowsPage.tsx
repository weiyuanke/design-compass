import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Play, Pause, Trash2, Edit2, Copy, MoreHorizontal } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Workflow {
  id: string;
  name: string;
  description: string;
  nodeCount: number;
  status: "draft" | "active" | "paused";
  lastRunAt?: string;
  lastRunStatus?: "success" | "failed" | "running";
  updatedAt: string;
}

const initialWorkflows: Workflow[] = [
  {
    id: "wf-1",
    name: "每日晨报生成",
    description: "自动获取隔夜行情、新闻，生成市场点评并发送到钉钉和邮件",
    nodeCount: 8,
    status: "active",
    lastRunAt: "2026-03-29 07:00",
    lastRunStatus: "success",
    updatedAt: "2026-03-28",
  },
  {
    id: "wf-2",
    name: "盘后风控报告",
    description: "工作日 16:00 生成持仓风控报告，发送给投资经理和风控群",
    nodeCount: 6,
    status: "active",
    lastRunAt: "2026-03-28 16:00",
    lastRunStatus: "success",
    updatedAt: "2026-03-27",
  },
  {
    id: "wf-3",
    name: "策略异常告警",
    description: "监控策略 PnL 和敞口，触发阈值时立即告警",
    nodeCount: 5,
    status: "paused",
    lastRunAt: "2026-03-25 14:30",
    lastRunStatus: "failed",
    updatedAt: "2026-03-25",
  },
  {
    id: "wf-4",
    name: "周报自动生成",
    description: "汇总本周工作内容、交易记录、绩效数据生成周报",
    nodeCount: 4,
    status: "draft",
    updatedAt: "2026-03-20",
  },
];

const WorkflowsPage = () => {
  const [workflows, setWorkflows] = useState(initialWorkflows);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const toggleStatus = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, status: w.status === "active" ? "paused" : "active" }
          : w
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
          <h1 className="text-2xl font-bold">工作流编排</h1>
          <p className="text-sm text-muted-foreground mt-1">
            可视化编排多 Agent 协作流程，实现复杂任务自动化
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              新建工作流
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>创建工作流</DialogTitle>
              <DialogDescription>
                定义一个新的自动化工作流，后续可以添加节点和配置触发器
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">工作流名称</Label>
                <Input id="name" placeholder="例如：每日晨报生成" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">描述</Label>
                <Textarea
                  id="desc"
                  placeholder="描述这个工作流的用途..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="template">从模板创建（可选）</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="选择一个模板" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning-report">每日晨报模板</SelectItem>
                    <SelectItem value="risk-report">风控报告模板</SelectItem>
                    <SelectItem value="alert">告警流程模板</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                取消
              </Button>
              <Button onClick={() => setIsCreateOpen(false)}>创建并编辑</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索工作流..."
          className="pl-10 bg-secondary/50 border-border/50 h-10"
        />
      </div>

      {/* Workflow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflows.map((workflow, i) => (
          <motion.div
            key={workflow.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50 bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/5 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    📋
                  </div>
                  <Badge
                    variant={
                      workflow.status === "active"
                        ? "default"
                        : workflow.status === "paused"
                        ? "secondary"
                        : "outline"
                    }
                    className={`text-xs ${
                      workflow.status === "active"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                        : workflow.status === "paused"
                        ? "bg-amber-500/15 text-amber-400 border-amber-500/20"
                        : ""
                    }`}
                  >
                    {workflow.status === "active"
                      ? "运行中"
                      : workflow.status === "paused"
                      ? "已暂停"
                      : "草稿"}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-semibold mt-3 text-foreground">
                  {workflow.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs line-clamp-2">
                  {workflow.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{workflow.nodeCount} 个节点</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                    <span>更新于 {workflow.updatedAt}</span>
                  </div>
                </div>
                {workflow.lastRunAt && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">最近运行:</span>
                    <span
                      className={
                        workflow.lastRunStatus === "success"
                          ? "text-emerald-500"
                          : workflow.lastRunStatus === "failed"
                          ? "text-red-500"
                          : "text-amber-500"
                      }
                    >
                      {workflow.lastRunStatus === "success"
                        ? "✅"
                        : workflow.lastRunStatus === "failed"
                        ? "❌"
                        : "⏳"}{" "}
                      {workflow.lastRunAt}
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
                  运行
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
                    <DropdownMenuItem className="gap-2">
                      <Copy className="h-3.5 w-3.5" /> 复制
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => toggleStatus(workflow.id)}
                      className="gap-2"
                    >
                      {workflow.status === "active" ? (
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

      {/* Empty state hint */}
      {workflows.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold mb-2">还没有工作流</h3>
          <p className="text-muted-foreground mb-4">
            创建第一个工作流，开始自动化你的工作流程
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新建工作流
          </Button>
        </div>
      )}
    </div>
  );
};

export default WorkflowsPage;
