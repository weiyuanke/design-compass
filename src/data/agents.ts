// Shared data source for all agent-related pages

export interface PlatformAgent {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: string;
  calls: number;
  quickCommands: string[];
  gradient: string;
  capabilities: string[];
  expertise: string;
}

export interface MyAgent {
  id: string;
  name: string;
  emoji: string;
  template: string;
  status: "active" | "inactive";
  calls: number;
  created: string;
  quickCommands: string[];
  // Self-hosted specific fields
  vmId?: string;
  vmStatus?: "running" | "stopped" | "deploying";
  vmRegion?: string;
  dataLocation?: string;
  isIsolated?: boolean;
  // External interaction URL (for agents that open in separate interface)
  externalUrl?: string;
  // Whether this agent requires external interface for interaction
  requiresExternalInterface?: boolean;
}

export interface Template {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  category: string;
}

// 平台内置 Agent（公共、开箱即用）
export const platformAgents: PlatformAgent[] = [
  {
    id: "agent-hub",
    name: "Agent Hub",
    emoji: "🎯",
    description: "智能任务调度中心，理解你的需求并自动协调各专业 Agent 协作完成复杂任务",
    category: "协作",
    calls: 50000,
    quickCommands: ["分析今日舆情并生成报告", "诊断集群问题并创建 Jira 工单", "周报汇总并发送通知", "多 Agent 协作任务"],
    gradient: "from-emerald-500/20 to-teal-500/5",
    capabilities: ["任务分解", "Agent 调度", "结果聚合", "多轮协作"],
    expertise: "智能识别任务类型，自动调用最合适的 Agent 组合"
  },
  {
    id: "k8s-ops",
    name: "Kubernetes 运维专家",
    emoji: "☸️",
    description: "Kubernetes 集群运维、故障诊断、性能优化、生成集群运行报告",
    category: "运维",
    calls: 8520,
    quickCommands: ["诊断集群问题", "查看 Pod 状态", "生成运维报告", "节点资源分析"],
    gradient: "from-blue-500/20 to-cyan-500/5",
    capabilities: ["集群诊断", "性能优化", "故障排查", "报告生成"],
    expertise: "5 年 + K8s 运维经验，管理过 1000+ 节点集群"
  },
  {
    id: "project-mgr",
    name: "项目管理助手",
    emoji: "📋",
    description: "Jira 操作、会议共识记录、需求管理、周报整理",
    category: "效率",
    calls: 12300,
    quickCommands: ["创建 Jira 需求", "整理会议共识", "生成本周工作汇总", "同步项目进度"],
    gradient: "from-amber-500/20 to-orange-500/5",
    capabilities: ["Jira 集成", "会议纪要", "需求拆解", "进度追踪"],
    expertise: "PMP 认证，敏捷开发最佳实践"
  },
  {
    id: "ask-support",
    name: "ASK 系统专家",
    emoji: "💻",
    description: "ASK 问题排查、提交离线任务、创建虚拟机",
    category: "运维",
    calls: 6780,
    quickCommands: ["排查 ASK 问题", "提交离线任务", "创建虚拟机", "查看任务日志"],
    gradient: "from-indigo-500/20 to-purple-500/5",
    capabilities: ["问题诊断", "任务提交", "资源创建", "日志分析"],
    expertise: "深度集成 ASK 系统 API，秒级响应"
  },
  {
    id: "admin-helper",
    name: "行政小助手",
    emoji: "🏢",
    description: "请假申请、费用报销、行政事务办理",
    category: "行政",
    calls: 4560,
    quickCommands: ["申请请假", "提交报销", "查询报销进度", "开具证明"],
    gradient: "from-pink-500/20 to-rose-500/5",
    capabilities: ["请假审批", "报销流程", "证明开具", "政策咨询"],
    expertise: "熟悉公司行政流程，7x24 小时服务"
  },
  {
    id: "report-analyzer",
    name: "研报解读 Agent",
    emoji: "📊",
    description: "解析卖方研报，提取核心观点、盈利预测和目标价，生成结构化摘要",
    category: "投研",
    calls: 9800,
    quickCommands: ["解读最新研报", "提取核心观点", "汇总盈利预测", "对比历史评级"],
    gradient: "from-violet-500/20 to-purple-500/5",
    capabilities: ["PDF 解析", "观点提取", "预测汇总", "评级对比"],
    expertise: "日均处理 100+ 份研报，准确率 95%+"
  },
  {
    id: "sentinel",
    name: "舆情监控 Agent",
    emoji: "🛰️",
    description: "实时监控新闻/社交媒体/公告，生成情绪评分和交易信号告警",
    category: "投研",
    calls: 23400,
    quickCommands: ["查看今日舆情", "情绪评分汇总", "负面新闻告警", "生成交易信号"],
    gradient: "from-red-500/20 to-orange-500/5",
    capabilities: ["实时监控", "情绪分析", "信号生成", "即时告警"],
    expertise: "覆盖 1000+ 信息源，毫秒级告警响应"
  },
];

// 用户创建的 Agent - 自托管特性
// 所有自托管 Agent 都需要通过外部工作台进行交互
export const myAgents: MyAgent[] = [
  {
    id: "my-1",
    name: "OpenClaw",
    emoji: "🦞",
    template: "OpenClaw",
    status: "active",
    calls: 1234,
    created: "2026-03-20",
    quickCommands: ["查看今日舆情", "生成会议纪要", "筛选邮件", "监控服务器日志"],
    vmId: "vm-openclaw-001",
    vmStatus: "running",
    vmRegion: "本地机器",
    dataLocation: "本地存储",
    isIsolated: true,
    externalUrl: "https://openclaw.internal/dashboard",
    requiresExternalInterface: true,
  },
  {
    id: "my-2",
    name: "CodeAgent",
    emoji: "💻",
    template: "CodeAgent",
    status: "active",
    calls: 567,
    created: "2026-03-22",
    quickCommands: ["生成代码", "提交 PR", "代码审查", "修复 bug"],
    vmId: "vm-code-002",
    vmStatus: "running",
    vmRegion: "本地机器",
    dataLocation: "本地存储",
    isIsolated: true,
    externalUrl: "http://192.168.10.229:3000/",
    requiresExternalInterface: true,
  },
  {
    id: "my-3",
    name: "ChatBot",
    emoji: "🤖",
    template: "ChatBot",
    status: "active",
    calls: 890,
    created: "2026-03-25",
    quickCommands: ["聊天", "查询信息", "获取新闻", "问答"],
    vmId: "vm-chat-003",
    vmStatus: "running",
    vmRegion: "本地机器",
    dataLocation: "本地存储",
    isIsolated: true,
    externalUrl: "https://chatbot.internal/workspace",
    requiresExternalInterface: true,
  },
];

// Agent 模版
export const templates: Template[] = [
  { id: "openclaw", name: "OpenClaw", emoji: "🦞", desc: "自主 AI 智能体框架", category: "智能体" },
  { id: "codeagent", name: "CodeAgent", emoji: "💻", desc: "个人编码 Agent", category: "开发" },
  { id: "chatbot", name: "ChatBot", emoji: "🤖", desc: "在线聊天获取信息", category: "对话" },
];

// Helper: 构建对话页 Agent 选择列表（平台 + 我的）
// 过滤掉需要外部交互的 Agent
export function getAllChatAgents() {
  const platform = platformAgents.map((a) => ({
    id: a.id,
    name: a.name,
    emoji: a.emoji,
    description: a.description,
    quickCommands: a.quickCommands,
    type: "platform" as const,
    capabilities: a.capabilities,
    expertise: a.expertise,
    gradient: a.gradient,
    calls: a.calls,
    category: a.category,
  }));
  const mine = myAgents
    .filter((a) => a.status === "active" && !a.requiresExternalInterface)
    .map((a) => ({
      id: a.id,
      name: a.name,
      emoji: a.emoji,
      description: `基于 ${a.template} 模版`,
      quickCommands: a.quickCommands,
      type: "my" as const,
    }));
  return { platform, mine, all: [...platform, ...mine] };
}
