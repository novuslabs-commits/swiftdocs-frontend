import Link from "next/link";
import { Zap, AlertCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="pt-10 mt-auto">

      <div className="flex items-start gap-1.5 text-sw-muted/80 mb-4 w-full">
        <AlertCircle size={12} className="mt-0.5 shrink-0 text-sw-muted/80" />
        <p className="text-[clamp(8.5px,2.5vw,11px)] leading-tight sm:leading-relaxed w-full">
          AI-generated extractions are subject to automated verification. Always cross-check 
          critical data points before entry. 
          <span className="hidden sm:inline">
            {" "}Confidence scores reflect model certainty thresholds.
          </span>
        </p>
      </div>

      {/* Bottom Section: Stacks vertically on mobile, horizontal row on desktop */}
      <div className="pt-5 border-t border-sw-border pb-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-sw-muted">
        
        {/* Left: product + agency */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-sw-primary/10">
            <Zap size={10} className="text-sw-primary" />
          </div>
          <span className="font-medium text-sw-text">SwiftDocs</span>
          <span className="text-sw-border">·</span>
          <span>Built by</span>
          <a
            href="https://www.novuslabshq.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-sw-primary hover:underline underline-offset-2 transition-colors"
          >
            NovusLabs
          </a>
        </div>

        {/* Right: contact + copyright */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <a
            href="mailto:info@NovusLabsHQ.com"
            className="hover:text-sw-text transition-colors"
          >
            info@NovusLabsHQ.com
          </a>
          <span className="text-sw-border hidden sm:inline">·</span>
          <a
            href="https://www.linkedin.com/company/novus-labs-tech"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sw-text transition-colors"
          >
            LinkedIn
          </a>
          <span className="text-sw-border hidden sm:inline">·</span>
          <span>© 2026 NovusLabs</span>
        </div>
      </div>
    </footer>
  );
}
