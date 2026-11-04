"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const ROLE_BADGE: Record<string, string> = {
  customer: "bg-emerald-100 text-emerald-700",
  admin: "bg-amber-100 text-amber-700",
  founder: "bg-indigo-100 text-indigo-700",
};

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();

  const link = (href: string, label: string, badge?: string) => (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 hover:bg-slate-100 ${
        pathname === href ? "bg-slate-100 font-bold text-ink" : "text-slate-600"
      }`}
    >
      {label}
      {badge && <span className="ml-1 hidden rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700 sm:inline">{badge}</span>}
    </Link>
  );

  return (
    <header className="sticky top-1 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF9933] to-[#138808] text-base shadow-card">🇮🇳</span>
          <span className="text-xl font-extrabold tracking-tight">Indiva</span>
          <span className="hidden rounded-full border border-[#FF9933]/50 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-[#b45309] sm:inline">
            MADE IN INDIA
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-semibold">
          {link("/", "Shop", "Customer")}
          {user?.role === "founder" && link("/founder", "Founder", "Dashboard")}
          {(user?.role === "admin" || user?.role === "founder") && link("/admin", "Admin", "Panel")}
          {!loading && !user && (
            <>
              <Link href="/signin" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100">Sign in</Link>
              <Link href="/signup" className="ml-1 rounded-lg bg-brand-600 px-4 py-2 text-white shadow-card hover:bg-brand-700">Sign up</Link>
            </>
          )}
          {!loading && user && (
            <div className="ml-2 flex items-center gap-2">
              <span className="hidden text-sm text-slate-600 sm:inline">
                {user.name} <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${ROLE_BADGE[user.role]}`}>{user.role}</span>
              </span>
              <button
                onClick={() => signOut().then(() => (window.location.href = "/"))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-600 hover:bg-slate-100"
              >
                Sign out
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
