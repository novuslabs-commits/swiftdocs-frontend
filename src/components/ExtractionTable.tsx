"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, Pencil } from "lucide-react";
import ConfidenceBadge from "./ConfidenceBadge";
import CorrectionModal from "./CorrectionModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/* ── Helpers ────────────────────────────────────────────────────────────────── */

function isPresent(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "string" && v.trim() === "") return false;
  if (Array.isArray(v) && v.length === 0) return false;
  return true;
}

function fieldLabel(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderValue(v: unknown): React.ReactNode {
  if (!isPresent(v)) return <span className="italic text-sw-muted/60">not found</span>;
  if (Array.isArray(v)) {
    return (
      <span className="text-sw-muted text-xs">
        {v.length} item{v.length !== 1 ? "s" : ""}
      </span>
    );
  }
  return <span className="font-mono text-xs">{String(v)}</span>;
}

/* ── Line items components ──────────────────────────────────────────────────── */

function LineItemsMiniTable({ items }: { items: unknown[] }) {
  return (
    <div className="mt-2 rounded-lg border border-sw-border overflow-hidden">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-sw-bg border-b border-sw-border">
            <th className="py-1.5 px-3 text-left font-semibold text-sw-muted uppercase tracking-wider text-[10px] w-6">#</th>
            <th className="py-1.5 px-3 text-left font-semibold text-sw-muted uppercase tracking-wider text-[10px]">Description</th>
            <th className="py-1.5 px-3 text-right font-semibold text-sw-muted uppercase tracking-wider text-[10px] w-12">Qty</th>
            <th className="py-1.5 px-3 text-right font-semibold text-sw-muted uppercase tracking-wider text-[10px] w-20">Unit Price</th>
            <th className="py-1.5 px-3 text-right font-semibold text-sw-muted uppercase tracking-wider text-[10px] w-20">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const it = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;
            return (
              <tr key={i} className="border-b border-sw-border/50 last:border-0 hover:bg-sw-bg/40 transition-colors">
                <td className="py-1.5 px-3 text-sw-muted">{i + 1}</td>
                <td className="py-1.5 px-3 text-sw-text">{String(it.description ?? "—")}</td>
                <td className="py-1.5 px-3 text-right text-sw-muted">{it.qty != null ? String(it.qty) : "—"}</td>
                <td className="py-1.5 px-3 text-right font-mono text-sw-muted">{it.unit_price != null ? String(it.unit_price) : "—"}</td>
                <td className="py-1.5 px-3 text-right font-mono font-medium text-sw-text">{it.total != null ? String(it.total) : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LineItemsRow({ value, conf }: { value: unknown[]; conf: number }) {
  const [open, setOpen] = useState(false);
  return (
    <tr className="border-b border-sw-border last:border-0 transition-colors hover:bg-sw-bg/60">
      <td className="py-2.5 px-4 text-sm font-medium text-sw-text w-44 shrink-0 align-top">
        Line Items
      </td>
      <td className="py-2.5 px-4 flex-1 align-top">
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-sw-primary hover:text-sw-primary/80 transition-colors"
          aria-expanded={open}
        >
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {value.length} item{value.length !== 1 ? "s" : ""}
        </button>
        {open && <LineItemsMiniTable items={value} />}
      </td>
      <td className="py-2.5 px-4 text-center w-24 align-top">
        <ConfidenceBadge score={conf} />
      </td>
      <td className="w-16" />
    </tr>
  );
}

/* ── Types ──────────────────────────────────────────────────────────────────── */

interface Props {
  fields: Record<string, unknown>;
  confidenceScores: Record<string, number>;
  extractionId: string;
  onCorrection: (field: string, value: string) => void;
}

/* ── Component ──────────────────────────────────────────────────────────────── */

export default function ExtractionTable({
  fields,
  confidenceScores,
  extractionId,
  onCorrection,
}: Props) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showEmpty, setShowEmpty] = useState(false);

  // Split fixed fields vs additional_fields (anything not in the standard set)
  const FIXED = new Set([
    // invoice
    "invoice_number", "date", "due_date", "total_amount", "subtotal", "tax_amount",
    "vendor_name", "billing_address", "line_items",
    // receipt
    "receipt_number", "payment_method",
    // purchase_order
    "po_number", "delivery_date", "buyer_name", "delivery_address",
    // delivery_note
    "delivery_note_number", "recipient_name", "po_reference",
    // unrecognized
    "reference_number", "issuer_name", "description",
  ]);

  const fixedEntries      = Object.entries(fields).filter(([k]) => FIXED.has(k));
  const additionalEntries = Object.entries(fields).filter(([k]) => !FIXED.has(k) && k !== "doc_type");

  const presentFixed = fixedEntries.filter(([, v]) => isPresent(v));
  const absentFixed  = fixedEntries.filter(([, v]) => !isPresent(v));
  const visibleFixed = showEmpty ? fixedEntries : presentFixed;

  /* ── Row ──────────────────────────────────────────────────────────────────── */

  function Row({ fieldKey, value }: { fieldKey: string; value: unknown }) {
    const conf    = confidenceScores[fieldKey] ?? 0;
    const present = isPresent(value);
    const isArray = Array.isArray(value);

    return (
      <tr
        className={cn(
          "border-b border-sw-border last:border-0 transition-colors",
          "hover:bg-sw-bg/60",
          !present && "opacity-60"
        )}
      >
        <td className="py-2.5 px-4 text-sm font-medium text-sw-text w-44 shrink-0">
          {fieldLabel(fieldKey)}
        </td>
        <td className="py-2.5 px-4 flex-1 text-sm text-sw-text">
          {renderValue(value)}
        </td>
        <td className="py-2.5 px-4 text-center w-24">
          {present ? <ConfidenceBadge score={conf} /> : <span className="text-sw-muted text-xs">—</span>}
        </td>
        <td className="py-2.5 px-4 text-right w-16">
          {!isArray && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setEditingField(fieldKey)}
              aria-label={`Edit ${fieldLabel(fieldKey)}`}
            >
              <Pencil size={12} />
            </Button>
          )}
        </td>
      </tr>
    );
  }

  return (
    <>
      {/* ── Fixed fields ─────────────────────────────────────────────── */}
      <table className="w-full text-sm border-collapse" role="table" aria-label="Extracted fields">
        <thead>
          <tr className="border-b border-sw-border bg-sw-bg/80">
            <th className="py-2.5 px-4 text-left text-xs font-semibold text-sw-muted uppercase tracking-wider w-44">Field</th>
            <th className="py-2.5 px-4 text-left text-xs font-semibold text-sw-muted uppercase tracking-wider">Value</th>
            <th className="py-2.5 px-4 text-center text-xs font-semibold text-sw-muted uppercase tracking-wider w-24">Confidence</th>
            <th className="w-16" />
          </tr>
        </thead>
        <tbody>
          {visibleFixed.map(([k, v]) => {
            if (k === "line_items" && Array.isArray(v) && v.length > 0) {
              return (
                <LineItemsRow
                  key={k}
                  value={v}
                  conf={confidenceScores[k] ?? 0}
                />
              );
            }
            return <Row key={k} fieldKey={k} value={v} />;
          })}
        </tbody>
      </table>

      {/* ── Show / hide empty toggle ──────────────────────────────────── */}
      {absentFixed.length > 0 && (
        <button
          onClick={() => setShowEmpty((s) => !s)}
          className={cn(
            "flex items-center gap-1.5 w-full px-4 py-2.5",
            "text-xs text-sw-muted hover:text-sw-text hover:bg-sw-bg",
            "border-t border-sw-border transition-colors"
          )}
          aria-expanded={showEmpty}
        >
          {showEmpty
            ? <><ChevronUp size={13} /> Hide {absentFixed.length} empty fields</>
            : <><ChevronDown size={13} /> Show {absentFixed.length} empty field{absentFixed.length !== 1 ? "s" : ""}</>
          }
        </button>
      )}

      {/* ── Additional fields ────────────────────────────────────────── */}
      {additionalEntries.length > 0 && (
        <AdditionalSection
          entries={additionalEntries}
          confidenceScores={confidenceScores}
          onEdit={setEditingField}
        />
      )}

      {/* ── Correction modal ─────────────────────────────────────────── */}
      {editingField && (
        <CorrectionModal
          field={editingField}
          currentValue={String(fields[editingField] ?? "")}
          onSave={(val) => {
            onCorrection(editingField, val);
            setEditingField(null);
          }}
          onClose={() => setEditingField(null)}
        />
      )}
    </>
  );
}

/* ── Additional fields collapsible ─────────────────────────────────────────── */

function AdditionalSection({
  entries,
  confidenceScores,
  onEdit,
}: {
  entries: [string, unknown][];
  confidenceScores: Record<string, number>;
  onEdit: (field: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-sw-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center justify-between w-full px-4 py-2.5",
          "text-xs font-medium text-sw-primary hover:bg-sw-primary/5",
          "transition-colors"
        )}
        aria-expanded={open}
      >
        <span>Additional fields ({entries.length})</span>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {open && (
        <table className="w-full text-sm border-collapse animate-fade-in">
          <tbody>
            {entries.map(([k, v]) => {
              const conf = confidenceScores[k] ?? 0;
              return (
                <tr key={k} className="border-b border-sw-border last:border-0 hover:bg-sw-bg/60 transition-colors">
                  <td className="py-2.5 px-4 text-sm font-medium text-sw-text w-44">
                    {fieldLabel(k)}
                  </td>
                  <td className="py-2.5 px-4 text-sm text-sw-text">
                    <span className="font-mono text-xs">{String(v)}</span>
                  </td>
                  <td className="py-2.5 px-4 text-center w-24">
                    <ConfidenceBadge score={conf} />
                  </td>
                  <td className="py-2.5 px-4 text-right w-16">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(k)}
                      aria-label={`Edit ${fieldLabel(k)}`}
                    >
                      <Pencil size={12} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
