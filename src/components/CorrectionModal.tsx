"use client";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface Props {
  field: string;
  currentValue: string;
  onSave: (value: string) => void;
  onClose: () => void;
}

function fieldLabel(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function CorrectionModal({ field, currentValue, onSave, onClose }: Props) {
  const [value, setValue] = useState(currentValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Trap focus + auto-focus on open
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="correction-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          "relative z-10 w-full max-w-md mx-4",
          "bg-sw-surface rounded-xl shadow-card-md border border-sw-border",
          "animate-fade-in"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <h2 id="correction-title" className="font-semibold text-sw-text">
              Correct: {fieldLabel(field)}
            </h2>
            {currentValue && (
              <p className="text-xs text-sw-muted mt-0.5">
                Current: <span className="font-mono">{currentValue}</span>
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mr-1 -mt-1"
          >
            <X size={15} />
          </Button>
        </div>

        {/* Body */}
        <div className="px-5 pb-3">
          <label htmlFor="correction-input" className="block text-sm font-medium text-sw-text mb-1.5">
            New value
          </label>
          <input
            id="correction-input"
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSave(value)}
            className="input"
            placeholder="Enter corrected value..."
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-sw-border">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={() => onSave(value)}>
            Save correction
          </Button>
        </div>
      </div>
    </div>
  );
}
