import { motion } from "framer-motion";
import { Activity, Bot, Zap, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { platformAgents, myAgents } from "@/data/agents";
import { platformMcpServers, userMcpServers } from "@/data/mcpServers";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";

const dailyCalls = [
  { date: "03/23", calls: 320 },
  { date: "03/24", calls: 480 },
  { date: "03/25", calls: 560 },
  { date: "03/26", calls: 420 },
  { date: "03/27", calls: 690 },
  { date: "03/28", calls: 810 },
  { date: "03/29", calls: 750 },
];

const agentCallsData = platformAgents.slice(0, 6).map((a) => ({
  name: a.name,
  calls: a.calls,
}));

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(210, 60%, 55%)",
  "hsl(160, 50%, 50%)",
  "hsl(45, 70%, 55%)",
  "hsl(0, 60%, 55%)",
];

const statusData = [
  { name: "运行中", value: platformMcpServers.filter((s) => s.status === "online").length + userMcpServers.filter((s) => s.status === "online").length },
  { name: "已停止", value: platformMcpServers.filter((s) => s.status === "offline").length + userMcpServers.filter((s) => s.status === "offline").length },
  { name: "部署中", value: platformMcpServers.filter((s) => s.status === "deploying").length + userMcpServers.filter((s) => s.status === "deploying").length },
];

const recentActivities = [
  { time: "10 分钟前", event: "代码助手 调用量激增", level: "warning" },
  { time: "30 分钟前", event: "内部知识库 MCP 恢复上线", level: "success" },
  { time: "1 小时前", event: "用户 张三 创建新 Agent「数据采集 Bot」", level: "info" },
  { time: "2 小时前", event: "智能翻译 Agent 完成 500 次调用", level: "info" },
  { time: "3 小时前", event: "监控告警 MCP 离线", level: "error" },
];

const levelStyles: Record<string, string> = {
  warning: "bg-amber-500/10 text-amber-500",
  success: "bg-emerald-500/10 text-emerald-500",
  info: "bg-primary/10 text-primary",
  error: "bg-destructive/10 text-destructive",
};

const totalCalls = platformAgents.reduce((s, a) => s + a.calls, 0) + myAgents.reduce((s, a) => s + a.calls, 0);
const totalAgents = platformAgents.length + myAgents.length;
const totalMcp = platformMcpServers.length + userMcpServers.length;
const onlineMcp = statusData[0].value;

const stats = [
  { label: "总调用量", value: totalCalls.toLocaleString(), icon: Zap, change: "+12.5%" },
  { label: "Agent 总数", value: totalAgents, icon: Bot, change: `${platformAgents.length} 平台 / ${myAgents.length} 自建` },
  { label: "MCP Server", value: `${onlineMcp}/${totalMcp} 在线`, icon: Activity, change: "" },
  { label: "平均响应", value: "1.2s", icon: Clock, change: "-8.3%" },
];

const MonitorPage = () => (
  <div className="p-6 lg:p-8 max-w-full space-y-6">
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-foreground">监控概览</h1>
      <p className="text-sm text-muted-foreground mt-1">实时查看 Agent 调用、MCP 状态和系统运行情况</p>
    </motion.div>

    {/* Stats */}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              {s.change && <p className="text-xs text-muted-foreground mt-2">{s.change}</p>}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>

    {/* Charts row */}
    <div className="grid gap-4 lg:grid-cols-3">
      <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              近 7 日调用趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyCalls}>
                  <defs>
                    <linearGradient id="callsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="calls" stroke="hsl(var(--primary))" fill="url(#callsGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="border-border/50 h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">MCP 状态分布</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} ${value}`}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>

    {/* Bottom row */}
    <div className="grid gap-4 lg:grid-cols-2">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Agent 调用排行</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentCallsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="calls" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              最近动态
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((a, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <Badge variant="secondary" className={`text-xs shrink-0 ${levelStyles[a.level]}`}>
                  {a.time}
                </Badge>
                <span className="text-foreground">{a.event}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  </div>
);

export default MonitorPage;
