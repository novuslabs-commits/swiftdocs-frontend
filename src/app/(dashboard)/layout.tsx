"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Upload,
  Clock,
  LayoutDashboard,
  Zap,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { isAuthenticated, removeToken, clearSessionCaches } from "@/lib/auth";
import { cn } from "@/lib/cn";
import Footer from "@/components/Footer";

/* ── Document type legend ───────────────────────────────────────────────────── */

const DOC_TYPES = [
  { label: "Invoice",        color: "bg-blue-400",   desc: "Bill sent to a client requesting payment for goods or services." },
  { label: "Receipt",        color: "bg-orange-400", desc: "Proof that payment has already been made." },
  { label: "Purchase Order", color: "bg-violet-400", desc: "Formal order placed by a buyer to a vendor before payment." },
  { label: "Delivery Note",  color: "bg-teal-400",   desc: "Confirms physical delivery of goods to the recipient." },
  { label: "Unrecognized",   color: "bg-slate-500",  desc: "Doesn't match any supported document type." },
];

/* ── Nav items ─────────────────────────────────────────────────────────────── */

const NAV = [
  { href: "/upload",  label: "Upload",    icon: Upload },
  { href: "/history", label: "History",   icon: Clock },
  { href: "/metrics", label: "Dashboard", icon: LayoutDashboard },
];

/* ── Doc types panel ────────────────────────────────────────────────────────── */

function DocTypesPanel() {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-3 py-2 border-t border-white/[0.06]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 rounded-md
                   text-white/40 hover:text-white/60 hover:bg-white/5 transition-colors cursor-pointer"
        aria-expanded={open}
        aria-label="Toggle document type descriptions"
      >
        <span className="section-label">Document Types</span>
        {open
          ? <ChevronDown size={12} className="shrink-0" />
          : <ChevronRight size={12} className="shrink-0" />}
      </button>

      {open && (
        <ul className="mt-1 space-y-3 px-3 pb-2">
          {DOC_TYPES.map(({ label, color, desc }) => (
            <li key={label} className="flex gap-2.5">
              <span className={`mt-[3px] h-2 w-2 shrink-0 rounded-full ${color} opacity-80`} />
              <div>
                <p className="text-xs font-medium text-white/70 leading-none mb-0.5">{label}</p>
                <p className="text-[10px] text-white/35 leading-relaxed">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Logo mark ─────────────────────────────────────────────────────────────── */

function SwiftDocsLogo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sw-primary shadow-sm">
        <Zap size={15} className="text-white" />
      </div>
      {!collapsed && (
        <span className="font-semibold text-base text-white tracking-tight">
          SwiftDocs
        </span>
      )}
    </div>
  );
}

/* ── Sidebar (desktop) ─────────────────────────────────────────────────────── */

function Sidebar({
  pathname,
  onLogout,
}: {
  pathname: string;
  onLogout: () => void;
}) {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col",
        "fixed inset-y-0 left-0 z-30 w-[240px]",
        "bg-sw-sidebar border-r border-white/[0.06]",
        "transition-all duration-300"
      )}
    >
      {/* Wordmark */}
      <div className="flex h-14 items-center px-4 border-b border-white/[0.06]">
        <SwiftDocsLogo />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Main navigation">
        <p className="section-label px-3 mb-2 text-white/30">Workspace</p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn("nav-link", active && "nav-link-active")}
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <DocTypesPanel />

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <button
          onClick={onLogout}
          className={cn(
            "nav-link w-full text-left",
            "text-red-400/80 hover:text-red-300 hover:bg-red-900/20"
          )}
          aria-label="Sign out"
        >
          <LogOut size={16} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

/* ── Mobile header ─────────────────────────────────────────────────────────── */

function MobileHeader({
  menuOpen,
  onToggle,
}: {
  menuOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 flex items-center gap-3 px-4 bg-sw-sidebar border-b border-white/[0.06]">
      <button
        onClick={onToggle}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
      >
        {menuOpen ? <X size={18} /> : <Menu size={18} />}
      </button>
      <SwiftDocsLogo />
    </header>
  );
}

/* ── Mobile drawer ─────────────────────────────────────────────────────────── */

function MobileDrawer({
  open,
  pathname,
  onClose,
  onLogout,
}: {
  open: boolean;
  pathname: string;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      {/* Scrim */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-40 w-[240px]",
          "bg-sw-sidebar border-r border-white/[0.06]",
          "flex flex-col",
          "transition-transform duration-250 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 shrink-0 items-center px-4 border-b border-white/[0.06]">
          <SwiftDocsLogo />
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="px-3 py-4 space-y-0.5" aria-label="Main navigation">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={cn("nav-link", active && "nav-link-active")}
                >
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <DocTypesPanel />
        </div>
        <div className="px-3 py-4 border-t border-white/[0.06] shrink-0">
          <button
            onClick={() => { onLogout(); onClose(); }}
            className={cn(
              "nav-link w-full text-left",
              "text-red-400/80 hover:text-red-300 hover:bg-red-900/20"
            )}
          >
            <LogOut size={16} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Dashboard layout ────────────────────────────────────────────────────────── */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      setAuthed(true);
    }
  }, [router]);

  // Close drawer on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  if (!authed) return null;

  function handleLogout() {
    clearSessionCaches();
    removeToken();
    router.replace("/login");
  }

  return (
    <>
      {/* Desktop sidebar */}
      <Sidebar pathname={pathname} onLogout={handleLogout} />

      {/* Mobile top bar */}
      <MobileHeader menuOpen={menuOpen} onToggle={() => setMenuOpen((o) => !o)} />

      {/* Mobile drawer */}
      <MobileDrawer
        open={menuOpen}
        pathname={pathname}
        onClose={() => setMenuOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main content — offset by sidebar on desktop, header on mobile */}
      <main
        className={cn(
          "min-h-dvh",
          "lg:pl-[240px]",   // sidebar width
          "pt-14 lg:pt-0",   // mobile header height
        )}
      >
        <div className="max-w-6xl mx-auto px-6 py-8 animate-fade-in">
          {children}
          <Footer />
        </div>
      </main>
    </>
  );
}
