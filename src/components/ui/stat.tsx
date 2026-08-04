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
        "bg-sw-surface border border-sw-border rounded-lg p-3 sm:p-5 shadow-card",
        "transition-shadow duration-200 hover:shadow-card-hover",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <p className="section-label text-[10px] sm:text-2xs">{label}</p>
          <p className="mt-1 sm:mt-1.5 font-semibold text-sw-text tabular-nums text-[clamp(15px,5vw,24px)] leading-tight">
            {value}
          </p>
          {sub && (
            <p className="mt-0.5 text-sw-muted whitespace-nowrap text-[clamp(8px,2.8vw,12px)]">{sub}</p>
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
          <div className="flex-shrink-0 rounded-lg bg-sw-primary/10 text-sw-primary p-[clamp(6px,2vw,10px)]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
