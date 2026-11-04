import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Indiva — Made in India 🇮🇳 | Shop curated everyday essentials",
  description:
    "Indiva is a Made-in-India storefront: shop as a customer, run the business as the founder, and manage the store as an admin.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans text-ink antialiased">
        {/* Indian tricolor bar */}
        <div className="flex h-1.5 w-full" aria-hidden>
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 border-y border-slate-200 bg-white" />
          <div className="flex-1 bg-[#138808]" />
        </div>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
        <footer className="mt-16 border-t border-slate-200 bg-white py-8">
          <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500 sm:px-6">
            <p className="font-bold text-ink">Indiva 🇮🇳</p>
            <p className="mt-1">Proudly Made in India — curated everyday essentials, priced in ₹.</p>
            <div className="mx-auto mt-3 flex h-1 w-40 overflow-hidden rounded-full" aria-hidden>
              <div className="flex-1 bg-[#FF9933]" />
              <div className="flex-1 bg-slate-100" />
              <div className="flex-1 bg-[#138808]" />
            </div>
            <div className="mt-4 flex justify-center gap-4">
              <Link href="/" className="hover:text-brand-600">Customer store</Link>
              <Link href="/founder" className="hover:text-brand-600">Founder dashboard</Link>
              <Link href="/admin" className="hover:text-brand-600">Admin panel</Link>
              <Link href="/signin" className="hover:text-brand-600">Sign in</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
