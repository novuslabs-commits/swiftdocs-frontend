import Link from "next/link";
import { Zap, AlertCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20">
      {/* Disclaimer */}
      {/* <p className="text-[11px] text-sw-muted/70 mb-4 leading-relaxed">
        AI-extracted data may contain errors — always verify critical figures before use.
        Confidence scores reflect model certainty, not guaranteed accuracy.
      </p> */}

      <div className="flex items-start gap-1.5 text-sw-muted/80 mb-4">
        <AlertCircle size={12} className="mt-0.5 shrink-0 text-sw-muted/80" />
        <p className="text-[11px] leading-relaxed">
          AI-generated extractions are subject to automated verification. Always cross-check 
          critical data points before entry. Confidence scores reflect model certainty thresholds.
        </p>
      </div>

      <div className="pt-5 border-t border-sw-border pb-8 flex flex-wrap items-center justify-between gap-4 text-xs text-sw-muted">
        {/* Left: product + agency */}
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-sw-primary/10">
            <Zap size={10} className="text-sw-primary" />
          </div>
          <span className="font-medium text-sw-text">SwiftDocs</span>
          <span className="text-sw-border">·</span>
          <span>Built by</span>
          <a
            href="https://www.linkedin.com/company/novus-labs-tech"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-sw-primary hover:underline underline-offset-2 transition-colors"
          >
            NovusLabs
          </a>
        </div>

        {/* Right: contact + copyright */}
        <div className="flex flex-wrap items-center gap-4">
          <a
            href="mailto:novuslabs.team@gmail.com"
            className="hover:text-sw-text transition-colors"
          >
            novuslabs.team@gmail.com
          </a>
          <a
            href="https://www.linkedin.com/company/novus-labs-tech"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sw-text transition-colors"
          >
            LinkedIn
          </a>
          {/* <span className="text-sw-border hidden sm:inline">·</span> */}
          <span className="hidden sm:inline">© 2026 NovusLabs</span>
        </div>
      </div>
    </footer>
  );
}
