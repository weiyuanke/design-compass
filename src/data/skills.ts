export interface Skill {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: string;
  downloads: number;
  version: string;
  author: string;
}

// 平台内置 Skill
export const platformSkills: Skill[] = [
  { id: "sk-web-scrape", name: "网页抓取", emoji: "🕸️", description: "从指定 URL 提取结构化内容，支持动态渲染页面", category: "数据采集", downloads: 3420, version: "1.2.0", author: "Lingjun" },
  { id: "sk-pdf-parse", name: "PDF 解析", emoji: "📄", description: "解析 PDF 文档，提取文本、表格和图片内容", category: "文档处理", downloads: 2890, version: "1.1.0", author: "Lingjun" },
  { id: "sk-json-transform", name: "JSON 转换", emoji: "🔄", description: "JSON 数据格式转换、字段映射与结构重组", category: "数据处理", downloads: 1560, version: "1.0.3", author: "Lingjun" },
  { id: "sk-text-classify", name: "文本分类", emoji: "🏷️", description: "基于预训练模型进行文本多分类，支持自定义类别", category: "NLP", downloads: 4100, version: "2.0.1", author: "Lingjun" },
  { id: "sk-sentiment", name: "情感分析", emoji: "😊", description: "分析文本情感倾向，输出正面/负面/中性评分", category: "NLP", downloads: 3200, version: "1.3.0", author: "Lingjun" },
  { id: "sk-image-ocr", name: "图片 OCR", emoji: "🔤", description: "从图片中识别并提取文字，支持多语言", category: "视觉", downloads: 5600, version: "2.1.0", author: "Lingjun" },
  { id: "sk-api-call", name: "HTTP 请求", emoji: "🌐", description: "通用 HTTP 请求工具，支持 REST API 调用与响应解析", category: "通用", downloads: 7800, version: "1.4.2", author: "Lingjun" },
  { id: "sk-code-exec", name: "代码执行", emoji: "⚡", description: "安全沙箱内执行 Python / JavaScript 代码片段", category: "开发", downloads: 6100, version: "1.5.0", author: "Lingjun" },
  { id: "sk-sql-query", name: "SQL 查询", emoji: "🗃️", description: "构建并执行 SQL 查询，返回结构化结果", category: "数据处理", downloads: 4500, version: "1.2.1", author: "Lingjun" },
  { id: "sk-email-send", name: "邮件发送", emoji: "✉️", description: "通过 SMTP 发送邮件，支持 HTML 模版与附件", category: "通信", downloads: 2300, version: "1.0.1", author: "Lingjun" },
];
