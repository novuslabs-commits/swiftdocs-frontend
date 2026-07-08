"use client";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, FileDown, FileSpreadsheet, ArrowRight, Clock, ChevronDown } from "lucide-react";
import { listExtractions, exportAllXlsx, exportAllCsv } from "@/lib/api";
import { Badge, confidenceVariant, docTypeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import type { ExtractionListItem, ExportFilters } from "@/types";

/* ── Constants ──────────────────────────────────────────────────────────────── */

const PAGE_SIZE = 25;

/* ── Helpers ────────────────────────────────────────────────────────────────── */

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href    = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const DOC_TYPES = [
  { value: "",               label: "All types" },
  { value: "invoice",        label: "Invoice" },
  { value: "purchase_order", label: "Purchase Order" },
  { value: "delivery_note",  label: "Delivery Note" },
  { value: "receipt",        label: "Receipt" },
  { value: "unrecognized",   label: "Unrecognized" },
];

type DayGroup = {
  dateKey: string;
  label: string;
  items: ExtractionListItem[];
};

function groupByDay(items: ExtractionListItem[]): DayGroup[] {
  const map = new Map<string, ExtractionListItem[]>();
  for (const item of items) {
    const dateKey = item.created_at.split("T")[0];
    if (!map.has(dateKey)) map.set(dateKey, []);
    map.get(dateKey)!.push(item);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, dayItems]) => ({
      dateKey,
      label: new Date(dateKey + "T12:00:00").toLocaleDateString(undefined, {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      }),
      items: dayItems.sort((a, b) => b.created_at.localeCompare(a.created_at)),
    }));
}

/* ── Skeleton rows ──────────────────────────────────────────────────────────── */

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-sw-border">
          {[200, 100, 72, 80, 64].map((w, j) => (
            <td key={j} className="py-3 px-4">
              <div className={cn("skeleton h-4 rounded", `w-[${w}px]`)} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

const SESSION_KEY = "sw_history_cache";

/* ── Page ──────────────────────────────────────────────────────────────────── */

export default function HistoryPage() {
  const { toast }    = useToast();
  const [items, setItems]             = useState<ExtractionListItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]         = useState(false);
  const [skip, setSkip]               = useState(0);
  const [exporting, setExporting]     = useState<"xlsx" | "csv" | null>(null);
  const hasCacheRef = useRef(false);

  // Filter state
  const [vendor,   setVendor]   = useState("");
  const [docType,  setDocType]  = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");

  const activeFilters: ExportFilters = {
    vendor:    vendor    || undefined,
    doc_type:  docType   || undefined,
    date_from: dateFrom  || undefined,
    date_to:   dateTo    || undefined,
  };

  /* ── Restore cache on first mount (instant load) ────────────────────────── */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const cached: ExtractionListItem[] = JSON.parse(raw);
        if (cached.length) {
          // Show cached data immediately — no spinner needed
          setItems(cached);
          setLoading(false);
          hasCacheRef.current = true;
          // Assume more pages may exist if cache is large
          setHasMore(cached.length >= PAGE_SIZE);
        }
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Fetch first page ───────────────────────────────────────────────────── */
  const fetchFirstPage = useCallback(async () => {
    if (!hasCacheRef.current) setLoading(true);
    try {
      const data = await listExtractions(activeFilters, { limit: PAGE_SIZE, skip: 0 });
      setItems(data);
      setSkip(0);
      setHasMore(data.length === PAGE_SIZE);
      // Cache only the unfiltered first page (used by upload page pre-fill too)
      if (!vendor && !docType && !dateFrom && !dateTo) {
        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch {}
      }
    } finally {
      setLoading(false);
      hasCacheRef.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendor, docType, dateFrom, dateTo]);

  useEffect(() => {
    fetchFirstPage();
  }, [fetchFirstPage]);

  /* ── Load more ──────────────────────────────────────────────────────────── */
  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const nextSkip = skip + PAGE_SIZE;
      const data = await listExtractions(activeFilters, { limit: PAGE_SIZE, skip: nextSkip });
      setItems((prev) => [...prev, ...data]);
      setSkip(nextSkip);
      setHasMore(data.length === PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  }

  /* ── Bulk export ───────────────────────────────────────────────────────── */
  async function handleExport(type: "xlsx" | "csv") {
    setExporting(type);
    try {
      const blob = type === "xlsx"
        ? await exportAllXlsx(activeFilters)
        : await exportAllCsv(activeFilters);
      downloadBlob(blob, `swiftdocs_export.${type}`);
      toast(`Exported as .${type}`, "success");
    } catch {
      toast("Export failed — no data or server error.", "error");
    } finally {
      setExporting(null);
    }
  }

  const groups = groupByDay(items);

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Clock size={20} className="text-sw-primary" aria-hidden="true" />
            History
          </h1>
          <p className="text-sm text-sw-muted mt-0.5">
            {loading
              ? "Loading…"
              : `${items.length} extraction${items.length !== 1 ? "s" : ""}${hasMore ? "+" : ""}`}
          </p>
        </div>

        {/* Bulk export */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            loading={exporting === "xlsx"}
            disabled={!!exporting || items.length === 0}
            onClick={() => handleExport("xlsx")}
            aria-label="Export filtered results as Excel"
          >
            <FileSpreadsheet size={13} />
            Export Excel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            loading={exporting === "csv"}
            disabled={!!exporting || items.length === 0}
            onClick={() => handleExport("csv")}
            aria-label="Export filtered results as CSV"
          >
            <FileDown size={13} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3">
        {/* Vendor search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sw-muted pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Filter by vendor…"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            className="input pl-8 w-52"
            aria-label="Filter by vendor"
          />
        </div>

        {/* Doc type */}
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="select w-44"
          aria-label="Filter by document type"
        >
          {DOC_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {/* Date range */}
        <label className="flex items-center gap-1.5 text-xs text-sw-muted">
          From
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            max={dateTo || undefined}
            className="input w-36"
            aria-label="From date (inclusive)"
          />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-sw-muted">
          To
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            min={dateFrom || undefined}
            className="input w-36"
            aria-label="To date (inclusive)"
          />
        </label>
      </div>

      {/* ── Table ── */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse" aria-label="Extraction history">
            <thead>
              <tr className="border-b border-sw-border bg-sw-bg/80">
                {["File", "Type", "Fields", "Confidence", "Timestamp", ""].map((h) => (
                  <th
                    key={h}
                    className="py-2.5 px-4 text-left text-xs font-semibold text-sw-muted uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows />
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sw-muted text-sm">
                    No extractions yet.{" "}
                    <Link href="/upload" className="text-sw-primary hover:underline">
                      Upload a document
                    </Link>{" "}
                    to get started.
                  </td>
                </tr>
              ) : (
                groups.map(({ dateKey, label, items: dayItems }) => (
                  <Fragment key={dateKey}>
                    {/* Day separator */}
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-2 bg-sw-bg/50 border-b border-t border-sw-border"
                      >
                        <span className="text-xs font-semibold text-sw-text">{label}</span>
                        <span className="ml-2 text-[10px] text-sw-muted">
                          {dayItems.length} extraction{dayItems.length !== 1 ? "s" : ""}
                        </span>
                      </td>
                    </tr>

                    {/* Day rows */}
                    {dayItems.map((item) => (
                      <tr
                        key={item.extraction_id}
                        className="border-b border-sw-border last:border-0 hover:bg-sw-bg/60 transition-colors"
                      >
                        {/* Filename */}
                        <td className="py-3 px-4 max-w-[200px]">
                          <span className="truncate block text-sw-text" title={item.filename}>
                            {item.filename}
                          </span>
                        </td>

                        {/* Doc type */}
                        <td className="py-3 px-4">
                          {item.doc_type
                            ? <Badge variant={docTypeVariant(item.doc_type)}>
                                {item.doc_type.replace(/_/g, " ")}
                              </Badge>
                            : <span className="text-sw-muted">—</span>
                          }
                        </td>

                        {/* Fields completeness */}
                        <td className="py-3 px-4 text-xs text-sw-muted whitespace-nowrap">
                          {item.fields_found != null
                            ? `${item.fields_found}/${item.fields_total}`
                            : "—"}
                        </td>

                        {/* Confidence */}
                        <td className="py-3 px-4">
                          {item.overall_confidence != null
                            ? <Badge variant={confidenceVariant(item.overall_confidence)}>
                                {Math.round(item.overall_confidence * 100)}%
                              </Badge>
                            : <span className="text-sw-muted">—</span>
                          }
                        </td>

                        {/* Timestamp */}
                        <td className="py-3 px-4 text-xs text-sw-muted whitespace-nowrap">
                          {new Date(item.created_at).toLocaleString(undefined, {
                            day: "2-digit", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit", hour12: false,
                          })}
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/review/${item.extraction_id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-sw-primary hover:underline underline-offset-2"
                            aria-label={`Review ${item.filename}`}
                          >
                            Review <ArrowRight size={11} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Load more ── */}
        {!loading && hasMore && (
          <div className="flex items-center justify-center px-4 py-4 border-t border-sw-border">
            <Button
              variant="secondary"
              size="sm"
              loading={loadingMore}
              onClick={handleLoadMore}
              aria-label="Load more extractions"
            >
              <ChevronDown size={14} />
              Load more
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
