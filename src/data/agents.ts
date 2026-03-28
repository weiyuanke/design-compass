// Shared data source for all agent-related pages

export interface PlatformAgent {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: string;
  calls: number;
  quickCommands: string[];
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
  { id: "translate", name: "智能翻译", emoji: "🌐", description: "支持多语言互译，自动识别语言并提供高质量翻译", category: "语言", calls: 12800, quickCommands: ["翻译成英文", "翻译成日文", "中英对照翻译"] },
  { id: "crawler", name: "网页爬虫", emoji: "🕷️", description: "输入 URL 即可抓取网页内容，支持结构化数据提取", category: "数据", calls: 8920, quickCommands: ["抓取网页内容", "提取页面链接", "获取页面标题"] },
  { id: "summary", name: "文档摘要", emoji: "📝", description: "上传文档或粘贴长文，快速生成结构化摘要", category: "效率", calls: 6540, quickCommands: ["生成摘要", "提取关键词", "列出要点"] },
  { id: "code", name: "代码助手", emoji: "💻", description: "代码生成、审查、调试、重构，支持主流编程语言", category: "开发", calls: 15200, quickCommands: ["代码审查", "生成函数", "解释代码"] },
  { id: "data", name: "数据分析", emoji: "📊", description: "上传数据文件，自动生成分析报告和可视化图表", category: "数据", calls: 4300, quickCommands: ["分析数据", "生成图表", "数据清洗"] },
  { id: "image", name: "图片识别", emoji: "🖼️", description: "上传图片进行内容识别、OCR 文字提取", category: "视觉", calls: 7600, quickCommands: ["识别图片", "提取文字", "描述图片内容"] },
  { id: "email", name: "邮件撰写", emoji: "✉️", description: "根据场景和要求自动生成专业邮件", category: "效率", calls: 3100, quickCommands: ["写商务邮件", "写感谢信", "写会议邀请"] },
  { id: "sql", name: "SQL 生成器", emoji: "🗃️", description: "用自然语言描述需求，自动生成 SQL 查询语句", category: "开发", calls: 5800, quickCommands: ["生成查询语句", "优化 SQL", "解释 SQL"] },
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
