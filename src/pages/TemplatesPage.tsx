import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const templates = [
  { id: "opencrawl", name: "OpenCrawl", emoji: "🕷️", desc: "网页抓取、内容解析、数据提取", category: "数据采集", configs: ["目标站点", "爬取深度", "解析规则", "存储方式"] },
  { id: "chatbot", name: "Chatbot", emoji: "💬", desc: "多轮对话、意图识别、回复生成", category: "对话", configs: ["人设", "知识库", "回复风格", "触发条件"] },
  { id: "coding", name: "Coding Agent", emoji: "💻", desc: "代码生成、审查、调试", category: "开发", configs: ["支持语言", "代码规范", "集成 IDE"] },
  { id: "doc", name: "文档助手", emoji: "📝", desc: "文档生成、摘要、翻译", category: "办公", configs: ["文档类型", "模板", "语言对"] },
  { id: "task", name: "任务执行者", emoji: "🎯", desc: "任务编排、定时执行、结果通知", category: "自动化", configs: ["任务流程", "触发条件", "通知渠道"] },
];

const TemplatesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 max-w-full space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-2xl font-bold">Agent 模版</h1>
        <p className="text-muted-foreground text-sm">选择一个模版，快速创建你的专属 Agent</p>
      </motion.div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="搜索模版..." className="pl-10 bg-secondary/50 border-border/50 h-10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tpl, i) => (
          <motion.div
            key={tpl.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <button
              onClick={() => navigate(`/create?template=${tpl.id}`)}
              className="w-full text-left rounded-xl bg-card border border-border/50 p-5 hover:border-accent/30 hover:shadow-[0_0_24px_-8px_hsl(260,60%,58%,0.15)] transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {tpl.emoji}
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent/80">{tpl.category}</span>
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">{tpl.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-3">{tpl.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {tpl.configs.map((c) => (
                  <span key={c} className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{c}</span>
                ))}
              </div>
              <div className="flex items-center gap-1 mt-4 text-sm text-accent/70 group-hover:text-accent transition-colors">
                使用此模版 <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesPage;
