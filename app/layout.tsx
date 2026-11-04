import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Indiva — Shop curated everyday essentials",
  description:
    "Indiva is a full-stack storefront: shop products as a customer, track the business as the founder, and manage the store as an admin.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans text-ink antialiased">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-lg font-black text-white shadow-card">i</span>
              <span className="text-xl font-extrabold tracking-tight">Indiva</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm font-semibold">
              <Link href="/" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-ink">
                Shop <span className="ml-1 hidden rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700 sm:inline">Customer</span>
              </Link>
              <Link href="/founder" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-ink">
                Founder <span className="ml-1 hidden rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-700 sm:inline">Dashboard</span>
              </Link>
              <Link href="/admin" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-ink">
                Admin <span className="ml-1 hidden rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700 sm:inline">Panel</span>
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-slate-200 bg-white py-8 mt-16">
          <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500 sm:px-6">
            <p className="font-bold text-ink">Indiva</p>
            <p className="mt-1">Curated everyday essentials — built with Next.js, ready to deploy on Vercel.</p>
            <div className="mt-3 flex justify-center gap-4">
              <Link href="/" className="hover:text-brand-600">Customer store</Link>
              <Link href="/founder" className="hover:text-brand-600">Founder dashboard</Link>
              <Link href="/admin" className="hover:text-brand-600">Admin panel</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
