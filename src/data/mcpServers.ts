export interface McpServer {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: string;
  tools: number;
  status: "online" | "offline" | "deploying";
}

export interface UserMcpServer {
  id: string;
  name: string;
  emoji: string;
  description: string;
  status: "online" | "offline" | "deploying";
  tools: number;
  created: string;
  endpoint: string;
}

// 平台内置 MCP Server
export const platformMcpServers: McpServer[] = [
  { id: "mcp-db", name: "Database MCP", emoji: "🗄️", description: "连接主流数据库（MySQL、PostgreSQL、MongoDB），执行查询与数据操作", category: "数据", tools: 12, status: "online" },
  { id: "mcp-search", name: "Web Search MCP", emoji: "🔍", description: "集成搜索引擎 API，支持网页搜索、新闻检索和学术搜索", category: "搜索", tools: 6, status: "online" },
  { id: "mcp-git", name: "Git MCP", emoji: "📦", description: "Git 仓库操作，支持克隆、提交、分支管理与代码检索", category: "开发", tools: 15, status: "online" },
  { id: "mcp-fs", name: "File System MCP", emoji: "📁", description: "本地与远程文件系统操作，读写、搜索、压缩与解压", category: "文件", tools: 10, status: "online" },
  { id: "mcp-browser", name: "Browser MCP", emoji: "🌐", description: "无头浏览器自动化，支持页面抓取、截图与表单填写", category: "自动化", tools: 8, status: "online" },
  { id: "mcp-slack", name: "Slack MCP", emoji: "💬", description: "Slack 工作区集成，发送消息、管理频道与获取历史记录", category: "协作", tools: 9, status: "online" },
  { id: "mcp-email", name: "Email MCP", emoji: "📧", description: "邮件收发与管理，支持 SMTP/IMAP 协议，附件处理", category: "通信", tools: 7, status: "online" },
  { id: "mcp-notion", name: "Notion MCP", emoji: "📝", description: "Notion 数据库与页面操作，创建、查询与更新内容", category: "协作", tools: 11, status: "online" },
];

// 用户自建 MCP Server
export const userMcpServers: UserMcpServer[] = [
  { id: "user-mcp-1", name: "内部知识库 MCP", emoji: "📚", description: "公司内部文档检索与知识管理", status: "online", tools: 5, created: "2026-03-18", endpoint: "https://mcp.example.com/kb" },
  { id: "user-mcp-2", name: "CRM 数据 MCP", emoji: "👥", description: "连接企业 CRM 系统，查询客户与订单数据", status: "online", tools: 8, created: "2026-03-22", endpoint: "https://mcp.example.com/crm" },
  { id: "user-mcp-3", name: "监控告警 MCP", emoji: "🚨", description: "对接 Prometheus / Grafana，获取监控指标和告警", status: "offline", tools: 4, created: "2026-03-25", endpoint: "https://mcp.example.com/monitor" },
];
