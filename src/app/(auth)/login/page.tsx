"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, Mail, Globe, Linkedin, Eye, EyeOff } from "lucide-react";
import { login } from "@/lib/api";
import { saveToken, clearSessionCaches } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const FEATURES = [
  "Multi-format freight document parser",
  "Automated accuracy metrics per field",
  "Structured bulk exports via Excel & CSV",
  "Enterprise magic-byte upload security",
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("demo@swiftlog.com");
  const [password, setPassword] = useState("Demo1234");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Visibility State

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = await login(email, password);
      clearSessionCaches();
      saveToken(token);
      router.push("/upload");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex">
      {/* ── Left panel — brand strip ─────────────────────────────────────────── */}
      <div className="hidden lg:flex w-[440px] shrink-0 flex-col bg-sw-sidebar relative overflow-hidden">
        {/* Subtle gradient accent top-left */}
        <div
          aria-hidden="true"
          className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-sw-primary opacity-[0.07] blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute top-1/2 -right-24 h-64 w-64 rounded-full bg-sw-accent opacity-[0.05] blur-3xl pointer-events-none"
        />

        {/* Content Panel */}
        <div className="relative flex flex-col h-full p-12 justify-between">

          {/* Logo element */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sw-primary shadow-sm">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <span className="font-semibold text-base text-white tracking-tight">SwiftDocs</span>
              <span className="ml-2 text-xs text-white/30 font-normal">by NovusLabs</span>
            </div>
          </div>

          {/* 
            Hero copy block layout: 
            Increased 'space-y-6' to 'space-y-8' to open up the gap 
            equally across all 4 internal sections.
          */}
          <div className="flex-1 flex flex-col justify-center space-y-8">
            
            {/* Visually Enhanced Badge Tag Element */}
            <div className="w-fit border border-white/[0.06] bg-white/[0.03] backdrop-blur-xs px-3 py-1 rounded-full shadow-inner">
              <p className="text-[11px] uppercase tracking-[0.22em] text-sw-primary font-bold">
                Intelligent Document Extraction
              </p>
            </div>

            {/* Rephrased Header Text */}
            <h2 className="text-2xl font-semibold text-white leading-tight tracking-tight">
              Automate freight document processing in seconds.
            </h2>

            {/* Rephrased Paragraph Subtext */}
            <p className="text-sm text-white/50 leading-relaxed max-w-[300px]">
              Instantly extract structured data fields from logistics documents. 
              Powered by advanced AI with real-time field certainty verification.
            </p>

            {/* Feature list */}
            <ul className="space-y-4">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3.5 text-sm text-white/60">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sw-primary/20 border border-sw-primary/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-sw-primary" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Agency contact section */}
          <div className="pt-6 border-t border-white/[0.08] mt-auto">
            <p className="text-[10px] text-white/30 mb-2 uppercase tracking-widest font-semibold">
              Built by
            </p>
            <p className="text-base font-semibold text-white/80 mb-4 tracking-tight">NovusLabs</p>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:info@novuslabshq.com"
                className="flex items-center gap-2.5 text-xs text-white/40 hover:text-white/70 transition-colors w-fit"
              >
                <Mail size={13} />
                info@NovusLabsHQ.com
              </a>
              <a
                href="https://www.linkedin.com/company/novus-labs-tech"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs text-white/40 hover:text-white/70 transition-colors w-fit"
              >
                <Linkedin size={13} />
                LinkedIn
              </a>
              <a
                href="https://www.novuslabshq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs text-white/40 hover:text-white/70 transition-colors w-fit"
              >
                <Globe size={13} />
                NovusLabsHQ.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — Form ───────────────────────────────────────────────── */}
      {/* Changed bg-sw-bg to a premium slate gray shade to create clear contrast */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/60 px-4 sm:px-6 py-10 sm:py-12 relative overflow-y-auto">
        
        {/* Subtle background glow effect on the right panel to balance the layout */}
        <div
          aria-hidden="true"
          className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-sw-primary opacity-[0.03] blur-3xl pointer-events-none"
        />

        {/* Floating card container wrapper to eliminate the empty look */}
        <div className="w-full max-w-md bg-white border border-sw-border shadow-sm rounded-2xl p-8 sm:p-10 relative z-10">
          
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 pb-6 border-b border-sw-border lg:hidden lg:mb-0 lg:pb-0 lg:border-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sw-primary shadow-sm">
              <Zap size={15} className="text-white" />
            </div>
            <span className="font-semibold text-base text-sw-text tracking-tight">SwiftDocs</span>
          </div>

          <h1 className="text-2xl font-semibold text-sw-text tracking-tight">Sign in</h1>
          <p className="mt-1.5 text-sw-muted whitespace-nowrap text-[clamp(9.5px,3vw,14px)]">
            Welcome back. Enter your credentials to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-sw-text mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input focus:ring-2 focus:ring-sw-primary/10 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-sw-text mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10 focus:ring-2 focus:ring-sw-primary/10 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sw-muted hover:text-sw-text transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-500 flex items-start gap-1.5">
                <span aria-hidden="true">✕</span>
                {error}
              </p>
            )}

            <Button
              type="submit"
              loading={loading}
              size="lg"
              className="w-full mt-2 font-medium shadow-2xs hover:opacity-95 transition-opacity"
            >
              {!loading && <ArrowRight size={16} />}
              Sign in
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-dashed border-sw-border bg-slate-50/50 px-4 py-3">
            <p className="text-xs font-semibold text-sw-text mb-1.5">Demo access</p>
            <div className="flex items-center gap-x-2 whitespace-nowrap overflow-hidden">
              <code className="bg-white px-1.5 py-0.5 rounded border border-sw-border font-mono text-sw-text text-[clamp(9.5px,2.5vw,12px)] shrink-0">demo@swiftlog.com</code>
              <span className="text-sw-border text-xs shrink-0">·</span>
              <code className="bg-white px-1.5 py-0.5 rounded border border-sw-border font-mono text-sw-text text-[clamp(9.5px,2.5vw,12px)] shrink-0">Demo1234</code>
            </div>
          </div>

        </div>

        {/* Mobile footer */}
        <p className="mt-8 text-xs text-sw-muted text-center lg:hidden relative z-10">
          Built by{" "}
          <a href="https://www.novuslabshq.com" target="_blank" rel="noopener noreferrer"
             className="text-sw-primary hover:underline underline-offset-2">
            NovusLabs
          </a>
          {" "}·{" "}
          <a href="mailto:info@novuslabshq.com" className="hover:text-sw-text transition-colors">
            info@NovusLabsHQ.com
          </a>
        </p>
      </div>
    </div>
  );
}
