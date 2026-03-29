import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  MoreHorizontal,
  Mail,
  Bell,
  Webhook,
  CheckCircle2,
  XCircle,
  Send,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface Channel {
  id: string;
  name: string;
  type: "dingtalk" | "wecom" | "email" | "webhook";
  status: "active" | "inactive";
  config: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  channels: string[];
  variables: string[];
}

interface NotificationRecord {
  id: string;
  template: string;
  channel: string;
  recipients: string;
  status: "sent" | "failed" | "pending";
  sentAt: string;
}

const channels: Channel[] = [
  {
    id: "ch-1",
    name: "钉钉 - 风控群",
    type: "dingtalk",
    status: "active",
    config: "https://oapi.dingtalk.com/robot/send?access_token=***",
  },
  {
    id: "ch-2",
    name: "企业微信 - 投研群",
    type: "wecom",
    status: "active",
    config: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=***",
  },
  {
    id: "ch-3",
    name: "SMTP 邮件",
    type: "email",
    status: "active",
    config: "smtp.company.com:587",
  },
  {
    id: "ch-4",
    name: "告警 Webhook",
    type: "webhook",
    status: "inactive",
    config: "https://api.internal/alerts/webhook",
  },
];

const templates: Template[] = [
  {
    id: "tpl-1",
    name: "每日晨报模板",
    description: "用于每日晨报的邮件和钉钉通知",
    channels: ["email", "dingtalk"],
    variables: ["date", "marketSummary", "positions", "news"],
  },
  {
    id: "tpl-2",
    name: "策略告警模板",
    description: "策略异常时的紧急告警通知",
    channels: ["dingtalk", "sms"],
    variables: ["strategyName", "alertType", "currentValue", "threshold"],
  },
  {
    id: "tpl-3",
    name: "风控报告模板",
    description: "盘后风控报告的通知模板",
    channels: ["email", "wecom"],
    variables: ["date", "pnl", "exposure", "var"],
  },
];

const records: NotificationRecord[] = [
  {
    id: "rec-1",
    template: "每日晨报模板",
    channel: "钉钉",
    recipients: "风控群 (56 人)",
    status: "sent",
    sentAt: "2026-03-29 07:05",
  },
  {
    id: "rec-2",
    template: "每日晨报模板",
    channel: "邮件",
    recipients: "投资团队 (23 人)",
    status: "sent",
    sentAt: "2026-03-29 07:05",
  },
  {
    id: "rec-3",
    template: "策略告警模板",
    channel: "钉钉",
    recipients: "风控群 (56 人)",
    status: "sent",
    sentAt: "2026-03-28 14:32",
  },
  {
    id: "rec-4",
    template: "风控报告模板",
    channel: "邮件",
    recipients: "投资经理 (5 人)",
    status: "failed",
    sentAt: "2026-03-28 16:05",
  },
];

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState("channels");
  const [isChannelOpen, setIsChannelOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">通知中心</h1>
          <p className="text-sm text-muted-foreground mt-1">
            统一管理通知渠道、模板和发送记录
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit2 className="h-4 w-4 mr-2" />
                新建模板
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>创建通知模板</DialogTitle>
                <DialogDescription>
                  定义一个通知模板，支持多渠道和变量替换
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="tpl-name">模板名称</Label>
                  <Input id="tpl-name" placeholder="例如：策略告警模板" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tpl-desc">描述</Label>
                  <Textarea
                    id="tpl-desc"
                    placeholder="描述这个模板的用途..."
                    rows={2}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>通知渠道</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择渠道" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dingtalk">钉钉</SelectItem>
                      <SelectItem value="wecom">企业微信</SelectItem>
                      <SelectItem value="email">邮件</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTemplateOpen(false)}>
                  取消
                </Button>
                <Button onClick={() => setIsTemplateOpen(false)}>创建模板</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isChannelOpen} onOpenChange={setIsChannelOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                添加渠道
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>添加通知渠道</DialogTitle>
                <DialogDescription>
                  配置一个新的通知发送渠道
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="ch-name">渠道名称</Label>
                  <Input id="ch-name" placeholder="例如：钉钉 - 风控群" />
                </div>
                <div className="grid gap-2">
                  <Label>渠道类型</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dingtalk">钉钉机器人</SelectItem>
                      <SelectItem value="wecom">企业微信机器人</SelectItem>
                      <SelectItem value="email">SMTP 邮件</SelectItem>
                      <SelectItem value="webhook">自定义 Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ch-config">配置信息</Label>
                  <Textarea
                    id="ch-config"
                    placeholder="Webhook URL 或 SMTP 配置..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>启用此渠道</Label>
                  <Switch defaultChecked />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsChannelOpen(false)}>
                  取消
                </Button>
                <Button onClick={() => setIsChannelOpen(false)}>保存</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="channels">通知渠道</TabsTrigger>
          <TabsTrigger value="templates">通知模板</TabsTrigger>
          <TabsTrigger value="records">发送记录</TabsTrigger>
        </TabsList>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((channel, i) => (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-border/50 hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/5 flex items-center justify-center text-xl">
                        {channel.type === "dingtalk" && "💬"}
                        {channel.type === "wecom" && "💼"}
                        {channel.type === "email" && "📧"}
                        {channel.type === "webhook" && "🔗"}
                      </div>
                      <Badge
                        variant={channel.status === "active" ? "default" : "secondary"}
                        className={`text-xs ${
                          channel.status === "active"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                            : ""
                        }`}
                      >
                        {channel.status === "active" ? "正常" : "停用"}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-semibold mt-3">
                      {channel.name}
                    </CardTitle>
                    <CardDescription className="text-xs truncate">
                      {channel.config}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-0 flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      <Send className="h-3.5 w-3.5 mr-1" />
                      测试
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Edit2 className="h-3.5 w-3.5" /> 编辑
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
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template, i) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-border/50 hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/5 flex items-center justify-center text-xl">
                        📝
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Edit2 className="h-3.5 w-3.5" /> 编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">复制</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <Trash2 className="h-3.5 w-3.5" /> 删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-base font-semibold mt-3">
                      {template.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">渠道:</span>
                      {template.channels.map((ch) => (
                        <Badge key={ch} variant="outline" className="text-xs">
                          {ch === "dingtalk" && "💬 钉钉"}
                          {ch === "wecom" && "💼 企微"}
                          {ch === "email" && "📧 邮件"}
                          {ch === "sms" && "📱 短信"}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">变量:</span>
                      {template.variables.map((v) => (
                        <Badge
                          key={v}
                          variant="secondary"
                          className="text-xs font-mono"
                        >
                          {"{"}
                          {"}"}
                          {v}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      预览模板
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Records Tab */}
        <TabsContent value="records" className="space-y-4 mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索发送记录..."
              className="pl-10 bg-secondary/50 border-border/50 h-10"
            />
          </div>

          <Card className="border-border/50">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                        {record.channel === "钉钉" && "💬"}
                        {record.channel === "邮件" && "📧"}
                        {record.channel === "企微" && "💼"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{record.template}</p>
                        <p className="text-xs text-muted-foreground">
                          {record.channel} → {record.recipients}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          {record.status === "sent" && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          )}
                          {record.status === "failed" && (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          {record.status === "pending" && (
                            <Bell className="h-4 w-4 text-amber-500" />
                          )}
                          <span
                            className={`text-xs ${
                              record.status === "sent"
                                ? "text-emerald-500"
                                : record.status === "failed"
                                ? "text-red-500"
                                : "text-amber-500"
                            }`}
                          >
                            {record.status === "sent"
                              ? "发送成功"
                              : record.status === "failed"
                              ? "发送失败"
                              : "发送中"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {record.sentAt}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsPage;
