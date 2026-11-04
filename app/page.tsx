"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/client";
import { useCart } from "@/lib/cart-context";
import { useI18n } from "@/lib/i18n";
import type { Product } from "@/lib/types";

function Storefront() {
  const router = useRouter();
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const { add } = useCart();
  const { t } = useI18n();
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
      {/* Hero banner — Indian heritage with rangoli pattern */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FF9933] via-[#ffb765] to-cream">
        <div className="hero-pattern absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 pb-40 pt-14 sm:px-6 sm:pt-20">
          <p className="fade-up inline-flex items-center gap-2 rounded-full border border-kumkum/30 bg-white/70 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-kumkum">
            🪔 {t("heroTag")}
          </p>
          <h1 className="fade-up mt-4 max-w-2xl text-4xl font-black leading-tight text-kumkum-dark drop-shadow-sm sm:text-6xl" style={{ animationDelay: "80ms" }}>
            {t("heroTitle")}
          </h1>
          <p className="fade-up mt-4 max-w-xl text-lg font-medium text-[#6b3a12]" style={{ animationDelay: "160ms" }}>
            {t("heroSub")}
          </p>
          {query && (
            <p className="fade-up mt-5 inline-block rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-ink shadow-card" style={{ animationDelay: "220ms" }}>
              {t("forQ", { q: query })} — {filtered.length} item{filtered.length === 1 ? "" : "s"}{" "}
              <button onClick={() => setQuery("")} className="ml-1 text-kumkum underline">{t("clear")}</button>
            </p>
          )}
        </div>
        {/* scalloped toran edge */}
        <div className="scallop-edge absolute inset-x-0 bottom-0 text-cream" aria-hidden />
      </section>

      {/* Category strip */}
      {categories.length > 1 && (
        <div className="mx-auto -mt-24 max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap gap-2 rounded-2xl border border-gold/50 bg-white p-3 shadow-card">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                  category === c
                    ? "bg-kumkum text-cream"
                    : "bg-sandal/60 text-kumkum-dark hover:bg-sandal"
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
          <h2 className="text-2xl font-extrabold text-kumkum-dark">{t("deals")}</h2>
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
          <h2 className="text-2xl font-extrabold text-kumkum-dark">{t("suggested")}</h2>
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
          <h2 className="text-2xl font-extrabold text-kumkum-dark">{query ? t("results") : t("allProd")}</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPh")}
            className="w-full rounded-lg border border-gold/50 bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus:border-kumkum focus:ring-2 focus:ring-kumkum/15 sm:w-72"
          />
        </div>
        {filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-kumkum/40 bg-white px-6 py-16 text-center shadow-card">
            <span className="text-5xl">🪔</span>
            <p className="mt-4 text-lg font-extrabold text-kumkum-dark">{query ? t("noRes", { q: query }) : t("emptyT")}</p>
            <p className="mt-1 text-sm text-[#8a6a4f]">
              {query
                ? t("tryDiff")
                 : t("emptyD")}
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
    <Suspense fallback={<p className="py-20 text-center text-[#a08464]">Loading…</p>}>
      <Storefront />
    </Suspense>
  );
}
