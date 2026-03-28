import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface ToolAgent {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: string;
  calls: number;
}

const toolAgents: ToolAgent[] = [
  { id: "t1", name: "智能翻译", emoji: "🌐", description: "支持多语言互译，自动识别语言并提供高质量翻译", category: "语言", calls: 12800 },
  { id: "t2", name: "网页爬虫", emoji: "🕷️", description: "输入 URL 即可抓取网页内容，支持结构化数据提取", category: "数据", calls: 8920 },
  { id: "t3", name: "文档摘要", emoji: "📝", description: "上传文档或粘贴长文，快速生成结构化摘要", category: "效率", calls: 6540 },
  { id: "t4", name: "代码助手", emoji: "💻", description: "代码生成、审查、调试、重构，支持主流编程语言", category: "开发", calls: 15200 },
  { id: "t5", name: "数据分析", emoji: "📊", description: "上传数据文件，自动生成分析报告和可视化图表", category: "数据", calls: 4300 },
  { id: "t6", name: "图片识别", emoji: "🖼️", description: "上传图片进行内容识别、OCR 文字提取", category: "视觉", calls: 7600 },
  { id: "t7", name: "邮件撰写", emoji: "✉️", description: "根据场景和要求自动生成专业邮件", category: "效率", calls: 3100 },
  { id: "t8", name: "SQL 生成器", emoji: "🗃️", description: "用自然语言描述需求，自动生成 SQL 查询语句", category: "开发", calls: 5800 },
];

const ToolsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = toolAgents.filter(
    (a) =>
      a.name.includes(search) ||
      a.description.includes(search) ||
      a.category.includes(search)
  );

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">平台 Agent</h1>
        <p className="text-sm text-muted-foreground mt-1">
          平台内置的公共 Agent，开箱即用，直接对话交互
        </p>
      </motion.div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索平台 Agent..."
          className="pl-10 bg-secondary/50 border-border/50 h-10"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex flex-col gap-3 p-5 rounded-xl bg-card border border-border/50 hover:border-border transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center text-xl flex-shrink-0">
                {agent.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{agent.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {agent.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {agent.description}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                已被调用 {agent.calls.toLocaleString()} 次
              </span>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 h-8"
                onClick={() => navigate(`/chat?tool=${agent.id}`)}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                开始对话
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ToolsPage;
