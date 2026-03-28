import { ArrowRight } from "lucide-react";

interface TemplateCardProps {
  name: string;
  emoji: string;
  desc: string;
  category: string;
  onClick?: () => void;
}

export function TemplateCard({ name, emoji, desc, category, onClick }: TemplateCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-accent/30 hover:shadow-[0_0_20px_-8px_hsl(260,60%,58%,0.15)] transition-all text-left group"
    >
      <div className="h-11 w-11 rounded-xl bg-accent/10 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground group-hover:text-accent transition-colors">{name}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent/80">{category}</span>
        </div>
        <p className="text-sm text-muted-foreground truncate mt-0.5">{desc}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0" />
    </button>
  );
}
