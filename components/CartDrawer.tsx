"use client";

import { useEffect, useState } from "react";
import { formatINR } from "@/components/ProductCard";
import { api } from "@/lib/client";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import type { Order } from "@/lib/types";

export default function CartDrawer() {
  const { items, setQty, count, total, open, setOpen, clear, notify, toast } = useCart();
  const { user } = useAuth();
  const [placing, setPlacing] = useState(false);
  const [confirmed, setConfirmed] = useState<Order | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      setName((n) => n || user.name);
      setEmail((e) => e || user.email);
    }
  }, [user]);

  const checkout = async () => {
    if (!name.trim() || !email.trim()) {
      notify("Please enter your name and email");
      return;
    }
    setPlacing(true);
    const data = await api<{ order?: Order; error?: string }>("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name,
        email,
        items: items.map((l) => ({ productId: l.product.id, qty: l.qty })),
      }),
    });
    setPlacing(false);
    if (!data.order) {
      notify(data.error ?? "Could not place order");
      return;
    }
    setConfirmed(data.order);
    clear();
    setOpen(false);
  };

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-lg">{toast}</div>
      )}

      {/* Cart drawer */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="slide-in absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-extrabold">Your cart ({count})</h3>
              <button onClick={() => setOpen(false)} className="rounded-lg px-2 py-1 text-xl text-slate-500 hover:bg-slate-100">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 && <p className="py-10 text-center text-slate-400">Your cart is empty.</p>}
              {items.map((l) => (
                <div key={l.product.id} className="flex items-center gap-3 border-b border-slate-100 py-3">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${l.product.image} text-2xl`}>📦</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{l.product.name}</p>
                    <p className="text-xs text-slate-500">{formatINR(l.product.price)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQty(l.product.id, l.qty - 1)} className="h-7 w-7 rounded-md border border-slate-300 font-bold">−</button>
                    <span className="w-6 text-center text-sm font-bold">{l.qty}</span>
                    <button onClick={() => setQty(l.product.id, l.qty + 1)} className="h-7 w-7 rounded-md border border-slate-300 font-bold">+</button>
                  </div>
                  <span className="w-20 text-right text-sm font-extrabold">{formatINR(l.product.price * l.qty)}</span>
                </div>
              ))}
            </div>
            {items.length > 0 && (
              <div className="border-t border-slate-200 px-5 py-4">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal ({count} items)</span><span className="font-extrabold">{formatINR(total)}</span></div>
                <div className="mt-3 space-y-2">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" type="email" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" />
                </div>
                <button
                  onClick={checkout}
                  disabled={placing}
                  className="mt-3 w-full rounded-xl bg-[#FF9933] py-3 font-bold text-white transition hover:bg-[#f97316] disabled:bg-slate-300"
                >
                  {placing ? "Placing order…" : `Proceed to checkout — ${formatINR(total)}`}
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Order confirmation */}
      {confirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="pop w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✅</div>
            <h3 className="mt-4 text-2xl font-extrabold">Order placed — dhanyavaad!</h3>
            <p className="mt-2 text-sm text-slate-500">
              Thanks {confirmed.customerName}! Order <span className="font-bold text-ink">{confirmed.id}</span> for{" "}
              <span className="font-bold text-ink">{formatINR(confirmed.total)}</span> is confirmed and will appear in the founder dashboard and admin panel.
            </p>
            <button onClick={() => setConfirmed(null)} className="mt-6 w-full rounded-xl bg-ink py-3 font-bold text-white hover:bg-brand-600">Continue shopping</button>
          </div>
        </div>
      )}
    </>
  );
}
