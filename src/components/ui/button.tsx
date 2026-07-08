"use client";
import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  // Base
  [
    "inline-flex items-center justify-center gap-2 rounded-md font-medium",
    "transition-all duration-150 select-none cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sw-primary focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-sw-primary text-white hover:bg-sw-primary-dark shadow-sm",
        secondary:
          "bg-sw-surface text-sw-text border border-sw-border hover:bg-sw-bg hover:border-slate-300 shadow-sm",
        ghost:
          "text-sw-muted hover:bg-sw-bg hover:text-sw-text",
        danger:
          "bg-sw-danger text-white hover:bg-red-600 shadow-sm",
        outline:
          "border border-sw-primary text-sw-primary hover:bg-sw-primary hover:text-white",
        link:
          "text-sw-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm:   "h-7 px-3 text-xs",
        md:   "h-9 px-4 text-sm",
        lg:   "h-10 px-5 text-base",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-7 w-7 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
