"use client";

import { useI18n } from "@/lib/i18n";

import type { Product } from "@/lib/types";

export function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

const emojiFor: Record<string, string> = {
  Electronics: "📱",
  "Home & Kitchen": "🏺",
  Fashion: "🧣",
  Handicrafts: "🪔",
  "Pooja & Rituals": "🪔",
  "Food & Spices": "🌶️",
};

export default function ProductCard({ product, onAdd }: { product: Product; onAdd?: (p: Product) => void }) {
  const { t } = useI18n();
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gold/40 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lg">
      {/* tricolor top edge */}
      <div className="tricolor-line" aria-hidden />
      <div className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${product.image} text-6xl`}>
        <span className="drop-shadow-sm transition group-hover:scale-110">{emojiFor[product.category] ?? "📦"}</span>
        {product.featured && (
          <span className="absolute left-3 top-3 rounded-full border border-kumkum/20 bg-cream px-2.5 py-1 text-xs font-extrabold text-kumkum shadow">{t("featured")}</span>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-kumkum px-2.5 py-1 text-xs font-bold text-cream shadow">{t("onlyLeft", { n: product.stock })}</span>
        )}
        {product.stock === 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow">{t("soldOut")}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-[#a08464]">{product.category}</span>
          <span className="text-xs font-bold text-gold">★ {product.rating.toFixed(1)} <span className="text-[#c9b299]">({product.reviews})</span></span>
        </div>
        <h3 className="mt-1 font-extrabold leading-snug text-kumkum-dark">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-[#7a5c40]">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-lg font-black text-kumkum">{formatINR(product.price)}</span>
          <button
            disabled={product.stock === 0}
            onClick={() => onAdd?.(product)}
            className="rounded-lg bg-kumkum px-3.5 py-2 text-sm font-bold text-cream transition hover:bg-kumkum-dark disabled:cursor-not-allowed disabled:bg-sandal disabled:text-[#a08464]"
          >
            {product.stock === 0 ? t("soldOut") : t("addCart")}
          </button>
        </div>
      </div>
    </div>
  );
}
