"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatINR } from "@/components/ProductCard";
import { api } from "@/lib/client";
import { useAuth } from "@/lib/auth-context";
import type { Customer, Order, Product, User } from "@/lib/types";

const STATUSES: Order["status"][] = ["pending", "processing", "shipped", "delivered", "cancelled"];
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-sky-100 text-sky-700",
  shipped: "bg-violet-100 text-violet-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const emptyForm = { name: "", description: "", price: "", category: "Electronics", tags: "", stock: "10", featured: false };
const emptyAdmin = { name: "", email: "", password: "" };

type Tab = "products" | "orders" | "customers" | "team";

export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const isFounder = user?.role === "founder";
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [team, setTeam] = useState<User[]>([]);
  const [toast, setToast] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [adminForm, setAdminForm] = useState(emptyAdmin);
  const [showAdminForm, setShowAdminForm] = useState(false);

  const say = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  useEffect(() => {
    if (!authLoading && !user) router.push("/signin?next=/admin");
  }, [authLoading, user, router]);

  const refresh = useCallback(async () => {
    const [p, o, c] = await Promise.all([
      api<{ products: Product[] }>("/api/products"),
      api<{ orders: Order[] }>("/api/orders"),
      api<{ customers: Customer[] }>("/api/customers"),
    ]);
    setProducts(p.products);
    setOrders(o.orders);
    setCustomers(c.customers);
    if (isFounder) {
      const u = await api<{ users: User[] }>("/api/users");
      setTeam(u.users);
    }
  }, [isFounder]);

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "founder")) refresh();
  }, [user, refresh]);

  if (authLoading || !user) {
    return <p className="mx-auto max-w-3xl px-4 py-20 text-center text-slate-400">Checking your access…</p>;
  }
  if (user.role !== "admin" && user.role !== "founder") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <span className="text-5xl">🔒</span>
        <h1 className="mt-4 text-2xl font-black">Admin access only</h1>
        <p className="mt-2 text-sm text-slate-500">
          This panel is for admins assigned by the founder. Admin accounts can only be created by the owner. Signed in as <b>{user.email}</b> ({user.role}).
        </p>
        <Link href="/" className="mt-6 inline-block rounded-xl bg-brand-600 px-5 py-2.5 font-bold text-white hover:bg-brand-700">Back to the store</Link>
      </div>
    );
  }

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      category: p.category,
      tags: p.tags.join(", "),
      stock: String(p.stock),
      featured: Boolean(p.featured),
    });
    setShowForm(true);
  };

  const saveProduct = async () => {
    const body = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      stock: Number(form.stock),
      featured: form.featured,
    };
    const res = await fetch(editing ? `/api/products/${editing.id}` : "/api/products", {
      method: editing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("indiva_token")}`,
      },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      say(editing ? "Product updated" : "Product published to the store 🇮🇳");
      setShowForm(false);
      refresh();
    } else {
      const d = await res.json();
      say(d.error ?? "Save failed");
    }
  };

  const removeProduct = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    const res = await fetch(`/api/products/${p.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("indiva_token")}` },
    });
    if (res.ok) {
      say("Product deleted");
      refresh();
    }
  };

  const setStatus = async (id: string, status: Order["status"]) => {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("indiva_token")}` },
      body: JSON.stringify({ status }),
    });
    say(`Order ${id} → ${status}`);
    refresh();
  };

  const createAdmin = async () => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("indiva_token")}` },
      body: JSON.stringify(adminForm),
    });
    const d = await res.json();
    if (res.ok) {
      say(`Admin account created for ${d.user.email}`);
      setAdminForm(emptyAdmin);
      setShowAdminForm(false);
      refresh();
    } else {
      say(d.error ?? "Could not create admin");
    }
  };

  const removeAdmin = async (u: User) => {
    if (!confirm(`Remove admin access for ${u.email}?`)) return;
    const res = await fetch(`/api/users/${u.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("indiva_token")}` },
    });
    if (res.ok) {
      say("Admin removed");
      refresh();
    } else {
      const d = await res.json();
      say(d.error ?? "Could not remove admin");
    }
  };

  const tabs: Array<[Tab, string]> = [
    ["products", `📦 Products (${products.length})`],
    ["orders", `🧾 Orders (${orders.length})`],
    ["customers", `👥 Customers (${customers.length})`],
  ];
  if (isFounder) tabs.push(["team", `🛡 Team (${team.length})`]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-[#FF9933]">Admin view · 🇮🇳</p>
          <h1 className="mt-1 text-3xl font-black sm:text-4xl">Store control panel</h1>
          <p className="mt-1 text-sm text-slate-500">
            Products you publish here appear instantly in the store. Signed in as <b>{user.name}</b> ({user.role}).
          </p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">🛠 {isFounder ? "Founder / Super admin" : "Admin panel"}</span>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-2 border-b border-slate-200">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-bold transition ${
              tab === key ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Products tab */}
      {tab === "products" && (
        <div className="mt-6">
          <div className="flex justify-end">
            <button onClick={openCreate} className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-card hover:bg-brand-700">
              + Publish product
            </button>
          </div>

          {showForm && (
            <div className="fade-up mt-4 rounded-2xl border border-brand-200 bg-brand-50/50 p-5 shadow-card">
              <h3 className="font-extrabold">{editing ? `Edit ${editing.name}` : "New product (goes live on the store immediately)"}</h3>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price (₹)" type="number" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  {["Electronics", "Home & Kitchen", "Fashion", "Pooja & Rituals", "Handicrafts", "Food & Spices"].map((c) => <option key={c}>{c}</option>)}
                </select>
                <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock" type="number" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma separated)" className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2" />
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2" />
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured on storefront
                </label>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={saveProduct} className="rounded-lg bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-brand-600">Save</button>
                <button onClick={() => setShowForm(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
              </div>
            </div>
          )}

          {products.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <span className="text-4xl">📦</span>
              <p className="mt-3 font-extrabold">No products published yet</p>
              <p className="mt-1 text-sm text-slate-500">Click “Publish product” to add the first real product to the store.</p>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-bold">{p.name} {p.featured && <span className="ml-1 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">FEATURED</span>}</p>
                        <p className="text-xs text-slate-400">{p.id}</p>
                      </td>
                      <td className="px-4 py-3">{p.category}</td>
                      <td className="px-4 py-3 font-bold">{formatINR(p.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${p.stock === 0 ? "bg-red-100 text-red-700" : p.stock <= 5 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{p.stock}</span>
                      </td>
                      <td className="px-4 py-3">★ {p.rating.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEdit(p)} className="mr-2 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100">Edit</button>
                        <button onClick={() => removeProduct(p)} className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Orders tab */}
      {tab === "orders" && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
          {orders.length === 0 ? (
            <p className="px-6 py-12 text-center text-slate-400">No orders yet — they appear here when customers check out.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold">{o.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{o.customerName}</p>
                      <p className="text-xs text-slate-400">{o.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</td>
                    <td className="px-4 py-3 font-extrabold">{formatINR(o.total)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(o.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short" })}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => setStatus(o.id, e.target.value as Order["status"])}
                        className={`rounded-lg border-0 px-2 py-1 text-xs font-bold capitalize ${STATUS_COLORS[o.status]}`}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Customers tab */}
      {tab === "customers" && (
        <div className="mt-6">
          {customers.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-400">No customers yet — they appear after their first order.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {customers.map((c) => (
                <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-black text-brand-700">
                      {c.name.split(" ").map((w) => w[0]).join("")}
                    </span>
                    <div>
                      <p className="text-sm font-extrabold leading-tight">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.email}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between text-sm">
                    <span className="text-slate-500">Orders</span><span className="font-bold">{c.orders}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-sm">
                    <span className="text-slate-500">Total spent</span><span className="font-extrabold text-brand-700">{formatINR(c.spent)}</span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400">Joined {new Date(c.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Team tab — founder only */}
      {tab === "team" && isFounder && (
        <div className="mt-6">
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5">
            <h3 className="font-extrabold text-indigo-900">🛡 Assign admin accounts</h3>
            <p className="mt-1 text-sm text-indigo-700">
              Only you (the founder / super admin, <b>{user.email}</b>) can create admin accounts. Public sign-up creates customer accounts only.
            </p>
            {!showAdminForm ? (
              <button onClick={() => setShowAdminForm(true)} className="mt-3 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">
                + Create admin account
              </button>
            ) : (
              <div className="fade-up mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} placeholder="Admin name" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <input value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} placeholder="Admin email" type="email" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <input value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} placeholder="Temporary password" type="password" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <div className="flex gap-2 sm:col-span-3">
                  <button onClick={createAdmin} className="rounded-lg bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-brand-600">Create admin</button>
                  <button onClick={() => setShowAdminForm(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {team.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-bold">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${u.role === "founder" ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="px-4 py-3 text-right">
                      {u.role === "admin" && (
                        <button onClick={() => removeAdmin(u)} className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50">Remove admin</button>
                      )}
                      {u.role === "founder" && <span className="text-xs text-slate-400">protected</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-lg">{toast}</div>
      )}
    </div>
  );
}
