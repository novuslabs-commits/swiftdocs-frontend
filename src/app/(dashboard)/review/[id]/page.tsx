"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, FileDown, FileSpreadsheet, Clock, Layers, Download, ImageIcon,
} from "lucide-react";
import { getExtraction, correctField, exportXlsx, exportCsv, downloadDocumentAsPdf, downloadDocumentAsImage } from "@/lib/api";
import ExtractionTable from "@/components/ExtractionTable";
import { Badge, confidenceVariant, docTypeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import type { Extraction } from "@/types";

/* ── Helpers ────────────────────────────────────────────────────────────────── */

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href    = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function isPdf(url: string) {
  return url.split("?")[0].toLowerCase().endsWith(".pdf");
}

const WEB_IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg"]);

function isWebImage(url: string) {
  const path = url.split("?")[0].toLowerCase();
  return WEB_IMAGE_EXTS.has(path.substring(path.lastIndexOf(".")));
}

function docTypeLabel(t: string | null) {
  return (t ?? "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ── Skeleton ─────────────────────────────────────────────────────────────── */

function ReviewSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="skeleton h-7 w-64 rounded" />
      <div className="grid lg:grid-cols-[1fr_2fr] gap-5">
        <div className="skeleton h-64 rounded-lg" />
        <div className="skeleton h-64 rounded-lg" />
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────────── */

export default function ReviewPage() {
  const { id }      = useParams<{ id: string }>();
  const { toast }   = useToast();
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    if (id) getExtraction(id).then(setExtraction).finally(() => setLoading(false));
  }, [id]);

  async function handleCorrection(field: string, value: string) {
    if (!extraction) return;
    setSaving(true);
    try {
      await correctField(extraction.extraction_id, field, value);
      const updated = await getExtraction(extraction.extraction_id);
      setExtraction(updated);
      toast("Correction saved.", "success");
    } catch {
      toast("Failed to save correction.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleExport(type: "xlsx" | "csv") {
    if (!extraction) return;
    try {
      const blob = type === "xlsx"
        ? await exportXlsx(extraction.extraction_id)
        : await exportCsv(extraction.extraction_id);
      const stem = (extraction.filename ?? "extraction").replace(/\.[^.]+$/, "");
      downloadBlob(blob, `${stem}.${type}`);
      toast(`Exported as .${type}`, "success");
    } catch {
      toast("Export failed.", "error");
    }
  }

  async function handleDownload(format: "pdf" | "image") {
    if (!extraction?.document_id) return;
    try {
      const blob = format === "pdf"
        ? await downloadDocumentAsPdf(extraction.document_id)
        : await downloadDocumentAsImage(extraction.document_id);
      const stem = (extraction.filename ?? "document").replace(/\.[^.]+$/, "");
      downloadBlob(blob, `${stem}.${format === "pdf" ? "pdf" : "png"}`);
    } catch {
      toast("Download failed.", "error");
    }
  }

  if (loading) return <ReviewSkeleton />;
  if (!extraction) {
    return (
      <div className="text-center py-20">
        <p className="text-sw-muted">Extraction not found.</p>
        <Link href="/history" className="text-sw-primary text-sm mt-2 inline-block hover:underline">
          ← Back to History
        </Link>
      </div>
    );
  }

  const confPct  = Math.round((extraction.overall_confidence ?? 0) * 100);
  const timeSecs = extraction.processing_time_ms
    ? (extraction.processing_time_ms / 1000).toFixed(1)
    : null;

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="space-y-4">
        
        {/* Top Row */}
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="min-w-0 flex-1">
            <Link
              href="/history"
              className="flex items-center gap-1 text-xs text-sw-muted hover:text-sw-text mb-2 transition-colors w-fit"
            >
              <ArrowLeft size={12} /> History
            </Link>
            
            <h1 
              className="page-title truncate text-[clamp(12px,4vw,24px)]" 
              title={extraction.filename ?? "Document"}
            >
              {extraction.filename ?? "Document"}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 mt-6">
            {saving && (
              <span className="text-xs text-sw-primary animate-pulse">Saving…</span>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport("xlsx")}
              aria-label="Export as Excel"
              className="h-8 px-2 flex items-center gap-1"
            >
              <FileSpreadsheet size={13} />
              <span className="hidden sm:inline text-xs">Export Excel</span>
              <span className="sm:hidden text-xs">Excel</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport("csv")}
              aria-label="Export as CSV"
              className="h-8 px-2 flex items-center gap-1"
            >
              <FileDown size={13} />
              <span className="hidden sm:inline text-xs">Export CSV</span>
              <span className="sm:hidden text-xs">CSV</span>
            </Button>
          </div>
        </div>

        {/* Bottom Row: Restored to a single flex row with horizontal scroll on mobile */}
        <div className="flex items-center gap-1 sm:gap-1 w-full overflow-x-auto pb-1">
          {extraction.doc_type && (
            <Badge 
              variant={docTypeVariant(extraction.doc_type)} 
              className="shrink-0 whitespace-nowrap uppercase text-[clamp(7px,2vw,12px)] px-2 py-0.5"
            >
              {docTypeLabel(extraction.doc_type)}
            </Badge>
          )}
          
          {extraction.overall_confidence != null && (
            <Badge 
              variant={confidenceVariant(extraction.overall_confidence)} 
              className="shrink-0 whitespace-nowrap uppercase text-[clamp(7px,2vw,12px)] px-2 py-0.5"
            >
              {confPct}% confidence
            </Badge>
          )}
          
          <span className="shrink-0 whitespace-nowrap text-[clamp(7px,2vw,12px)] text-sw-muted flex items-center gap-1.5">
            <Layers size={11} aria-hidden="true" />
            {extraction.fields_found ?? "?"}/{extraction.fields_total ?? "?"} fields
          </span>
          
          {timeSecs && (
            <span className="shrink-0 whitespace-nowrap text-[clamp(7px,2vw,12px)] text-sw-muted flex items-center gap-1.5">
              <Clock size={11} aria-hidden="true" />
              {timeSecs}s
            </span>
          )}
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid lg:grid-cols-[300px_1fr] gap-5 items-start">
        
        {/* Left: document preview */}
        {/* Changed `sticky` to `lg:sticky lg:top-6` so it only sticks on wide screens */}
        <Card className="lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle className="text-[clamp(14px,3vw,18px)]">Document Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {extraction.file_url && isPdf(extraction.file_url) ? (
              <iframe
                src={extraction.file_url}
                title={`Preview of ${extraction.filename ?? "document"}`}
                className="w-full rounded-b-lg border-0"
                style={{ height: "420px" }}
              />
            ) : extraction.file_url && isWebImage(extraction.file_url) ? (
              <div className="relative w-full aspect-[3/4] overflow-hidden bg-sw-bg">
                <Image
                  src={extraction.file_url}
                  alt={`Preview of ${extraction.filename ?? "document"}`}
                  fill
                  className="object-contain"
                  sizes="300px"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-52 gap-2 text-sw-muted bg-sw-bg">
                <ImageIcon size={28} className="opacity-30" />
                <span className="text-[clamp(11px,2vw,14px)]">Preview not available</span>
                <span className="text-[clamp(9px,1.5vw,12px)] opacity-60">Download to view this file</span>
              </div>
            )}
            
            {/* Download buttons */}
            <div className="flex gap-2 p-3 border-t border-sw-border rounded-b-lg">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 text-[clamp(11px,2vw,14px)]"
                onClick={() => handleDownload("pdf")}
                aria-label="Download as PDF"
              >
                <Download size={13} />
                PDF
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 text-[clamp(11px,2vw,14px)]"
                onClick={() => handleDownload("image")}
                aria-label="Download as Image"
              >
                <ImageIcon size={13} />
                Image
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: extraction table */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-[clamp(10px,3vw,18px)]">Extracted Fields</CardTitle>
            <span className="text-[clamp(10px,1.5vw,12px)] text-sw-muted">
              Click <strong>Edit</strong> to correct a value
            </span>
          </CardHeader>
          <div className="overflow-x-auto">
            {/* Wrapper added to enforce a scaling baseline for the table */}
            <div className="text-[clamp(11px,2vw,14px)] min-w-max md:min-w-0">
              <ExtractionTable
                fields={extraction.fields}
                confidenceScores={extraction.confidence_scores}
                extractionId={extraction.extraction_id}
                onCorrection={handleCorrection}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
