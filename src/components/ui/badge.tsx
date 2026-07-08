import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-semibold text-2xs px-2 py-0.5 uppercase tracking-wider whitespace-nowrap",
  {
    variants: {
      variant: {
        default:        "bg-slate-100 text-slate-600",
        primary:        "bg-sw-primary/10 text-sw-primary",
        success:        "bg-emerald-50 text-emerald-700",
        warning:        "bg-amber-50 text-amber-700",
        danger:         "bg-red-50 text-red-600",
        // doc type
        invoice:        "bg-blue-50 text-blue-700",
        purchase_order: "bg-violet-50 text-violet-700",
        delivery_note:  "bg-teal-50 text-teal-700",
        receipt:        "bg-orange-50 text-orange-700",
        unrecognized:   "bg-slate-100 text-slate-500",
        // confidence
        high:   "bg-emerald-50 text-emerald-700",
        medium: "bg-amber-50 text-amber-700",
        low:    "bg-red-50 text-red-600",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}

/** Map a 0–1 confidence score to a badge variant. */
export function confidenceVariant(score: number): BadgeVariant {
  if (score >= 0.85) return "high";
  if (score >= 0.60) return "medium";
  return "low";
}

/** Map doc_type string to a badge variant. */
export function docTypeVariant(docType: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    invoice:        "invoice",
    purchase_order: "purchase_order",
    delivery_note:  "delivery_note",
    receipt:        "receipt",
    unrecognized:   "unrecognized",
  };
  return map[docType] ?? "default";
}

export { badgeVariants };
