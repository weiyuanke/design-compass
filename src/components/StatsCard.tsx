import { LucideIcon, TrendingUp } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend: string;
}

export function StatsCard({ icon: Icon, label, value, trend }: StatsCardProps) {
  return (
    <div className="rounded-xl bg-card border border-border/50 p-4 hover:border-primary/20 transition-colors group">
      <div className="flex items-center justify-between mb-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        {trend && (
          <span className="text-xs text-emerald-400 flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" /> {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
