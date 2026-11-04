import { createHash, randomBytes } from "crypto";
import type { Analytics, Customer, Order, Product, Role, Session, User } from "./types";

/**
 * Server-side data layer.
 *
 * Starts EMPTY — no sample products, orders or customers. Real data appears
 * only when the founder/admin publishes products and customers place orders.
 * The only seeded record is the founder (owner) account, whose credentials
 * are set via env vars (INDIVA_FOUNDER_EMAIL / INDIVA_FOUNDER_PASSWORD).
 *
 * Uses an in-memory store. On Vercel each serverless instance keeps its own
 * warm copy, so reads/writes are consistent for the lifetime of the instance.
 * Swap `db` for a real database (Vercel Postgres / KV) by re-implementing
 * these functions — the API routes and UI stay unchanged.
 */

declare global {
  // eslint-disable-next-line no-var
  var __indivaDb: DB | undefined;
}

interface DB {
  users: User[];
  sessions: Session[];
  products: Product[];
  orders: Order[];
  customers: Customer[];
  seq: { user: number; product: number; order: number; customer: number };
}

export const FOUNDER_EMAIL = process.env.INDIVA_FOUNDER_EMAIL ?? "indiva.founder@gmail.com";
export const FOUNDER_PASSWORD = process.env.INDIVA_FOUNDER_PASSWORD ?? "1234678";

/* ---------------- password + token helpers ---------------- */

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")): string {
  const hash = createHash("sha256").update(salt + password).digest("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  return createHash("sha256").update(salt + password).digest("hex") === hash;
}

function newToken(): string {
  return randomBytes(24).toString("hex");
}

/* ---------------- users & sessions ---------------- */

export function publicUser(u: User): Omit<User, "passwordHash"> {
  const { passwordHash, ...rest } = u;
  return rest;
}

export function findUserByEmail(email: string): User | undefined {
  return getDb().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function signUp(input: { name: string; email: string; password: string; role?: Role }): User {
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password) throw new Error("Email and password are required");
  if (findUserByEmail(email)) throw new Error("An account with this email already exists");
  // Public sign-up can only create CUSTOMER accounts.
  // Admin accounts are created exclusively by the founder (see createAdminByFounder).
  const role: Role = input.role === "admin" || input.role === "founder" ? "customer" : "customer";
  db.seq.user += 1;
  const user: User = {
    id: `u${String(db.seq.user).padStart(3, "0")}`,
    name: input.name.trim(),
    email,
    passwordHash: hashPassword(input.password),
    role,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  return user;
}

/** Founder-only: assign an admin account. */
export function createAdminByFounder(founder: User, input: { name: string; email: string; password: string }): User {
  if (founder.role !== "founder") throw new Error("Only the founder can create admin accounts");
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password) throw new Error("Email and password are required");
  if (findUserByEmail(email)) throw new Error("An account with this email already exists");
  db.seq.user += 1;
  const user: User = {
    id: `u${String(db.seq.user).padStart(3, "0")}`,
    name: input.name.trim(),
    email,
    passwordHash: hashPassword(input.password),
    role: "admin",
    createdAt: new Date().toISOString(),
    createdBy: founder.id,
  };
  db.users.push(user);
  return user;
}

export function signIn(email: string, password: string): { user: User; token: string } {
  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error("Invalid email or password");
  }
  const db = getDb();
  const session: Session = { token: newToken(), userId: user.id, createdAt: new Date().toISOString() };
  db.sessions.push(session);
  return { user, token: session.token };
}

export function signOut(token: string): void {
  const db = getDb();
  db.sessions = db.sessions.filter((s) => s.token !== token);
}

export function userForToken(token: string | null | undefined): User | undefined {
  if (!token) return undefined;
  const db = getDb();
  const session = db.sessions.find((s) => s.token === token);
  if (!session) return undefined;
  return db.users.find((u) => u.id === session.userId);
}

export function listUsers(): User[] {
  return getDb().users;
}

export function deleteUser(id: string, requester: User): boolean {
  if (requester.role !== "founder") return false;
  const db = getDb();
  const target = db.users.find((u) => u.id === id);
  if (!target || target.role === "founder" || target.id === requester.id) return false;
  db.users = db.users.filter((u) => u.id !== id);
  db.sessions = db.sessions.filter((s) => s.userId !== id);
  return true;
}

/* ---------------- seed (founder only — everything else starts empty) ---------------- */

function buildDb(): DB {
  const now = new Date().toISOString();
  const founder: User = {
    id: "u001",
    name: "Indiva Founder",
    email: FOUNDER_EMAIL,
    passwordHash: hashPassword(FOUNDER_PASSWORD),
    role: "founder",
    createdAt: now,
  };
  return {
    users: [founder],
    sessions: [],
    products: [],
    orders: [],
    customers: [],
    seq: { user: 1, product: 0, order: 1000, customer: 0 },
  };
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

export function createProduct(
  actor: User,
  input: Omit<Product, "id" | "createdAt" | "rating" | "reviews" | "image" | "createdBy"> & Partial<Pick<Product, "rating" | "reviews" | "image">>
): Product {
  const db = getDb();
  db.seq.product += 1;
  const gradients = [
    "from-orange-400 to-amber-300",
    "from-sky-400 to-indigo-400",
    "from-emerald-400 to-teal-300",
    "from-violet-400 to-fuchsia-300",
    "from-amber-400 to-pink-400",
    "from-cyan-400 to-blue-500",
  ];
  const product: Product = {
    id: `p${String(db.seq.product).padStart(3, "0")}`,
    rating: 0,
    reviews: 0,
    image: gradients[db.seq.product % gradients.length],
    createdAt: new Date().toISOString(),
    createdBy: actor.id,
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
  if (!current) return products.filter((p) => p.featured).slice(0, limit);
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
  let cust = db.customers.find((c) => c.email === input.email.toLowerCase());
  if (!cust) {
    db.seq.customer += 1;
    cust = { id: `c${String(db.seq.customer).padStart(3, "0")}`, name: input.customerName, email: input.email.toLowerCase(), orders: 0, spent: 0, joinedAt: new Date().toISOString() };
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
