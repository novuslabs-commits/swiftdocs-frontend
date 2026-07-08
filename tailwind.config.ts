import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sw: {
          bg:             "#F8F9FC",
          surface:        "#FFFFFF",
          sidebar:        "#1E1F2E",
          "sidebar-hover":"#272839",
          "sidebar-active":"#2E2F45",
          border:         "#E4E7EF",
          primary:        "#6366F1",
          "primary-dark": "#4F46E5",
          accent:         "#8B5CF6",
          text:           "#0F1629",
          muted:          "#64748B",
          success:        "#10B981",
          warning:        "#F59E0B",
          danger:         "#EF4444",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["11px", { lineHeight: "16px", letterSpacing: "0.02em" }],
        xs:    ["12px", { lineHeight: "16px" }],
        sm:    ["13px", { lineHeight: "20px" }],
        base:  ["15px", { lineHeight: "24px" }],
        lg:    ["17px", { lineHeight: "28px" }],
        xl:    ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
        "3xl": ["30px", { lineHeight: "38px" }],
      },
      boxShadow: {
        card:       "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-md":  "0 4px 16px 0 rgb(0 0 0 / 0.07)",
        "card-hover":"0 4px 12px 0 rgb(0 0 0 / 0.09)",
      },
      borderRadius: {
        sm:  "6px",
        DEFAULT: "8px",
        md:  "8px",
        lg:  "12px",
        xl:  "16px",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(8px) scale(0.96)" },
          to:   { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "toast-out": {
          from: { opacity: "1", transform: "translateY(0) scale(1)" },
          to:   { opacity: "0", transform: "translateY(4px) scale(0.96)" },
        },
        shimmer: {
          from: { backgroundPosition: "-400px 0" },
          to:   { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "fade-in":  "fade-in 200ms ease-out",
        "toast-in": "toast-in 250ms cubic-bezier(0.16, 1, 0.3, 1)",
        "toast-out":"toast-out 200ms ease-in forwards",
        shimmer:    "shimmer 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
