"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/client";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";

function Storefront() {
  const router = useRouter();
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const { add } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("All");

  const refresh = useCallback(async () => {
    const [all, sug] = await Promise.all([
      api<{ products: Product[] }>("/api/products"),
      api<{ products: Product[] }>("/api/suggestions"),
    ]);
    setProducts(all.products);
    setSuggestions(sug.products);
    setCategories(["All", ...Array.from(new Set(all.products.map((p) => p.category)))]);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setQuery = (v: string) => {
    router.replace(v ? `/?q=${encodeURIComponent(v)}` : "/", { scroll: false });
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const okCat = category === "All" || p.category === category;
      const okQ = !query || (p.name + " " + p.description + " " + p.tags.join(" ")).toLowerCase().includes(query.toLowerCase());
      return okCat && okQ;
    });
  }, [products, category, query]);

  const deals = useMemo(() => products.filter((p) => p.featured).slice(0, 4), [products]);

  return (
    <div>
      {/* Hero banner — Amazon style */}
      <section className="relative bg-gradient-to-b from-[#FF9933]/90 via-[#f97316]/80 to-slate-100">
        <div className="mx-auto max-w-7xl px-4 pb-40 pt-12 sm:px-6 sm:pt-16">
          <p className="fade-up text-xs font-bold uppercase tracking-widest text-white/90">🇮🇳 Proudly Made in India</p>
          <h1 className="fade-up mt-2 max-w-2xl text-3xl font-black leading-tight text-white drop-shadow sm:text-5xl" style={{ animationDelay: "80ms" }}>
            Swadeshi picks, delivered to your doorstep.
          </h1>
          <p className="fade-up mt-3 max-w-xl text-base text-white/90" style={{ animationDelay: "160ms" }}>
            Electronics, handicrafts, home goods and more — every price in ₹, with fast checkout.
          </p>
          {query && (
            <p className="fade-up mt-4 inline-block rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-ink shadow" style={{ animationDelay: "220ms" }}>
              Search results for “{query}” — {filtered.length} item{filtered.length === 1 ? "" : "s"}{" "}
              <button onClick={() => setQuery("")} className="ml-1 text-brand-600 underline">clear</button>
            </p>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-slate-100" aria-hidden />
      </section>

      {/* Category strip */}
      {categories.length > 1 && (
        <div className="mx-auto -mt-24 max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-card">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                  category === c ? "bg-ink text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Today's deals */}
      {deals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
          <h2 className="text-2xl font-extrabold">Today's Deals 🏷️</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {deals.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={add} />
            ))}
          </div>
        </section>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && deals.length === 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
          <h2 className="text-2xl font-extrabold">Suggested for you</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {suggestions.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} onAdd={add} />
            ))}
          </div>
        </section>
      )}

      {/* All products */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-extrabold">{query ? "Results" : "All products"}</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Indiva.in…"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:w-72"
          />
        </div>
        {filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-card">
            <span className="text-5xl">🇮🇳</span>
            <p className="mt-4 text-lg font-extrabold">{query ? `No results for “${query}”` : "No products yet"}</p>
            <p className="mt-1 text-sm text-slate-500">
              {query
                ? "Try a different search term."
                : "Our team is curating the first Made-in-India collection. Check back soon — new products appear here as soon as they are published!"}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={add} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function CustomerStorefront() {
  return (
    <Suspense fallback={<p className="py-20 text-center text-slate-400">Loading…</p>}>
      <Storefront />
    </Suspense>
  );
}
