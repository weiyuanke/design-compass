interface AgentCardProps {
  name: string;
  emoji: string;
  desc: string;
  status: "online" | "offline";
  onClick?: () => void;
}

export function AgentCard({ name, emoji, desc, status, onClick }: AgentCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-[0_0_20px_-8px_hsl(175,80%,50%,0.15)] transition-all text-left group"
    >
      <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground group-hover:text-primary transition-colors">{name}</span>
          <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${status === "online" ? "bg-emerald-500" : "bg-muted-foreground/50"}`} />
        </div>
        <p className="text-sm text-muted-foreground truncate mt-0.5">{desc}</p>
      </div>
    </button>
  );
}
