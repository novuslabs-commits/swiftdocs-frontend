"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Clock, Loader2, CheckCircle2, XCircle,
  FileText, FileImage, ArrowRight, AlertTriangle, RotateCcw, X,
} from "lucide-react";
import { Badge, docTypeVariant } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import type { Document, DocStatus } from "@/types";
import type { RejectedFile } from "./DropZone";

/* ── Status config ─────────────────────────────────────────────────────────── */

const STATUS_CONFIG: Record<
  DocStatus,
  { icon: React.ReactNode; label: string; pill: string; bar: string }
> = {
  queued: {
    icon:  <Clock size={12} />,
    label: "Queued",
    pill:  "bg-slate-100 text-slate-500",
    bar:   "bg-slate-300",
  },
  processing: {
    icon:  <Loader2 size={12} className="animate-spin" />,
    label: "Processing",
    pill:  "bg-sw-primary/10 text-sw-primary",
    bar:   "bg-sw-primary",
  },
  completed: {
    icon:  <CheckCircle2 size={12} />,
    label: "Done",
    pill:  "bg-emerald-50 text-emerald-700",
    bar:   "bg-emerald-400",
  },
  failed: {
    icon:  <XCircle size={12} />,
    label: "Failed",
    pill:  "bg-red-50 text-red-600",
    bar:   "bg-red-400",
  },
};

/* ── Sub-components ────────────────────────────────────────────────────────── */

function StatusPill({ status }: { status: DocStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.queued;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 shrink-0",
        "text-2xs font-semibold uppercase tracking-wider",
        cfg.pill
      )}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function DocFileIcon({ filename }: { filename: string }) {
  const isPdf = filename?.toLowerCase().endsWith(".pdf");
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
        isPdf
          ? "bg-red-50 text-red-400"
          : "bg-blue-50 text-blue-400"
      )}
      aria-hidden="true"
    >
      {isPdf ? <FileText size={15} /> : <FileImage size={15} />}
    </div>
  );
}

/* ── Dismiss button ────────────────────────────────────────────────────────── */

function DismissButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "shrink-0 flex items-center justify-center h-6 w-6 rounded-full",
        "text-sw-muted hover:text-sw-text hover:bg-slate-100",
        "transition-colors duration-100"
      )}
    >
      <X size={12} />
    </button>
  );
}

/* ── BatchQueue ─────────────────────────────────────────────────────────────── */

interface Props {
  documents: Document[];
  extractions?: Record<string, string>; // doc_id → extraction_id
  rejectedFiles?: RejectedFile[];
  onRetry?: (id: string) => Promise<void>;
  onRemoveDocument?: (id: string) => void;
  onRemoveRejected?: (index: number) => void;
}

export default function BatchQueue({
  documents,
  extractions = {},
  rejectedFiles = [],
  onRetry,
  onRemoveDocument,
  onRemoveRejected,
}: Props) {
  const [retrying, setRetrying] = useState<Set<string>>(new Set());
  const total      = documents.length + rejectedFiles.length;
  if (total === 0) return null;

  const queued     = documents.filter((d) => d.status === "queued").length;
  const processing = documents.filter((d) => d.status === "processing").length;
  const done       = documents.filter((d) => d.status === "completed").length;
  const failed     = documents.filter((d) => d.status === "failed").length;
  const skipped    = rejectedFiles.length;

  return (
    <section className="mt-6 animate-fade-in" aria-label="Upload queue">

      {/* ── Stats header ── */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-sw-text">
          Queue
          {queued > 0 && (
            <span className="ml-2 text-2xs font-normal text-sw-muted">
              {queued} waiting
            </span>
          )}
        </h3>
        <div className="flex items-center gap-3 text-2xs">
          {done > 0 && (
            <span className="text-emerald-600 font-semibold">{done} done</span>
          )}
          {processing > 0 && (
            <span className="text-sw-primary font-semibold">{processing} processing</span>
          )}
          {failed > 0 && (
            <span className="text-red-500 font-semibold">{failed} failed</span>
          )}
          {skipped > 0 && (
            <span className="text-amber-500 font-semibold">{skipped} skipped</span>
          )}
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="space-y-2">

        {/* Server-tracked documents */}
        {documents.map((doc) => {
          const extractionId = extractions[doc.id];
          const isDone    = doc.status === "completed";
          const isFailed  = doc.status === "failed";
          const isTerminal = isDone || isFailed;
          const barCls    = STATUS_CONFIG[doc.status]?.bar ?? "bg-slate-300";

          return (
            <div
              key={doc.id}
              className={cn(
                "relative flex items-center gap-3 rounded-lg border px-4 py-3",
                "bg-sw-surface shadow-card overflow-hidden transition-shadow",
                isDone ? "border-emerald-200/60" : "border-sw-border"
              )}
            >
              {/* Left status bar */}
              <div
                aria-hidden="true"
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg transition-colors duration-500",
                  barCls
                )}
              />

              <DocFileIcon filename={doc.original_filename} />

              {/* Filename */}
              <span
                className="flex-1 min-w-0 text-sm text-sw-text truncate pl-1"
                title={doc.original_filename}
              >
                {doc.original_filename}
              </span>

              {/* Doc type badge */}
              {doc.doc_type && (
                <Badge
                  variant={docTypeVariant(doc.doc_type)}
                  className="shrink-0 hidden sm:flex"
                >
                  {doc.doc_type.replace(/_/g, " ")}
                </Badge>
              )}

              <StatusPill status={doc.status} />

              {/* Review link / Retry button */}
              {isDone && extractionId ? (
                <Link
                  href={`/review/${extractionId}`}
                  className="shrink-0 flex items-center gap-1 text-xs font-semibold text-sw-primary hover:text-sw-primary-dark transition-colors"
                  aria-label={`Review ${doc.original_filename}`}
                >
                  Review <ArrowRight size={11} />
                </Link>
              ) : isDone ? (
                <span className="shrink-0 text-2xs text-sw-muted animate-pulse">
                  Loading…
                </span>
              ) : isFailed && onRetry ? (
                <button
                  onClick={async () => {
                    setRetrying((s) => new Set(s).add(doc.id));
                    try { await onRetry(doc.id); } finally {
                      setRetrying((s) => { const n = new Set(s); n.delete(doc.id); return n; });
                    }
                  }}
                  disabled={retrying.has(doc.id)}
                  className="shrink-0 flex items-center gap-1 text-xs font-semibold text-sw-primary hover:text-sw-primary-dark transition-colors disabled:opacity-50"
                  aria-label={`Retry ${doc.original_filename}`}
                >
                  {retrying.has(doc.id)
                    ? <Loader2 size={11} className="animate-spin" />
                    : <RotateCcw size={11} />}
                  Retry
                </button>
              ) : null}

              {/* Dismiss button — only on terminal states */}
              {isTerminal && onRemoveDocument && (
                <DismissButton
                  onClick={() => onRemoveDocument(doc.id)}
                  label={`Remove ${doc.original_filename} from queue`}
                />
              )}
            </div>
          );
        })}

        {/* Locally rejected files (never reached server) */}
        {rejectedFiles.map((r, i) => (
          <div
            key={`rejected-${i}`}
            className="relative flex items-center gap-3 rounded-lg border border-amber-200/60 px-4 py-3 bg-sw-surface shadow-card overflow-hidden"
          >
            <div
              aria-hidden="true"
              className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg bg-amber-400"
            />

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-400">
              <AlertTriangle size={15} aria-hidden="true" />
            </div>

            <span
              className="flex-1 min-w-0 text-sm text-sw-text truncate pl-1"
              title={r.name}
            >
              {r.name}
            </span>

            <span className="shrink-0 text-2xs text-amber-600 hidden sm:block">
              {r.reason}
            </span>

            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 shrink-0",
                "text-2xs font-semibold uppercase tracking-wider",
                "bg-amber-50 text-amber-600"
              )}
            >
              <AlertTriangle size={11} />
              Skipped
            </span>

            {onRemoveRejected && (
              <DismissButton
                onClick={() => onRemoveRejected(i)}
                label={`Remove ${r.name} from list`}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
