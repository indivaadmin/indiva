import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { I18nProvider } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import FooterLinks from "@/components/FooterLinks";

export const metadata: Metadata = {
  title: "Indiva.in 🇮🇳 — Bharat ki apni dukaan | 100% Made in India",
  description:
    "Indiva.in — India's own online store in your language. Handicrafts, electronics, home goods and more, made in India and priced in ₹.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream font-sans text-ink antialiased">
        {/* Indian tricolor bar */}
        <div className="flex h-1.5 w-full" aria-hidden>
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 border-y border-sandal bg-white" />
          <div className="flex-1 bg-[#138808]" />
        </div>
        <I18nProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <main>{children}</main>
              <CartDrawer />
            </CartProvider>
          </AuthProvider>
        </I18nProvider>
        <footer className="mt-16">
          <div className="india-border" aria-hidden />
          <div className="bg-gradient-to-b from-kumkum-dark to-[#4d0d1a] py-10 text-sandal">
            <div className="mx-auto max-w-7xl px-4 text-center text-sm sm:px-6">
              <p className="text-lg font-extrabold text-white">🪔 Indiva.in 🇮🇳</p>
              <p className="mt-1 text-gold-light">Bharat ki apni dukaan — 100% Made in India, prices in ₹.</p>
              <div className="mx-auto mt-3 flex h-1 w-40 overflow-hidden rounded-full" aria-hidden>
                <div className="flex-1 bg-[#FF9933]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#138808]" />
              </div>
              <FooterLinks />
              <p className="mt-5 text-xs text-sandal/60">© {new Date().getFullYear()} Indiva.in — Swadeshi by design. 🇮🇳</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
