import { motion } from "framer-motion";
import { Bot, Sparkles, Zap, Shield, Brain, Globe, MessageSquare, TrendingUp, ChevronRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllChatAgents } from "@/data/agents";

interface AgentHubPanelProps {
  onSelectAgent: (agentId: string) => void;
  onSmartSend?: (content: string) => void;
}

const { platform, mine } = getAllChatAgents();

// Find Agent Hub from platform agents
const agentHub = platform.find((a) => a.id === "agent-hub");
const otherAgents = platform.filter((a) => a.id !== "agent-hub");

export const AgentHubPanel = ({ onSelectAgent, onSmartSend }: AgentHubPanelProps) => {
  const quickActions = [
    {
      icon: <TrendingUp className="h-4 w-4" />,
      title: "舆情分析",
      desc: "分析今日市场舆情并生成报告",
      prompt: "分析今日舆情动态并生成结构化报告",
      gradient: "from-red-500/10 to-orange-500/10",
      border: "hover:border-red-500/30",
    },
    {
      icon: <Shield className="h-4 w-4" />,
      title: "集群诊断",
      desc: "诊断 K8s 集群问题并创建工单",
      prompt: "诊断 Kubernetes 集群异常并创建 Jira 工单",
      gradient: "from-blue-500/10 to-cyan-500/10",
      border: "hover:border-blue-500/30",
    },
    {
      icon: <MessageSquare className="h-4 w-4" />,
      title: "周报汇总",
      desc: "整理本周工作并发送汇总",
      prompt: "生成本周工作总结并发送给相关人员",
      gradient: "from-amber-500/10 to-orange-500/10",
      border: "hover:border-amber-500/30",
    },
    {
      icon: <Zap className="h-4 w-4" />,
      title: "多 Agent 协作",
      desc: "协调多个 Agent 完成复杂任务",
      prompt: "我需要多个 Agent 协作完成一个复杂任务",
      gradient: "from-purple-500/10 to-pink-500/10",
      border: "hover:border-purple-500/30",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Agent Hub Hero Section */}
        {agentHub && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 p-6 md:p-8"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/5 flex items-center justify-center text-3xl flex-shrink-0 shadow-lg shadow-emerald-500/10">
                  {agentHub.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">{agentHub.name}</h1>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      <Sparkles className="h-3 w-3 mr-1" />
                      智能调度
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm md:text-base mb-3">{agentHub.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {agentHub.capabilities.map((cap) => (
                      <Badge key={cap} variant="outline" className="text-xs border-emerald-500/20 text-emerald-600">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                {quickActions.map((action, i) => (
                  <motion.button
                    key={action.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => onSmartSend?.(action.prompt)}
                    className={`group p-4 rounded-xl bg-card/80 border border-border/50 ${action.border} hover:bg-gradient-to-br ${action.gradient} transition-all duration-200 text-left`}
                  >
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground group-hover:text-foreground transition-colors">
                      {action.icon}
                      <span className="text-sm font-medium">{action.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Platform Agents Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bot className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">平台 Agent</h2>
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs text-muted-foreground">{otherAgents.length} 个专家</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {otherAgents.map((a, i) => (
              <motion.button
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onSelectAgent(a.id)}
                className="group flex items-center gap-3 p-4 rounded-xl bg-card/60 border border-border/40 hover:border-primary/40 hover:bg-card hover:shadow-md transition-all duration-200 text-left"
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  {a.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{a.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{a.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-[10px] h-4 px-1">{a.category}</Badge>
                    <span className="text-[10px] text-muted-foreground">{a.calls.toLocaleString()} 次调用</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* My Agents Section */}
        {mine.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Plus className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">我的 Agent</h2>
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-xs text-muted-foreground">{mine.length} 个</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mine.map((a, i) => (
                <motion.button
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => onSelectAgent(a.id)}
                  className="group flex items-center gap-3 p-4 rounded-xl bg-card/60 border border-border/40 hover:border-accent/40 hover:bg-card hover:shadow-md transition-all duration-200 text-left"
                >
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                    {a.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">{a.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{a.description}</p>
                    <Badge variant="outline" className="text-[10px] h-4 px-1 mt-1 border-accent/30 text-accent">我的</Badge>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl bg-muted/50 border border-border/50 p-4"
        >
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">如何使用 Agent Hub？</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <strong>直接对话</strong>：点击任意 Agent 卡片开始一对一对话</li>
                <li>• <strong>智能调度</strong>：向 Agent Hub 描述复杂任务，它会自动协调多个 Agent 协作</li>
                <li>• <strong>快捷操作</strong>：使用上方快捷入口快速启动常见任务</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
