"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ProductCard, { formatINR } from "@/components/ProductCard";
import type { Order, Product } from "@/lib/types";

interface CartLine {
  product: Product;
  qty: number;
}

export default function CustomerStorefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [placing, setPlacing] = useState(false);
  const [confirmed, setConfirmed] = useState<Order | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const refresh = useCallback(async () => {
    const [all, sug] = await Promise.all([
      fetch("/api/products").then((r) => r.json() as Promise<{ products: Product[] }>),
      fetch("/api/suggestions").then((r) => r.json() as Promise<{ products: Product[] }>),
    ]);
    setProducts(all.products);
    setSuggestions(sug.products);
    setCategories(["All", ...Array.from(new Set(all.products.map((p: Product) => p.category)))]);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const okCat = category === "All" || p.category === category;
      const okQ = !query || (p.name + " " + p.description + " " + p.tags.join(" ")).toLowerCase().includes(query.toLowerCase());
      return okCat && okQ;
    });
  }, [products, category, query]);

  const cartCount = cart.reduce((s, l) => s + l.qty, 0);
  const cartTotal = cart.reduce((s, l) => s + l.qty * l.product.price, 0);

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const found = prev.find((l) => l.product.id === p.id);
      if (found) return prev.map((l) => (l.product.id === p.id ? { ...l, qty: Math.min(l.qty + 1, l.product.stock) } : l));
      return [...prev, { product: p, qty: 1 }];
    });
    setToast(`${p.name} added to cart`);
    setTimeout(() => setToast(""), 2200);
  };

  const setQty = (id: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((l) => l.product.id !== id)
        : prev.map((l) => (l.product.id === id ? { ...l, qty: Math.min(qty, l.product.stock) } : l))
    );
  };

  const checkout = async () => {
    if (!name.trim() || !email.trim()) {
      setToast("Please enter your name and email");
      setTimeout(() => setToast(""), 2200);
      return;
    }
    setPlacing(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name,
        email,
        items: cart.map((l) => ({ productId: l.product.id, qty: l.qty })),
      }),
    });
    const data = await res.json();
    setPlacing(false);
    if (!res.ok) {
      setToast(data.error ?? "Could not place order");
      setTimeout(() => setToast(""), 2500);
      return;
    }
    setConfirmed(data.order);
    setCart([]);
    setCartOpen(false);
    refresh();
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="fade-up text-sm font-bold uppercase tracking-widest text-brand-100">New season collection</p>
          <h1 className="fade-up mt-3 max-w-2xl text-4xl font-black leading-tight sm:text-6xl" style={{ animationDelay: "80ms" }}>
            Everyday essentials, curated for you.
          </h1>
          <p className="fade-up mt-4 max-w-xl text-lg text-brand-100" style={{ animationDelay: "160ms" }}>
            Shop electronics, home goods and fashion picks from Indiva — with smart suggestions and fast checkout.
          </p>
          <div className="fade-up mt-8 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            <a href="#shop" className="rounded-xl bg-white px-6 py-3 font-bold text-brand-700 shadow-card transition hover:bg-brand-50">Shop now</a>
            <a href="#suggestions" className="rounded-xl border border-white/40 px-6 py-3 font-bold text-white transition hover:bg-white/10">See suggestions</a>
          </div>
        </div>
      </section>

      {/* Suggestions */}
      <section id="suggestions" className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold">Suggested for you</h2>
            <p className="text-sm text-slate-500">Hand-picked featured picks from our catalog</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {suggestions.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} onAdd={addToCart} />
          ))}
        </div>
      </section>

      {/* Shop */}
      <section id="shop" className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-extrabold">All products</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:w-72"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                category === c ? "bg-ink text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={addToCart} />
          ))}
          {filtered.length === 0 && <p className="col-span-full py-12 text-center text-slate-400">No products match your search.</p>}
        </div>
      </section>

      {/* Floating cart button */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-ink px-5 py-3.5 font-bold text-white shadow-lg transition hover:bg-brand-600"
      >
        🛒 Cart
        {cartCount > 0 && <span className="pop rounded-full bg-brand-500 px-2 py-0.5 text-xs">{cartCount}</span>}
      </button>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-lg">{toast}</div>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)} />
          <aside className="slide-in absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-extrabold">Your cart ({cartCount})</h3>
              <button onClick={() => setCartOpen(false)} className="rounded-lg px-2 py-1 text-xl text-slate-500 hover:bg-slate-100">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cart.length === 0 && <p className="py-10 text-center text-slate-400">Your cart is empty.</p>}
              {cart.map((l) => (
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
            {cart.length > 0 && (
              <div className="border-t border-slate-200 px-5 py-4">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="font-extrabold">{formatINR(cartTotal)}</span></div>
                <div className="mt-3 space-y-2">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" type="email" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" />
                </div>
                <button
                  onClick={checkout}
                  disabled={placing}
                  className="mt-3 w-full rounded-xl bg-brand-600 py-3 font-bold text-white transition hover:bg-brand-700 disabled:bg-slate-300"
                >
                  {placing ? "Placing order…" : `Checkout — ${formatINR(cartTotal)}`}
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
            <h3 className="mt-4 text-2xl font-extrabold">Order placed!</h3>
            <p className="mt-2 text-sm text-slate-500">
              Thanks {confirmed.customerName}! Order <span className="font-bold text-ink">{confirmed.id}</span> for{" "}
              <span className="font-bold text-ink">{formatINR(confirmed.total)}</span> is confirmed and will appear in the founder dashboard and admin panel.
            </p>
            <button onClick={() => setConfirmed(null)} className="mt-6 w-full rounded-xl bg-ink py-3 font-bold text-white hover:bg-brand-600">Continue shopping</button>
          </div>
        </div>
      )}
    </div>
  );
}
