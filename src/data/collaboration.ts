// 多 Agent 协作模块数据模型

export type CollaborationMode = "parallel" | "sequential" | "hierarchical" | "debate";

export type AgentRole = 
  // 核心角色
  | "coordinator"    // 协调者
  | "researcher"     // 研究员
  | "analyst"        // 数据分析师
  | "developer"      // 程序员
  | "writer"         // 写手
  | "reviewer"       // 评审员
  // 量化专属角色
  | "quant"          // 量化研究员
  | "trader"         // 交易员
  | "risk_officer";  // 风控官

export interface RoleDefinition {
  id: AgentRole;
  name: string;
  emoji: string;
  description: string;
  expertise: string[];
  gradient: string;
}

export interface CollaborationTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  mode: CollaborationMode;
  roles: { roleId: AgentRole; order?: number }[];
  useCase: string;
}

export interface CollaborationSession {
  id: string;
  name: string;
  templateId?: string;
  mode: CollaborationMode;
  status: "pending" | "running" | "completed" | "failed";
  agents: { roleId: AgentRole; agentId: string; agentName: string }[];
  progress: number;
  createdAt: string;
  updatedAt: string;
  cost?: { tokens: number; time: number };
}

// 角色定义
export const roleDefinitions: RoleDefinition[] = [
  // 核心角色
  { 
    id: "coordinator", 
    name: "协调者", 
    emoji: "🎯", 
    description: "任务拆解、进度管理、结果整合",
    expertise: ["任务规划", "资源分配", "结果整合"],
    gradient: "from-purple-500/20 to-indigo-500/5"
  },
  { 
    id: "researcher", 
    name: "研究员", 
    emoji: "🔬", 
    description: "信息搜集、行业分析、知识整理",
    expertise: ["信息搜集", "行业分析", "知识整理"],
    gradient: "from-blue-500/20 to-cyan-500/5"
  },
  { 
    id: "analyst", 
    name: "数据分析师", 
    emoji: "📊", 
    description: "数据处理、统计分析、可视化",
    expertise: ["数据处理", "统计分析", "可视化"],
    gradient: "from-emerald-500/20 to-teal-500/5"
  },
  { 
    id: "developer", 
    name: "程序员", 
    emoji: "💻", 
    description: "代码编写、调试、架构设计",
    expertise: ["代码编写", "调试", "架构设计"],
    gradient: "from-orange-500/20 to-amber-500/5"
  },
  { 
    id: "writer", 
    name: "写手", 
    emoji: "✍️", 
    description: "内容创作、文案优化、报告整理",
    expertise: ["内容创作", "文案优化", "报告整理"],
    gradient: "from-pink-500/20 to-rose-500/5"
  },
  { 
    id: "reviewer", 
    name: "评审员", 
    emoji: "🔍", 
    description: "质量检查、风险评估、逻辑审查",
    expertise: ["质量检查", "风险评估", "逻辑审查"],
    gradient: "from-slate-500/20 to-gray-500/5"
  },
  // 量化专属角色
  { 
    id: "quant", 
    name: "量化研究员", 
    emoji: "📈", 
    description: "因子挖掘、策略回测、绩效归因",
    expertise: ["因子挖掘", "策略回测", "绩效归因"],
    gradient: "from-violet-500/20 to-purple-500/5"
  },
  { 
    id: "trader", 
    name: "交易员", 
    emoji: "💰", 
    description: "执行优化、滑点分析、订单管理",
    expertise: ["执行优化", "滑点分析", "订单管理"],
    gradient: "from-yellow-500/20 to-amber-500/5"
  },
  { 
    id: "risk_officer", 
    name: "风控官", 
    emoji: "⚠️", 
    description: "风险敞口、压力测试、合规检查",
    expertise: ["风险敞口", "压力测试", "合规检查"],
    gradient: "from-red-500/20 to-orange-500/5"
  },
];

// 协作模式
export const collaborationModes: { id: CollaborationMode; name: string; emoji: string; description: string }[] = [
  { 
    id: "parallel", 
    name: "并行协作", 
    emoji: "⚡", 
    description: "所有 Agent 同时工作，各自负责不同方面" 
  },
  { 
    id: "sequential", 
    name: "串行流水线", 
    emoji: "⛓️", 
    description: "Agent 按顺序执行，前一个输出是后一个输入" 
  },
  { 
    id: "hierarchical", 
    name: "层级协作", 
    emoji: "🏗️", 
    description: "协调者拆解任务 → 分配执行 → 协调者整合" 
  },
  { 
    id: "debate", 
    name: "辩论模式", 
    emoji: "⚔️", 
    description: "多个 Agent 从不同角度辩论，最终达成共识" 
  },
];

// 预设模板
export const collaborationTemplates: CollaborationTemplate[] = [
  {
    id: "industry-report",
    name: "行业研究报告",
    emoji: "📑",
    description: "深度行业分析，从数据搜集到报告撰写",
    mode: "hierarchical",
    roles: [
      { roleId: "coordinator", order: 1 },
      { roleId: "researcher", order: 2 },
      { roleId: "analyst", order: 2 },
      { roleId: "writer", order: 3 },
      { roleId: "reviewer", order: 4 },
    ],
    useCase: "深度行业分析、尽职调查",
  },
  {
    id: "quant-strategy",
    name: "量化策略开发",
    emoji: "📈",
    description: "策略从 0 到 1 的完整开发流程",
    mode: "sequential",
    roles: [
      { roleId: "quant", order: 1 },
      { roleId: "developer", order: 2 },
      { roleId: "reviewer", order: 3 },
    ],
    useCase: "新策略研发、因子挖掘",
  },
  {
    id: "code-review",
    name: "代码审查",
    emoji: "👀",
    description: "多维度代码质量检查",
    mode: "parallel",
    roles: [
      { roleId: "developer", order: 1 },
      { roleId: "reviewer", order: 1 },
      { roleId: "coordinator", order: 2 },
    ],
    useCase: "代码质量检查、安全审计",
  },
  {
    id: "investment-debate",
    name: "投资决策辩论",
    emoji: "⚔️",
    description: "多空观点碰撞，辅助投资决策",
    mode: "debate",
    roles: [
      { roleId: "researcher", order: 1 },  // 看涨方
      { roleId: "analyst", order: 1 },     // 看跌方
      { roleId: "quant", order: 1 },       // 数据方
      { roleId: "coordinator", order: 2 },
    ],
    useCase: "投资决策辅助、策略评估",
  },
  {
    id: "data-pipeline",
    name: "数据管道构建",
    emoji: "🔧",
    description: "ETL 流程开发与验证",
    mode: "sequential",
    roles: [
      { roleId: "analyst", order: 1 },
      { roleId: "developer", order: 2 },
      { roleId: "reviewer", order: 3 },
    ],
    useCase: "数据清洗、ETL 开发",
  },
];

// 模拟会话数据
export const mockSessions: CollaborationSession[] = [
  {
    id: "session-1",
    name: "2026 年 AI 芯片行业深度研究",
    templateId: "industry-report",
    mode: "hierarchical",
    status: "running",
    agents: [
      { roleId: "coordinator", agentId: "coord-1", agentName: "协调者 Agent" },
      { roleId: "researcher", agentId: "res-1", agentName: "研究员 Agent" },
      { roleId: "analyst", agentId: "ana-1", agentName: "数据分析师 Agent" },
      { roleId: "writer", agentId: "wri-1", agentName: "写手 Agent" },
    ],
    progress: 65,
    createdAt: "2026-03-29 09:00",
    updatedAt: "2026-03-29 11:30",
    cost: { tokens: 45000, time: 150 },
  },
  {
    id: "session-2",
    name: "均值回归策略开发",
    templateId: "quant-strategy",
    mode: "sequential",
    status: "completed",
    agents: [
      { roleId: "quant", agentId: "quant-1", agentName: "量化研究员 Agent" },
      { roleId: "developer", agentId: "dev-1", agentName: "程序员 Agent" },
    ],
    progress: 100,
    createdAt: "2026-03-28 14:00",
    updatedAt: "2026-03-28 18:30",
    cost: { tokens: 32000, time: 270 },
  },
  {
    id: "session-3",
    name: "交易核心代码审查",
    templateId: "code-review",
    mode: "parallel",
    status: "completed",
    agents: [
      { roleId: "developer", agentId: "dev-2", agentName: "程序员 Agent" },
      { roleId: "reviewer", agentId: "rev-1", agentName: "评审员 Agent" },
    ],
    progress: 100,
    createdAt: "2026-03-27 10:00",
    updatedAt: "2026-03-27 11:00",
    cost: { tokens: 18000, time: 60 },
  },
];
