"use client";

import type { Product } from "@/lib/types";

export function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

const emojiFor: Record<string, string> = {
  Electronics: "🎧",
  "Home & Kitchen": "🏠",
  Fashion: "👕",
};

export default function ProductCard({ product, onAdd }: { product: Product; onAdd?: (p: Product) => void }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lg">
      <div className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${product.image} text-6xl`}>
        <span className="drop-shadow-sm transition group-hover:scale-110">{emojiFor[product.category] ?? "📦"}</span>
        {product.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-brand-700 shadow">Featured</span>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow">Only {product.stock} left</span>
        )}
        {product.stock === 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow">Out of stock</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{product.category}</span>
          <span className="text-xs font-semibold text-amber-500">★ {product.rating.toFixed(1)} <span className="text-slate-400">({product.reviews})</span></span>
        </div>
        <h3 className="mt-1 font-bold leading-snug">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-lg font-extrabold text-brand-700">{formatINR(product.price)}</span>
          <button
            disabled={product.stock === 0}
            onClick={() => onAdd?.(product)}
            className="rounded-lg bg-ink px-3.5 py-2 text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {product.stock === 0 ? "Sold out" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
