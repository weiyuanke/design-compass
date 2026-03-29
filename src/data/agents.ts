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
    id: "k8s-ops", 
    name: "Kubernetes 运维专家", 
    emoji: "☸️", 
    description: "Kubernetes 集群运维、故障诊断、性能优化、生成集群运行报告", 
    category: "运维", 
    calls: 8520, 
    quickCommands: ["诊断集群问题", "查看 Pod 状态", "生成运维报告", "节点资源分析"],
    gradient: "from-blue-500/20 to-cyan-500/5"
  },
  { 
    id: "project-mgr", 
    name: "项目管理助手", 
    emoji: "📋", 
    description: "Jira 操作、会议共识记录、需求管理、周报整理", 
    category: "效率", 
    calls: 12300, 
    quickCommands: ["创建 Jira 需求", "整理会议共识", "生成本周工作汇总", "同步项目进度"],
    gradient: "from-amber-500/20 to-orange-500/5"
  },
  { 
    id: "ask-support", 
    name: "ASK 系统专家", 
    emoji: "💻", 
    description: "ASK 问题排查、提交离线任务、创建虚拟机", 
    category: "运维", 
    calls: 6780, 
    quickCommands: ["排查 ASK 问题", "提交离线任务", "创建虚拟机", "查看任务日志"],
    gradient: "from-indigo-500/20 to-purple-500/5"
  },
  { 
    id: "admin-helper", 
    name: "行政小助手", 
    emoji: "🏢", 
    description: "请假申请、费用报销、行政事务办理", 
    category: "行政", 
    calls: 4560, 
    quickCommands: ["申请请假", "提交报销", "查询报销进度", "开具证明"],
    gradient: "from-pink-500/20 to-rose-500/5"
  },
  { 
    id: "factor-mining", 
    name: "因子挖掘 Agent", 
    emoji: "🔬", 
    description: "自动发现有效因子，支持遗传算法和神经网络挖掘，生成因子分析报告", 
    category: "投研", 
    calls: 15600, 
    quickCommands: ["开始因子挖掘", "运行遗传算法", "神经网络挖掘", "查看因子 IC", "导出因子库"],
    gradient: "from-emerald-500/20 to-teal-500/5"
  },
  { 
    id: "report-analyzer", 
    name: "研报解读 Agent", 
    emoji: "📊", 
    description: "解析卖方研报，提取核心观点、盈利预测和目标价，生成结构化摘要", 
    category: "投研", 
    calls: 9800, 
    quickCommands: ["解读最新研报", "提取核心观点", "汇总盈利预测", "对比历史评级"],
    gradient: "from-violet-500/20 to-purple-500/5"
  },
  { 
    id: "sentinel", 
    name: "舆情监控 Agent", 
    emoji: "🛰️", 
    description: "实时监控新闻/社交媒体/公告，生成情绪评分和交易信号告警", 
    category: "投研", 
    calls: 23400, 
    quickCommands: ["查看今日舆情", "情绪评分汇总", "负面新闻告警", "生成交易信号"],
    gradient: "from-red-500/20 to-orange-500/5"
  },
];

// 用户创建的 Agent
export const myAgents: MyAgent[] = [
  { id: "my-1", name: "我的爬虫助手", emoji: "🕷️", template: "OpenCrawl", status: "active", calls: 456, created: "2026-03-15", quickCommands: ["抓取目标页面", "提取数据", "导出结果"] },
  { id: "my-2", name: "客服机器人", emoji: "💬", template: "Chatbot", status: "active", calls: 1289, created: "2026-03-10", quickCommands: ["查看常见问题", "转接人工", "查询订单"] },
  { id: "my-3", name: "代码审查助手", emoji: "💻", template: "Coding Agent", status: "inactive", calls: 87, created: "2026-03-20", quickCommands: ["审查代码", "检查规范", "生成报告"] },
  { id: "my-4", name: "合同摘要生成器", emoji: "📝", template: "文档助手", status: "active", calls: 234, created: "2026-03-22", quickCommands: ["生成摘要", "提取条款", "对比合同"] },
  { id: "my-5", name: "数据采集 Bot", emoji: "🕷️", template: "OpenCrawl", status: "active", calls: 678, created: "2026-03-25", quickCommands: ["开始采集", "查看进度", "导出数据"] },
];

// Agent 模版
export const templates: Template[] = [
  { id: "opencrawl", name: "OpenCrawl", emoji: "🕷️", desc: "网页爬虫 Agent", category: "数据采集" },
  { id: "chatbot", name: "Chatbot", emoji: "💬", desc: "对话机器人模板", category: "对话" },
  { id: "coding", name: "Coding Agent", emoji: "💻", desc: "代码助手模板", category: "开发" },
  { id: "doc", name: "文档助手", emoji: "📝", desc: "文档生成、摘要、翻译", category: "办公" },
];

// Helper: 构建对话页 Agent 选择列表（平台 + 我的）
export function getAllChatAgents() {
  const platform = platformAgents.map((a) => ({
    id: a.id,
    name: a.name,
    emoji: a.emoji,
    description: a.description,
    quickCommands: a.quickCommands,
    type: "platform" as const,
  }));
  const mine = myAgents
    .filter((a) => a.status === "active")
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
