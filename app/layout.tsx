import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: "Indiva.in — Made in India 🇮🇳 | Online Shopping",
  description:
    "Indiva.in — shop electronics, home goods, handicrafts and more. Made in India, priced in ₹. Sign in as customer, founder or admin.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100 font-sans text-ink antialiased">
        {/* Indian tricolor bar */}
        <div className="flex h-1.5 w-full" aria-hidden>
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 border-y border-slate-200 bg-white" />
          <div className="flex-1 bg-[#138808]" />
        </div>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
        <footer className="mt-16 bg-[#232f3e] py-10 text-slate-300">
          <div className="mx-auto max-w-7xl px-4 text-center text-sm sm:px-6">
            <p className="text-lg font-extrabold text-white">Indiva.in 🇮🇳</p>
            <p className="mt-1">Proudly Made in India — curated products, prices in ₹.</p>
            <div className="mx-auto mt-3 flex h-1 w-40 overflow-hidden rounded-full" aria-hidden>
              <div className="flex-1 bg-[#FF9933]" />
              <div className="flex-1 bg-slate-200" />
              <div className="flex-1 bg-[#138808]" />
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 font-semibold">
              <Link href="/" className="hover:text-white hover:underline">Shop</Link>
              <Link href="/signin" className="hover:text-white hover:underline">Sign in</Link>
              <Link href="/signup" className="hover:text-white hover:underline">Create account</Link>
              <Link href="/founder" className="hover:text-white hover:underline">Founder</Link>
              <Link href="/admin" className="hover:text-white hover:underline">Admin</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
