import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SwiftDocs — Intelligent Document Extraction",
  description: "AI-powered invoice and document extraction for freight forwarding",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-sw-bg text-sw-text antialiased min-h-dvh">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
