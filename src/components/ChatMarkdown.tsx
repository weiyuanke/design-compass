import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface ChatMarkdownProps {
  content: string;
  className?: string;
  /** 用户气泡（主色底）与助手气泡样式不同 */
  variant?: "agent" | "user";
}

/**
 * 渲染助手返回的 Markdown（含 GFM：表格、删除线、任务列表等）。
 */
export function ChatMarkdown({ content, className, variant = "agent" }: ChatMarkdownProps) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none text-left",
        variant === "agent" && [
          "prose-neutral dark:prose-invert",
          "prose-p:leading-relaxed prose-p:my-2 first:prose-p:mt-0 last:prose-p:mb-0",
          "prose-headings:font-semibold prose-headings:text-foreground prose-headings:mt-3 prose-headings:mb-1.5 first:prose-headings:mt-0",
          "prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5",
          "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground",
          "prose-pre:bg-muted/70 prose-pre:border prose-pre:border-border/60 prose-pre:rounded-lg prose-pre:text-sm",
          "prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:bg-muted/60 prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none",
          "prose-a:text-primary prose-a:underline-offset-2",
          "prose-table:text-sm prose-th:border prose-td:border prose-th:border-border/60 prose-td:border-border/60",
          "prose-img:rounded-md",
        ],
        variant === "user" && [
          "prose-invert",
          "prose-p:leading-relaxed prose-p:my-2 first:prose-p:mt-0 last:prose-p:mb-0",
          "prose-headings:font-semibold prose-headings:text-primary-foreground",
          "prose-ul:my-2 prose-ol:my-2",
          "prose-pre:bg-primary-foreground/10 prose-pre:border-primary-foreground/25 prose-pre:rounded-lg",
          "prose-code:bg-primary-foreground/15 prose-code:text-primary-foreground prose-code:before:content-none prose-code:after:content-none",
          "prose-a:text-primary-foreground",
        ],
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
