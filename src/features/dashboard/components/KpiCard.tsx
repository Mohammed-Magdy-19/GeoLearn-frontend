import React from "react";

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  accentColor?: "brand-warm" | "primary" | "destructive" | "success";
  delay?: number;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  accentColor = "primary",
  delay = 0,
}) => {
  const accentStyles: Record<string, string> = {
    "brand-warm": "from-brand-warm/20 to-brand-warm/5 text-brand-primary border-brand-primary/20",
    primary: "from-primary/20 to-primary/5 text-primary border-primary/20",
    destructive: "from-destructive/20 to-destructive/5 text-destructive border-destructive/20",
    success: "from-brand-accent/20 to-brand-accent/5 text-brand-accent border-brand-accent/20",
  };

  const trendIcons: Record<string, string> = {
    up: "↑",
    down: "↓",
    neutral: "→",
  };

  const trendColors: Record<string, string> = {
    up: "text-brand-accent",
    down: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${accentStyles[accentColor]} p-5 shadow-card animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-foreground font-display">
            {typeof value === "number" ? value.toLocaleString("ar-EG") : value}
          </p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendColors[trend]}`}>
              <span>{trendIcons[trend]}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className="shrink-0 p-2.5 rounded-lg bg-background/50">{icon}</div>
      </div>
    </div>
  );
};

export default KpiCard;
