import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Activity, Bot, Zap, Clock, TrendingUp, AlertTriangle, 
  Shield, Server, Users, Workflow, Bell, CheckCircle2,
  ArrowRight, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { platformAgents, myAgents } from "@/data/agents";
import { platformMcpServers, userMcpServers } from "@/data/mcpServers";
import { mockSessions } from "@/data/collaboration";
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
  name: a.name.length > 8 ? a.name.slice(0, 8) + "..." : a.name,
  calls: a.calls,
}));

const COLORS = [
  "hsl(160, 70%, 45%)",  // emerald
  "hsl(0, 0%, 45%)",     // gray
  "hsl(45, 80%, 55%)",   // amber
];

const statusData = [
  { name: "运行中", value: platformMcpServers.filter((s) => s.status === "online").length + userMcpServers.filter((s) => s.status === "online").length },
  { name: "已停止", value: platformMcpServers.filter((s) => s.status === "offline").length + userMcpServers.filter((s) => s.status === "offline").length },
  { name: "部署中", value: platformMcpServers.filter((s) => s.status === "deploying").length + userMcpServers.filter((s) => s.status === "deploying").length },
];

const recentActivities = [
  { time: "10 分钟前", event: "代码助手 调用量激增", level: "warning" },
  { time: "30 分钟前", event: "内部知识库 MCP 恢复上线", level: "success" },
  { time: "1 小时前", event: "张三 创建新 Agent「数据采集 Bot」", level: "info" },
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
const runningAgents = myAgents.filter(a => a.status === "active").length;
const totalMcp = platformMcpServers.length + userMcpServers.length;
const onlineMcp = statusData[0].value;
const runningCollaborations = mockSessions.filter(s => s.status === "running").length;

const MonitorPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">监控概览</h1>
            <p className="text-sm text-muted-foreground mt-1">
              实时查看 Agent、MCP、协作和自动化任务的运行情况
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/monitor/detail")}>
              <Eye className="h-4 w-4 mr-2" />
              详细视图
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">总览</TabsTrigger>
          <TabsTrigger value="agents">Agent</TabsTrigger>
          <TabsTrigger value="mcp">MCP</TabsTrigger>
          <TabsTrigger value="automation">自动化</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* Key Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard 
              label="今日调用" 
              value={totalCalls.toLocaleString()} 
              icon={Zap} 
              trend="+12.5%" 
              trendUp={true}
              color="text-amber-500"
              bgColor="bg-amber-500/10"
            />
            <MetricCard 
              label="运行中 Agent" 
              value={`${runningAgents}/${myAgents.length}`} 
              icon={Bot} 
              subtext="自托管 VM"
              color="text-emerald-500"
              bgColor="bg-emerald-500/10"
            />
            <MetricCard 
              label="MCP 在线" 
              value={`${onlineMcp}/${totalMcp}`} 
              icon={Server} 
              subtext="服务节点"
              color="text-blue-500"
              bgColor="bg-blue-500/10"
            />
            <MetricCard 
              label="协作进行中" 
              value={String(runningCollaborations)} 
              icon={Users} 
              subtext="多 Agent 会话"
              color="text-purple-500"
              bgColor="bg-purple-500/10"
            />
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Call Trend */}
            <Card className="lg:col-span-2 border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base font-medium">调用趋势</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs h-7">
                    详情 <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
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
                      <Tooltip 
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} 
                      />
                      <Area type="monotone" dataKey="calls" stroke="hsl(var(--primary))" fill="url(#callsGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* MCP Status */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-blue-500" />
                    <CardTitle className="text-base font-medium">MCP 状态</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={statusData.filter(d => d.value > 0)} 
                        cx="50%" cy="50%" 
                        innerRadius={50} 
                        outerRadius={75} 
                        paddingAngle={4} 
                        dataKey="value" 
                      >
                        {statusData.filter(d => d.value > 0).map((_, i) => (
                          <Cell key={i} fill={COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardContent className="pt-0">
                <div className="flex items-center justify-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>运行中 {statusData[0].value}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-gray-500" />
                    <span>已停止 {statusData[1].value}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>部署中 {statusData[2].value || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Top Agents */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base font-medium">热门 Agent</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate("/tools")}>
                    全部 <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agentCallsData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                      <Bar dataKey="calls" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-500" />
                    <CardTitle className="text-base font-medium">最近动态</CardTitle>
                  </div>
                </div>
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
          </div>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <AgentStatCard label="平台 Agent" value={platformAgents.length} calls={platformAgents.reduce((s, a) => s + a.calls, 0)} />
            <AgentStatCard label="我的 Agent" value={myAgents.length} calls={myAgents.reduce((s, a) => s + a.calls, 0)} running={runningAgents} />
            <AgentStatCard label="今日活跃" value={platformAgents.filter(a => a.calls > 5000).length} highlight />
          </div>
        </TabsContent>

        {/* MCP Tab */}
        <TabsContent value="mcp" className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <McpStatCard label="平台 MCP" value={platformMcpServers.length} online={platformMcpServers.filter(s => s.status === "online").length} />
            <McpStatCard label="用户 MCP" value={userMcpServers.length} online={userMcpServers.filter(s => s.status === "online").length} />
            <McpStatCard label="总调用" value="12,456" highlight />
          </div>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <AutomationStatCard label="工作流" value="5" running="2" icon={Workflow} />
            <AutomationStatCard label="定时任务" value="8" running="5" icon={Clock} />
            <AutomationStatCard label="通知发送" value="156" today="23" icon={Bell} />
            <AutomationStatCard label="协作会话" value={mockSessions.length} running={runningCollaborations} icon={Users} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ label, value, icon: Icon, trend, trendUp, subtext, color, bgColor }: any) => (
  <Card className="border-border/50">
    <CardContent className="p-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
          {trend && (
            <p className={`text-xs ${trendUp ? "text-emerald-500" : "text-red-500"}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`h-10 w-10 rounded-xl ${bgColor} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Agent Stat Card
const AgentStatCard = ({ label, value, calls, running, highlight }: any) => (
  <Card className="border-border/50">
    <CardHeader className="pb-2">
      <CardDescription>{label}</CardDescription>
      <CardTitle className="text-2xl">{value}</CardTitle>
    </CardHeader>
    <CardContent>
      {calls !== undefined && <p className="text-xs text-muted-foreground">总调用：{calls.toLocaleString()}</p>}
      {running !== undefined && <p className="text-xs text-muted-foreground">运行中：{running}</p>}
      {highlight && <p className="text-xs text-emerald-500">高活跃 Agent</p>}
    </CardContent>
  </Card>
);

// MCP Stat Card
const McpStatCard = ({ label, value, online, highlight }: any) => (
  <Card className="border-border/50">
    <CardHeader className="pb-2">
      <CardDescription>{label}</CardDescription>
      <CardTitle className="text-2xl">{value}</CardTitle>
    </CardHeader>
    <CardContent>
      {online !== undefined && (
        <p className="text-xs text-emerald-500">
          <CheckCircle2 className="h-3 w-3 inline mr-1" />
          在线 {online}
        </p>
      )}
      {highlight && <p className="text-xs text-muted-foreground">累计调用</p>}
    </CardContent>
  </Card>
);

// Automation Stat Card
const AutomationStatCard = ({ label, value, running, today, icon: Icon }: any) => (
  <Card className="border-border/50">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {running && <p className="text-xs text-emerald-500">{running} 运行中</p>}
          {today && <p className="text-xs text-amber-500">今日 {today}</p>}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default MonitorPage;
