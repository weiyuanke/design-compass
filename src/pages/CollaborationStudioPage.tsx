import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  ArrowRight,
  Sparkles,
  GitBranch,
  Layers,
  Timer,
  Cpu,
  BarChart3,
  Play,
  Eye,
  Settings2,
  ChevronDown,
  Zap,
  Network,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  mockSessions,
  collaborationTemplates,
  collaborationModes,
  roleDefinitions,
  type CollaborationMode,
} from "@/data/collaboration";

// Mode visual config
const modeVisuals: Record<CollaborationMode, { icon: typeof Layers; color: string; bgClass: string }> = {
  parallel: { icon: Layers, color: "text-blue-500", bgClass: "from-blue-500/15 to-blue-500/5" },
  sequential: { icon: GitBranch, color: "text-emerald-500", bgClass: "from-emerald-500/15 to-emerald-500/5" },
  hierarchical: { icon: Network, color: "text-violet-500", bgClass: "from-violet-500/15 to-violet-500/5" },
  debate: { icon: Zap, color: "text-amber-500", bgClass: "from-amber-500/15 to-amber-500/5" },
};

const CollaborationStudioPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"sessions" | "blueprints">("sessions");
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const statusConfig: Record<string, { label: string; dot: string; ring: string }> = {
    running: { label: "运行中", dot: "bg-emerald-500", ring: "ring-emerald-500/30" },
    completed: { label: "已完成", dot: "bg-blue-500", ring: "ring-blue-500/30" },
    pending: { label: "等待中", dot: "bg-amber-500", ring: "ring-amber-500/30" },
    failed: { label: "失败", dot: "bg-destructive", ring: "ring-destructive/30" },
  };

  return (
    <div className="min-h-screen">
      {/* Hero header with gradient mesh */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

        <div className="relative px-6 lg:px-8 py-8 max-w-7xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  协作工作室
                </h1>
              </div>
              <p className="text-muted-foreground max-w-lg">
                编排多个 AI Agent 协同工作，像指挥交响乐团一样驾驭复杂任务
              </p>
            </div>
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/20"
              onClick={() => navigate("/collaboration-studio/new")}
            >
              <Plus className="h-4 w-4 mr-2" />
              新建编排
            </Button>
          </div>

          {/* Quick stats strip */}
          <div className="flex items-center gap-6 mt-6 text-sm">
            {[
              { label: "活跃编排", value: mockSessions.filter(s => s.status === "running").length, icon: Play },
              { label: "已完成", value: mockSessions.filter(s => s.status === "completed").length, icon: BarChart3 },
              { label: "总 Token", value: `${(mockSessions.reduce((a, s) => a + (s.cost?.tokens || 0), 0) / 1000).toFixed(0)}k`, icon: Cpu },
              { label: "节省时间", value: `${(mockSessions.reduce((a, s) => a + (s.cost?.time || 0), 0) / 60).toFixed(1)}h`, icon: Timer },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 text-muted-foreground">
                <stat.icon className="h-4 w-4" />
                <span className="font-semibold text-foreground">{stat.value}</span>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-xl w-fit">
          {[
            { id: "sessions" as const, label: "运行会话", count: mockSessions.length },
            { id: "blueprints" as const, label: "编排蓝图", count: collaborationTemplates.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <Badge variant="secondary" className="ml-2 text-xs h-5 px-1.5">
                {tab.count}
              </Badge>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "sessions" ? (
            <motion.div
              key="sessions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {/* Search */}
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="搜索会话..." className="pl-10 bg-card border-border/50" />
              </div>

              {/* Session cards - timeline style */}
              <div className="space-y-3">
                {mockSessions.map((session, index) => {
                  const modeInfo = collaborationModes.find(m => m.id === session.mode);
                  const modeVis = modeVisuals[session.mode];
                  const ModeIcon = modeVis.icon;
                  const status = statusConfig[session.status];

                  return (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <Card
                        className="group cursor-pointer border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                        onClick={() => navigate(`/collaboration/detail?id=${session.id}`)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            {/* Mode icon */}
                            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${modeVis.bgClass} flex items-center justify-center flex-shrink-0`}>
                              <ModeIcon className={`h-5 w-5 ${modeVis.color}`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2.5 mb-1">
                                <h3 className="font-semibold text-foreground truncate">{session.name}</h3>
                                <div className={`flex items-center gap-1.5 ${status.ring} ring-2 rounded-full px-2.5 py-0.5`}>
                                  <div className={`h-1.5 w-1.5 rounded-full ${status.dot} ${session.status === "running" ? "animate-pulse" : ""}`} />
                                  <span className="text-xs font-medium text-muted-foreground">{status.label}</span>
                                </div>
                              </div>

                              {/* Agent avatars */}
                              <div className="flex items-center gap-3 mt-2">
                                <div className="flex -space-x-2">
                                  {session.agents.map((agent, i) => {
                                    const role = roleDefinitions.find(r => r.id === agent.roleId);
                                    return (
                                      <div
                                        key={i}
                                        className="h-7 w-7 rounded-full bg-card border-2 border-background flex items-center justify-center text-xs"
                                        title={role?.name}
                                      >
                                        {role?.emoji}
                                      </div>
                                    );
                                  })}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {session.agents.length} 个 Agent · {modeInfo?.name}
                                </span>
                              </div>

                              {/* Progress bar for running */}
                              {session.status === "running" && (
                                <div className="mt-3">
                                  <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-muted-foreground">执行进度</span>
                                    <span className="font-mono text-primary">{session.progress}%</span>
                                  </div>
                                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                    <motion.div
                                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${session.progress}%` }}
                                      transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Right meta */}
                            <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground flex-shrink-0">
                              {session.cost && (
                                <>
                                  <span className="font-mono">{(session.cost.tokens / 1000).toFixed(0)}k tokens</span>
                                  <span>{(session.cost.time / 60).toFixed(0)} 分钟</span>
                                </>
                              )}
                              <ArrowRight className="h-4 w-4 mt-1 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="blueprints"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              {/* Mode overview */}
              <div className="grid grid-cols-4 gap-3">
                {collaborationModes.map((mode) => {
                  const vis = modeVisuals[mode.id];
                  const MIcon = vis.icon;
                  return (
                    <div
                      key={mode.id}
                      className={`p-4 rounded-xl bg-gradient-to-br ${vis.bgClass} border border-border/30`}
                    >
                      <MIcon className={`h-5 w-5 ${vis.color} mb-2`} />
                      <h4 className="font-semibold text-sm text-foreground">{mode.emoji} {mode.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{mode.description}</p>
                    </div>
                  );
                })}
              </div>

              {/* Template blueprints */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">预设蓝图</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collaborationTemplates.map((template) => {
                    const modeVis = modeVisuals[template.mode];
                    const MIcon = modeVis.icon;
                    const isHovered = hoveredTemplate === template.id;

                    return (
                      <motion.div
                        key={template.id}
                        onHoverStart={() => setHoveredTemplate(template.id)}
                        onHoverEnd={() => setHoveredTemplate(null)}
                        whileHover={{ y: -4 }}
                        className="group"
                      >
                        <Card className="border-border/50 hover:border-primary/40 transition-all duration-300 overflow-hidden">
                          {/* Top bar accent */}
                          <div className={`h-1 bg-gradient-to-r ${modeVis.bgClass}`} />
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                              <span className="text-3xl">{template.emoji}</span>
                              <Badge variant="outline" className="text-xs">
                                <MIcon className={`h-3 w-3 mr-1 ${modeVis.color}`} />
                                {collaborationModes.find(m => m.id === template.mode)?.name}
                              </Badge>
                            </div>

                            <h4 className="font-semibold text-foreground mb-1">{template.name}</h4>
                            <p className="text-xs text-muted-foreground mb-4">{template.description}</p>

                            {/* Role flow visualization */}
                            <div className="flex items-center gap-1 mb-4">
                              {template.roles
                                .sort((a, b) => (a.order || 0) - (b.order || 0))
                                .map((role, i) => {
                                  const roleDef = roleDefinitions.find(r => r.id === role.roleId);
                                  return (
                                    <div key={i} className="flex items-center gap-1">
                                      <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs" title={roleDef?.name}>
                                        {roleDef?.emoji}
                                      </div>
                                      {i < template.roles.length - 1 && (
                                        <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                                      )}
                                    </div>
                                  );
                                })}
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">{template.useCase}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => navigate(`/collaboration-studio/new?template=${template.id}`)}
                              >
                                使用蓝图
                                <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CollaborationStudioPage;
