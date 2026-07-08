"use client";
import { useEffect, useRef, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { getMetrics, listExtractions } from "@/lib/api";
import MetricsCards from "@/components/MetricsCards";
import { Badge, docTypeVariant } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { Metrics, ExtractionListItem } from "@/types";

/* ── Types ──────────────────────────────────────────────────────────────────── */

type Range = "7d" | "30d" | "1y";

const RANGES: { label: string; value: Range }[] = [
  { label: "7D",  value: "7d" },
  { label: "30D", value: "30d" },
  { label: "1Y",  value: "1y" },
];

/* ── Helpers ────────────────────────────────────────────────────────────────── */

function buildChartData(items: ExtractionListItem[], range: Range) {
  const now = Date.now();

  if (range === "1y") {
    // Group by calendar month — last 12 months
    const months: { key: string; label: string }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      months.push({ key, label });
    }
    const counts: Record<string, number> = Object.fromEntries(
      months.map((m) => [m.key, 0])
    );
    items.forEach((item) => {
      const d = new Date(item.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key in counts) counts[key]++;
    });
    return months.map((m) => ({ date: m.label, docs: counts[m.key] }));
  }

  // Daily view for 7d and 30d
  const days = range === "7d" ? 7 : 30;
  const counts: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86_400_000);
    counts[d.toLocaleDateString("en-US", { month: "short", day: "numeric" })] = 0;
  }
  items.forEach((item) => {
    const itemMs = new Date(item.created_at).getTime();
    if (now - itemMs > days * 86_400_000) return;
    const label = new Date(item.created_at).toLocaleDateString("en-US", {
      month: "short", day: "numeric",
    });
    if (label in counts) counts[label]++;
  });
  return Object.entries(counts).map(([date, docs]) => ({ date, docs }));
}

const DOC_TYPE_LABELS: Record<string, string> = {
  invoice:        "Invoice",
  purchase_order: "Purchase Order",
  delivery_note:  "Delivery Note",
  receipt:        "Receipt",
  unrecognized:   "Unrecognized",
};

/* ── Skeleton ─────────────────────────────────────────────────────────────── */

function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton h-28 rounded-lg" />
      ))}
    </div>
  );
}

/* ── Custom tooltip ─────────────────────────────────────────────────────────── */

function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: { value: number }[]; label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-sw-surface border border-sw-border rounded-lg px-3 py-2 shadow-card-md text-xs">
      <p className="text-sw-muted">{label}</p>
      <p className="font-semibold text-sw-text mt-0.5">
        {payload[0].value} doc{payload[0].value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

/* ── Range selector ─────────────────────────────────────────────────────────── */

function RangeSelector({ range, onChange }: { range: Range; onChange: (r: Range) => void }) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-sw-border bg-sw-bg p-0.5">
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150",
            range === r.value
              ? "bg-sw-primary text-white shadow-sm"
              : "text-sw-muted hover:text-sw-text hover:bg-sw-surface"
          )}
          aria-pressed={range === r.value}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

const SESSION_KEY = "sw_metrics_cache";

type MetricsCache = { metrics: Metrics; items: ExtractionListItem[] };

/* ── Page ──────────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [items,   setItems]   = useState<ExtractionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [range,   setRange]   = useState<Range>("30d");
  const hasCacheRef = useRef(false);

  /* ── Restore cache on mount ──────────────────────────────────────────────── */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const cached: MetricsCache = JSON.parse(raw);
        if (cached.metrics) {
          setMetrics(cached.metrics);
          setItems(cached.items ?? []);
          setLoading(false);
          hasCacheRef.current = true;
        }
      }
    } catch {}
  }, []);

  /* ── Fetch on mount (background if cache exists) ────────────────────────── */
  useEffect(() => {
    async function fetchAll() {
      if (!hasCacheRef.current) setLoading(true);
      try {
        // Fetch up to 200 most recent items for chart accuracy; backend caps at 200
        const [m, i] = await Promise.all([getMetrics(), listExtractions(undefined, { limit: 200 })]);
        setMetrics(m);
        setItems(i);
        hasCacheRef.current = true;
        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ metrics: m, items: i })); } catch {}
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Derived data
  const totalFieldsFound = items.reduce((s, i) => s + (i.fields_found || 0), 0);

  const typeCounts = items.reduce<Record<string, number>>((acc, item) => {
    if (item.doc_type) acc[item.doc_type] = (acc[item.doc_type] || 0) + 1;
    return acc;
  }, {});

  const chartData  = buildChartData(items, range);
  const chartTotal = chartData.reduce((s, d) => s + d.docs, 0);

  const xAxisInterval = range === "7d" ? 0 : range === "30d" ? 4 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <LayoutDashboard size={20} className="text-sw-primary" aria-hidden="true" />
          Dashboard
        </h1>
        <p className="text-sm text-sw-muted mt-0.5">Live extraction stats</p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <SkeletonStats />
      ) : metrics ? (
        <MetricsCards metrics={metrics} totalFieldsFound={totalFieldsFound} />
      ) : (
        <p className="text-sw-danger text-sm">Failed to load metrics.</p>
      )}

      {/* Doc type breakdown */}
      {!loading && Object.keys(typeCounts).length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-sw-muted font-medium mr-1">By type:</span>
          {Object.entries(typeCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([type, count]) => (
              <span key={type} className="inline-flex items-center gap-1.5">
                <Badge variant={docTypeVariant(type)}>
                  {DOC_TYPE_LABELS[type] ?? type.replace(/_/g, " ")}
                </Badge>
                <span className="text-xs text-sw-muted tabular-nums">{count}</span>
              </span>
            ))}
        </div>
      )}

      {/* Activity chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Documents processed</CardTitle>
            {!loading && (
              <p className="text-xs text-sw-muted mt-0.5">
                {chartTotal} doc{chartTotal !== 1 ? "s" : ""} in selected period
              </p>
            )}
          </div>
          <RangeSelector range={range} onChange={setRange} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="skeleton h-52 rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="swGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#6366F1" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E4E7EF"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                  interval={xAxisInterval}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="docs"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fill="url(#swGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#6366F1", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
