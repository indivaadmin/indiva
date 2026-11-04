"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";

const ROLE_BADGE: Record<string, string> = {
  customer: "bg-emerald-100 text-emerald-700",
  admin: "bg-gold-light text-kumkum-dark",
  founder: "bg-indigo-100 text-indigo-700",
};

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const { count, setOpen } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");

  const submitSearch = () => {
    router.push(q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : "/");
  };

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`whitespace-nowrap rounded-md px-3 py-2 text-kumkum-dark hover:bg-sandal ${
        pathname === href ? "bg-sandal font-extrabold underline decoration-[#FF9933] decoration-2 underline-offset-4" : ""
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-1 z-40 shadow-card">
      {/* Main bar — kumkum maroon with gold trim */}
      <div className="bg-gradient-to-r from-kumkum-dark via-kumkum to-kumkum-dark text-cream">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-5 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2 rounded-md px-1 py-1 hover:outline hover:outline-1 hover:outline-gold/70">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/60 bg-gradient-to-br from-[#FF9933] to-[#138808] text-base shadow">
              🪔
            </span>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Indiva<span className="text-gold-light">.in</span>
            </span>
          </Link>

          {/* Search */}
          <div className="hidden min-w-0 flex-1 sm:flex">
            <div className="flex w-full overflow-hidden rounded-lg border border-gold/50 bg-cream shadow-inner focus-within:ring-2 focus-within:ring-gold">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitSearch()}
                placeholder="Search Indiva.in — Bharat ki apni dukaan"
                className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-ink outline-none placeholder:text-[#a08464]"
              />
              <button
                onClick={submitSearch}
                className="bg-gradient-to-b from-[#FF9933] to-[#f97316] px-4 text-lg text-kumkum-dark transition hover:brightness-105"
                aria-label="Search"
              >
                🔍
              </button>
            </div>
          </div>

          {/* Account + Cart */}
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            {!loading && !user && (
              <Link href="/signin" className="rounded-md px-2 py-2 leading-tight hover:outline hover:outline-1 hover:outline-gold/70">
                <span className="block text-[11px] text-gold-light/90">Namaste, sign in</span>
                <span className="block text-sm font-bold text-white">Account &amp; Lists</span>
              </Link>
            )}
            {!loading && user && (
              <div className="flex items-center gap-2 rounded-md px-2 py-1 hover:outline hover:outline-1 hover:outline-gold/70">
                <div className="leading-tight">
                  <span className="block text-[11px] text-gold-light/90">Namaste, {user.name.split(" ")[0]}</span>
                  <span className="block text-sm font-bold text-white">
                    Account{" "}
                    <span className={`ml-1 rounded-full px-1.5 py-px text-[10px] font-bold capitalize ${ROLE_BADGE[user.role]}`}>{user.role}</span>
                  </span>
                </div>
                <button
                  onClick={() => signOut().then(() => router.push("/"))}
                  className="hidden rounded-md border border-gold/50 px-2 py-1 text-xs font-semibold text-gold-light hover:bg-white/10 sm:block"
                >
                  Sign out
                </button>
              </div>
            )}
            <button
              onClick={() => setOpen(true)}
              className="relative flex items-center gap-1.5 rounded-md px-2 py-2 hover:outline hover:outline-1 hover:outline-gold/70"
              aria-label="Open cart"
            >
              <span className="text-xl">🧺</span>
              {count > 0 && (
                <span className="pop absolute -top-0.5 left-4 rounded-full bg-gold px-1.5 py-px text-xs font-black text-kumkum-dark">{count}</span>
              )}
              <span className="hidden text-sm font-bold text-white sm:block">Cart</span>
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="px-4 pb-2 sm:hidden">
          <div className="flex overflow-hidden rounded-lg border border-gold/50 bg-cream">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSearch()}
              placeholder="Search Indiva.in"
              className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-ink outline-none"
            />
            <button onClick={submitSearch} className="bg-[#FF9933] px-4 text-kumkum-dark" aria-label="Search">🔍</button>
          </div>
        </div>
      </div>

      {/* Secondary nav — cream strip with heritage links */}
      <div className="border-b border-gold/40 bg-cream">
        <nav className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-1.5 text-sm font-semibold sm:px-6">
          {navLink("/", "☰ Sab kuch")}
          {navLink("/", "Bestsellers")}
          {navLink("/", "Naye Product")}
          {navLink("/", "Aaj ki Offers")}
          {user?.role === "founder" && navLink("/founder", "👑 Founder")}
          {(user?.role === "admin" || user?.role === "founder") && navLink("/admin", "🛠 Admin")}
          <span className="ml-auto hidden shrink-0 items-center gap-1 rounded-full border border-kumkum/30 bg-white px-2.5 py-0.5 text-[11px] font-extrabold text-kumkum sm:inline-flex">
            🇮🇳 100% MADE IN INDIA
          </span>
        </nav>
      </div>

      {/* Textile zigzag border */}
      <div className="india-border" aria-hidden />
    </header>
  );
}
