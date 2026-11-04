"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Product } from "./types";

export interface CartLine {
  product: Product;
  qty: number;
}

interface CartState {
  items: CartLine[];
  add: (p: Product) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
  open: boolean;
  setOpen: (b: boolean) => void;
  toast: string;
  notify: (msg: string) => void;
}

const CartContext = createContext<CartState | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");

  const notify = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }, []);

  const add = useCallback((p: Product) => {
    setItems((prev) => {
      const found = prev.find((l) => l.product.id === p.id);
      if (found) return prev.map((l) => (l.product.id === p.id ? { ...l, qty: Math.min(l.qty + 1, l.product.stock) } : l));
      return [...prev, { product: p, qty: 1 }];
    });
    notify(`${p.name} added to cart`);
  }, [notify]);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((l) => l.product.id !== id)
        : prev.map((l) => (l.product.id === id ? { ...l, qty: Math.min(qty, l.product.stock) } : l))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { count, total } = useMemo(
    () => ({
      count: items.reduce((s, l) => s + l.qty, 0),
      total: items.reduce((s, l) => s + l.qty * l.product.price, 0),
    }),
    [items]
  );

  const value = useMemo(
    () => ({ items, add, setQty, clear, count, total, open, setOpen, toast, notify }),
    [items, add, setQty, clear, count, total, open, toast, notify]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
