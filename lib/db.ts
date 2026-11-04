import type { Analytics, Customer, Order, Product } from "./types";

/**
 * Server-side data layer.
 *
 * Uses an in-memory store seeded with demo data. On Vercel each serverless
 * instance keeps its own warm copy (module-level cache), so reads/writes are
 * consistent for the lifetime of the instance. Swap `db` for a real database
 * (Vercel Postgres / KV / Blob) by re-implementing these functions — the API
 * routes and UI stay unchanged.
 */

declare global {
  // eslint-disable-next-line no-var
  var __indivaDb: DB | undefined;
}

interface DB {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  seq: { product: number; order: number; customer: number };
}

const gradients = [
  "from-rose-400 to-orange-300",
  "from-sky-400 to-indigo-400",
  "from-emerald-400 to-teal-300",
  "from-violet-400 to-fuchsia-300",
  "from-amber-400 to-pink-400",
  "from-cyan-400 to-blue-500",
  "from-lime-400 to-emerald-400",
  "from-fuchsia-400 to-purple-500",
];

function seedProducts(): Product[] {
  const now = new Date().toISOString();
  const defs: Array<Omit<Product, "id" | "image" | "createdAt">> = [
    { name: "Aurora Wireless Headphones", description: "Noise-cancelling over-ear headphones with 40-hour battery, plush memory-foam cups and studio-grade drivers.", price: 8999, category: "Electronics", tags: ["audio", "wireless", "gadget"], rating: 4.8, reviews: 412, stock: 34, featured: true },
    { name: "Nimbus Smart Watch", description: "AMOLED display, heart-rate + SpO2 tracking, GPS and 10-day battery life in a 42mm aluminium case.", price: 12499, category: "Electronics", tags: ["wearable", "fitness", "gadget"], rating: 4.6, reviews: 287, stock: 21, featured: true },
    { name: "Terra Ceramic Mug Set (4)", description: "Hand-glazed stoneware mugs in earthy tones. Dishwasher and microwave safe, 350ml each.", price: 1499, category: "Home & Kitchen", tags: ["kitchen", "ceramic", "gift"], rating: 4.9, reviews: 198, stock: 60 },
    { name: "Lumen Desk Lamp", description: "Dimmable LED desk lamp with wireless charging base and five colour temperatures.", price: 3299, category: "Home & Kitchen", tags: ["lighting", "desk", "home"], rating: 4.5, reviews: 96, stock: 45 },
    { name: "Verve Cotton Oversized Tee", description: "Heavyweight 240gsm organic cotton tee with a relaxed boxy fit. Pre-shrunk and colourfast.", price: 1299, category: "Fashion", tags: ["clothing", "cotton", "basics"], rating: 4.7, reviews: 231, stock: 120, featured: true },
    { name: "Atlas Canvas Backpack", description: "Water-resistant 22L backpack with a padded 15\" laptop sleeve and hidden anti-theft pocket.", price: 4599, category: "Fashion", tags: ["bag", "travel", "everyday"], rating: 4.8, reviews: 176, stock: 38 },
    { name: "Bloom Scented Candle Trio", description: "Soy-wax candles — Jasmine, Sandalwood and Citrus. 60-hour burn time, lead-free wicks.", price: 1899, category: "Home & Kitchen", tags: ["candle", "gift", "home"], rating: 4.6, reviews: 84, stock: 52 },
    { name: "Pulse Bluetooth Speaker", description: "20W portable speaker with 360° sound, IPX7 waterproofing and 18-hour playtime.", price: 5499, category: "Electronics", tags: ["audio", "bluetooth", "outdoor"], rating: 4.4, reviews: 143, stock: 27 },
    { name: "Drift Linen Shirt", description: "Breathable European linen shirt in soft white — perfect for summer days and beach evenings.", price: 2799, category: "Fashion", tags: ["clothing", "linen", "summer"], rating: 4.5, reviews: 67, stock: 44 },
    { name: "Haven Insulated Bottle", description: "1L double-wall stainless bottle keeps drinks cold for 24h or hot for 12h. Leak-proof cap.", price: 2199, category: "Home & Kitchen", tags: ["bottle", "travel", "fitness"], rating: 4.7, reviews: 154, stock: 73 },
    { name: "Pixel Mechanical Keyboard", description: "Hot-swappable 75% mechanical keyboard with PBT keycaps, gasket mount and tri-mode connectivity.", price: 7999, category: "Electronics", tags: ["keyboard", "gaming", "gadget"], rating: 4.9, reviews: 322, stock: 19, featured: true },
    { name: "Muse Leather Wallet", description: "Slim RFID-blocking wallet in full-grain leather with room for 8 cards and folded notes.", price: 2499, category: "Fashion", tags: ["leather", "wallet", "gift"], rating: 4.6, reviews: 118, stock: 55 },
  ];
  return defs.map((d, i) => ({
    ...d,
    id: `p${String(i + 1).padStart(3, "0")}`,
    image: gradients[i % gradients.length],
    createdAt: now,
  }));
}

function seedCustomers(): Customer[] {
  const names = [
    ["Ananya Sharma", "ananya.sharma@example.com"],
    ["Rahul Verma", "rahul.verma@example.com"],
    ["Priya Nair", "priya.nair@example.com"],
    ["Karthik R", "karthik.r@example.com"],
    ["Meera Iyer", "meera.iyer@example.com"],
    ["Arjun Menon", "arjun.menon@example.com"],
    ["Divya Pillai", "divya.pillai@example.com"],
    ["Vikram Singh", "vikram.singh@example.com"],
  ];
  return names.map(([name, email], i) => ({
    id: `c${String(i + 1).padStart(3, "0")}`,
    name,
    email,
    orders: 0,
    spent: 0,
    joinedAt: new Date(Date.now() - (i * 37 + 11) * 86400000).toISOString(),
  }));
}

function seedOrders(products: Product[], customers: Customer[]): Order[] {
  const statuses: Order["status"][] = ["delivered", "shipped", "processing", "pending", "delivered", "delivered", "shipped", "cancelled", "delivered", "processing"];
  const orders: Order[] = [];
  for (let i = 0; i < 24; i++) {
    const dayOffset = Math.floor(Math.random() * 14);
    const createdAt = new Date(Date.now() - dayOffset * 86400000 - Math.floor(Math.random() * 86400000)).toISOString();
    const cust = customers[i % customers.length];
    const count = 1 + Math.floor(Math.random() * 3);
    const items = Array.from({ length: count }, () => {
      const p = products[Math.floor(Math.random() * products.length)];
      const qty = 1 + Math.floor(Math.random() * 2);
      return { productId: p.id, name: p.name, price: p.price, qty };
    });
    const total = items.reduce((s, it) => s + it.price * it.qty, 0);
    orders.push({
      id: `o${String(1000 + i)}`,
      customerName: cust.name,
      email: cust.email,
      items,
      total,
      status: statuses[i % statuses.length],
      createdAt,
    });
  }
  // roll up customer stats
  for (const o of orders) {
    const c = customers.find((c) => c.email === o.email);
    if (c && o.status !== "cancelled") {
      c.orders += 1;
      c.spent += o.total;
    }
  }
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function buildDb(): DB {
  const products = seedProducts();
  const customers = seedCustomers();
  const orders = seedOrders(products, customers);
  return { products, orders, customers, seq: { product: products.length, order: 1024, customer: customers.length } };
}

export function getDb(): DB {
  if (!globalThis.__indivaDb) globalThis.__indivaDb = buildDb();
  return globalThis.__indivaDb;
}

/* ---------------- Products ---------------- */

export function listProducts(): Product[] {
  return getDb().products;
}

export function getProduct(id: string): Product | undefined {
  return getDb().products.find((p) => p.id === id);
}

export function createProduct(input: Omit<Product, "id" | "createdAt" | "rating" | "reviews" | "image"> & Partial<Pick<Product, "rating" | "reviews" | "image">>): Product {
  const db = getDb();
  db.seq.product += 1;
  const product: Product = {
    id: `p${String(db.seq.product).padStart(3, "0")}`,
    rating: 0,
    reviews: 0,
    image: gradients[db.seq.product % gradients.length],
    createdAt: new Date().toISOString(),
    ...input,
  };
  db.products.unshift(product);
  return product;
}

export function updateProduct(id: string, patch: Partial<Product>): Product | undefined {
  const db = getDb();
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  db.products[idx] = { ...db.products[idx], ...patch, id };
  return db.products[idx];
}

export function deleteProduct(id: string): boolean {
  const db = getDb();
  const before = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  return db.products.length < before;
}

/** "Customers also bought" style suggestions. */
export function suggestProducts(productId: string, limit = 4): Product[] {
  const products = getDb().products;
  const current = products.find((p) => p.id === productId);
  if (!current) return products.slice(0, limit);
  const scored = products
    .filter((p) => p.id !== productId)
    .map((p) => {
      let score = 0;
      if (p.category === current.category) score += 3;
      score += p.tags.filter((t) => current.tags.includes(t)).length * 2;
      if (p.featured) score += 1;
      score += p.rating * 0.2;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.p);
}

/* ---------------- Orders ---------------- */

export function listOrders(): Order[] {
  return getDb().orders;
}

export function getOrder(id: string): Order | undefined {
  return getDb().orders.find((o) => o.id === id);
}

export function createOrder(input: { customerName: string; email: string; items: { productId: string; qty: number }[] }): Order {
  const db = getDb();
  const items = input.items
    .map((it) => {
      const p = db.products.find((p) => p.id === it.productId);
      if (!p || it.qty <= 0) return null;
      if (p.stock < it.qty) throw new Error(`Insufficient stock for ${p.name}`);
      p.stock -= it.qty;
      return { productId: p.id, name: p.name, price: p.price, qty: it.qty };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  if (items.length === 0) throw new Error("Order has no valid items");
  const total = items.reduce((s, it) => s + it.price * it.qty, 0);
  db.seq.order += 1;
  const order: Order = {
    id: `o${db.seq.order}`,
    customerName: input.customerName,
    email: input.email,
    items,
    total,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  db.orders.unshift(order);
  // update / create customer rollup
  let cust = db.customers.find((c) => c.email === input.email);
  if (!cust) {
    db.seq.customer += 1;
    cust = { id: `c${String(db.seq.customer).padStart(3, "0")}`, name: input.customerName, email: input.email, orders: 0, spent: 0, joinedAt: new Date().toISOString() };
    db.customers.unshift(cust);
  }
  cust.orders += 1;
  cust.spent += total;
  return order;
}

export function updateOrderStatus(id: string, status: Order["status"]): Order | undefined {
  const db = getDb();
  const order = db.orders.find((o) => o.id === id);
  if (!order) return undefined;
  order.status = status;
  return order;
}

/* ---------------- Customers ---------------- */

export function listCustomers(): Customer[] {
  return getDb().customers;
}

/* ---------------- Analytics (founder) ---------------- */

export function getAnalytics(): Analytics {
  const db = getDb();
  const live = db.orders.filter((o) => o.status !== "cancelled");
  const revenue = live.reduce((s, o) => s + o.total, 0);
  const orders = db.orders.length;
  const customers = db.customers.length;
  const avgOrderValue = live.length ? revenue / live.length : 0;

  const days: Analytics["revenueByDay"] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const dayRevenue = live
      .filter((o) => new Date(o.createdAt).toDateString() === d.toDateString())
      .reduce((s, o) => s + o.total, 0);
    days.push({ day: label, revenue: dayRevenue });
  }

  const byProduct = new Map<string, { name: string; sold: number; revenue: number }>();
  for (const o of live) {
    for (const it of o.items) {
      const cur = byProduct.get(it.productId) ?? { name: it.name, sold: 0, revenue: 0 };
      cur.sold += it.qty;
      cur.revenue += it.price * it.qty;
      byProduct.set(it.productId, cur);
    }
  }
  const topProducts = [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const statusOrder: Order["status"][] = ["pending", "processing", "shipped", "delivered", "cancelled"];
  const ordersByStatus = statusOrder.map((status) => ({ status, count: db.orders.filter((o) => o.status === status).length }));

  const catMap = new Map<string, number>();
  for (const o of live) {
    for (const it of o.items) {
      const p = db.products.find((p) => p.id === it.productId);
      const cat = p?.category ?? "Other";
      catMap.set(cat, (catMap.get(cat) ?? 0) + it.price * it.qty);
    }
  }
  const categoryRevenue = [...catMap.entries()].map(([category, revenue]) => ({ category, revenue })).sort((a, b) => b.revenue - a.revenue);

  return { revenue, orders, customers, avgOrderValue, revenueByDay: days, topProducts, ordersByStatus, categoryRevenue };
}
