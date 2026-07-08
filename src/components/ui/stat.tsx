import { cn } from "@/lib/cn";

interface StatProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  trend?: { delta: number; label: string };
  className?: string;
}

export function Stat({ label, value, sub, icon, trend, className }: StatProps) {
  return (
    <div
      className={cn(
        "bg-sw-surface border border-sw-border rounded-lg p-5 shadow-card",
        "transition-shadow duration-200 hover:shadow-card-hover",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="section-label">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold text-sw-text tabular-nums truncate">
            {value}
          </p>
          {sub && (
            <p className="mt-0.5 text-xs text-sw-muted">{sub}</p>
          )}
          {trend && (
            <p
              className={cn(
                "mt-1.5 text-xs font-medium",
                trend.delta >= 0 ? "text-emerald-600" : "text-sw-danger"
              )}
            >
              {trend.delta >= 0 ? "↑" : "↓"} {Math.abs(trend.delta)}%{" "}
              <span className="text-sw-muted font-normal">{trend.label}</span>
            </p>
          )}
        </div>

        {icon && (
          <div className="flex-shrink-0 p-2.5 rounded-lg bg-sw-primary/10 text-sw-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
