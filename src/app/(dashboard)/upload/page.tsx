"use client";
import { useEffect, useState } from "react";
import { UploadCloud } from "lucide-react";
import DropZone, { type RejectedFile } from "@/components/DropZone";
import BatchQueue from "@/components/BatchQueue";
import { uploadBatch, getDocumentStatus, listExtractions, retryDocument, getMetrics } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import type { Document } from "@/types";

const TERMINAL = new Set(["completed", "failed"]);
const BATCH_CHUNK_SIZE = 20;
const SESSION_KEY = "sw_upload_queue";

export default function UploadPage() {
  const { toast } = useToast();
  const [documents, setDocuments]         = useState<Document[]>([]);
  const [rejectedFiles, setRejectedFiles]  = useState<RejectedFile[]>([]);
  const [extractions, setExtractions]      = useState<Record<string, string>>({});
  const [uploading, setUploading]          = useState(false);

  /* ── Restore queue from sessionStorage on mount ────────────────────────── */
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return;
    let cached: Document[];
    try { cached = JSON.parse(stored); } catch { return; }
    if (!cached.length) return;

    // Show cached state immediately — no waiting for network
    setDocuments(cached);

    // Refresh statuses + extractions in background
    Promise.all(cached.map((d) => getDocumentStatus(d.id).catch(() => null)))
      .then(async (updates) => {
        const valid = updates.filter(Boolean) as Document[];
        if (valid.length) setDocuments(valid);
        const all = await listExtractions(undefined, { limit: 200 }).catch(() => []);
        const map: Record<string, string> = {};
        all.forEach((e) => { map[e.document_id] = e.extraction_id; });
        setExtractions(map);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Persist full document objects to sessionStorage whenever queue changes */
  useEffect(() => {
    if (documents.length === 0) {
      sessionStorage.removeItem(SESSION_KEY);
      return;
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(documents));
  }, [documents]);

  /* ── Poll pending docs until terminal ─────────────────────────────────── */
  const pendingKey = documents
    .filter((d) => !TERMINAL.has(d.status))
    .map((d) => d.id)
    .join(",");

  useEffect(() => {
    if (!pendingKey) return;
    const ids = pendingKey.split(",");

    const timer = setInterval(async () => {
      const updates = await Promise.all(
        ids.map((id) => getDocumentStatus(id).catch(() => null))
      );

      setDocuments((prev) =>
        prev.map((d) => {
          const u = updates.find((x) => x?.id === d.id);
          return u ?? d;
        })
      );

      const newlyDone = updates.filter(
        (u) => u?.status === "completed" && !extractions[u.id]
      );
      if (newlyDone.length > 0) {
        const all = await listExtractions(undefined, { limit: 200 }).catch(() => []);
        const map: Record<string, string> = {};
        all.forEach((e) => { map[e.document_id] = e.extraction_id; });
        setExtractions((prev) => ({ ...prev, ...map }));

        // Pre-populate history + metrics caches so those pages load instantly
        try { sessionStorage.setItem("sw_history_cache", JSON.stringify(all)); } catch {}
        getMetrics().then((m) => {
          try {
            sessionStorage.setItem("sw_metrics_cache", JSON.stringify({ metrics: m, items: all }));
          } catch {}
        }).catch(() => {});
      }
    }, 2000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingKey]);

  /* ── Upload handler ────────────────────────────────────────────────────── */
  async function handleFiles(accepted: File[], rejected: RejectedFile[]) {
    if (rejected.length > 0) {
      setRejectedFiles((prev) => [...rejected, ...prev]);
    }

    if (accepted.length === 0) return;

    setUploading(true);
    let totalQueued  = 0;
    let totalSkipped = 0;

    try {
      // Chunk into groups of BATCH_CHUNK_SIZE and send sequentially
      for (let i = 0; i < accepted.length; i += BATCH_CHUNK_SIZE) {
        const chunk = accepted.slice(i, i + BATCH_CHUNK_SIZE);
        const docs  = await uploadBatch(chunk);
        setDocuments((prev) => [...docs, ...prev]);
        totalQueued  += docs.length;
        totalSkipped += chunk.length - docs.length;
      }

      const msg = `${totalQueued} file${totalQueued !== 1 ? "s" : ""} queued for extraction.`;
      toast(totalSkipped > 0 ? `${msg} ${totalSkipped} skipped by server.` : msg, "success");
    } catch (e: unknown) {
      const detail =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (e instanceof Error ? e.message : "Upload failed");
      toast(detail, "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleRetry(id: string) {
    try {
      const updated = await retryDocument(id);
      setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch {
      toast("Retry failed. Please try again shortly.", "error");
    }
  }

  function handleRemoveDocument(id: string) {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  function handleRemoveRejected(index: number) {
    setRejectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-5 sm:mb-6">
        <h1 className="page-title flex items-center gap-2">
          <UploadCloud size={20} className="sm:hidden text-sw-primary shrink-0" aria-hidden="true" />
          <UploadCloud size={22} className="hidden sm:block text-sw-primary shrink-0" aria-hidden="true" />
          Upload
        </h1>
        <p className="mt-1 text-sw-muted text-[clamp(11px,3.2vw,14px)]">
          Process invoices, receipts, purchase orders, and delivery notes with AI extraction.
        </p>
      </div>

      {/* Drop zone */}
      <DropZone onFiles={handleFiles} disabled={uploading} />

      {/* Queue */}
      <BatchQueue
        documents={documents}
        extractions={extractions}
        rejectedFiles={rejectedFiles}
        onRetry={handleRetry}
        onRemoveDocument={handleRemoveDocument}
        onRemoveRejected={handleRemoveRejected}
      />
    </div>
  );
}
