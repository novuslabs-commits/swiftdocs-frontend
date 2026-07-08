"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/cn";

/* ── Types ─────────────────────────────────────────────────────────────────── */

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  leaving?: boolean;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

/* ── Context ────────────────────────────────────────────────────────────────── */

const ToastCtx = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 220);
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, variant }]);

      const timer = setTimeout(() => dismiss(id), 4000);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  // Cleanup on unmount
  useEffect(
    () => () => timers.current.forEach(clearTimeout),
    []
  );

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastCtx.Provider>
  );
}

/* ── Hook ───────────────────────────────────────────────────────────────────── */

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

/* ── Toaster (render layer) ─────────────────────────────────────────────────── */

const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />,
  error:   <AlertCircle  size={16} className="text-red-500 shrink-0" />,
  info:    <Info         size={16} className="text-sw-primary shrink-0" />,
};

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-emerald-200 bg-emerald-50",
  error:   "border-red-200 bg-red-50",
  info:    "border-sw-border bg-sw-surface",
};

function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2.5rem)]"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={cn(
            "flex items-start gap-3 rounded-lg border px-4 py-3 shadow-card-md text-sm",
            VARIANT_STYLES[t.variant],
            t.leaving ? "animate-toast-out" : "animate-toast-in"
          )}
        >
          {ICONS[t.variant]}
          <p className="flex-1 text-sw-text leading-snug">{t.message}</p>
          <button
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
            className="shrink-0 text-sw-muted hover:text-sw-text transition-colors -mt-0.5 -mr-1"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
