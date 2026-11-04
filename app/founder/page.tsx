"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatINR } from "@/components/ProductCard";
import { api } from "@/lib/client";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import type { Analytics, Order } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-sky-100 text-sky-700",
  shipped: "bg-violet-100 text-violet-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function FounderDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/signin?next=/founder");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || user.role !== "founder") return;
    Promise.all([api<{ analytics: Analytics }>("/api/analytics"), api<{ orders: Order[] }>("/api/orders")])
      .then(([a, o]) => {
        setAnalytics(a.analytics);
        setOrders(o.orders);
      })
      .catch((e) => setError(e?.error ?? "Could not load analytics."));
  }, [user]);

  if (authLoading || !user) {
    return <p className="mx-auto max-w-3xl px-4 py-20 text-center text-slate-400">Checking your access…</p>;
  }
  if (user.role !== "founder") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <span className="text-5xl">🔒</span>
        <h1 className="mt-4 text-2xl font-black">Founder access only</h1>
        <p className="mt-2 text-sm text-slate-500">This dashboard is reserved for the owner of Indiva. Signed in as <b>{user.email}</b> ({user.role}).</p>
        <Link href="/" className="mt-6 inline-block rounded-xl bg-brand-600 px-5 py-2.5 font-bold text-white hover:bg-brand-700">Back to the store</Link>
      </div>
    );
  }
  if (error) return <p className="mx-auto max-w-3xl px-4 py-20 text-center text-red-500">{error}</p>;
  if (!analytics) return <p className="mx-auto max-w-3xl px-4 py-20 text-center text-slate-400">Loading founder dashboard…</p>;

  const maxRevenue = Math.max(...analytics.revenueByDay.map((d) => d.revenue), 1);
  const maxCat = Math.max(...analytics.categoryRevenue.map((c) => c.revenue), 1);
  const maxStatus = Math.max(...analytics.ordersByStatus.map((s) => s.count), 1);

  const kpis = [
    { label: "Total revenue", value: formatINR(analytics.revenue), icon: "💰", tint: "bg-emerald-100 text-emerald-700" },
    { label: "Orders", value: String(analytics.orders), icon: "🧾", tint: "bg-brand-100 text-brand-700" },
    { label: "Customers", value: String(analytics.customers), icon: "👥", tint: "bg-indigo-100 text-kumkum" },
    { label: "Avg. order value", value: formatINR(Math.round(analytics.avgOrderValue)), icon: "📊", tint: "bg-amber-100 text-amber-700" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-[#138808]">Founder view · 🇮🇳</p>
          <h1 className="mt-1 text-3xl font-black sm:text-4xl">Business overview</h1>
          <p className="mt-1 text-sm text-slate-500">Revenue, customers and product performance for Indiva — live from the API. Welcome, {user.name}.</p>
        </div>
        <span className="rounded-full bg-kumkum px-3 py-1 text-xs font-bold text-cream">{t("founderDash")}</span>
      </div>

      {analytics.orders === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-[#FF9933] bg-orange-50 px-5 py-4 text-sm text-[#9a3412]">
          📦 No orders yet — publish your first products from the <Link href="/admin" className="font-bold underline">admin panel</Link> and share the store link with customers.
        </div>
      )}

      {/* KPI cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${k.tint}`}>{k.icon}</div>
            <p className="mt-3 text-2xl font-extrabold">{k.value}</p>
            <p className="text-sm font-semibold text-slate-500">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card lg:col-span-2">
          <h2 className="font-extrabold">Revenue — last 14 days</h2>
          <div className="mt-5 flex h-48 items-end gap-1.5">
            {analytics.revenueByDay.map((d) => (
              <div key={d.day} className="group relative flex flex-1 flex-col items-center justify-end gap-1">
                <span className="pointer-events-none absolute -top-8 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">
                  {formatINR(d.revenue)}
                </span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-[#FF9933] to-[#f97316] transition hover:from-[#ea580c]"
                  style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, d.revenue > 0 ? 6 : 2)}%` }}
                />
                <span className="text-[10px] font-semibold text-slate-400">{d.day.split(" ").pop()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders by status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="font-extrabold">Orders by status</h2>
          <div className="mt-5 space-y-3">
            {analytics.ordersByStatus.map((s) => (
              <div key={s.status}>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="capitalize">{s.status}</span><span>{s.count}</span>
                </div>
                <div className="mt-1 h-2.5 rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${STATUS_COLORS[s.status]?.split(" ")[0] ?? "bg-slate-400"}`} style={{ width: `${(s.count / maxStatus) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top products */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="font-extrabold">Top products by revenue</h2>
          {analytics.topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No sales yet — products you publish will appear here.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {analytics.topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-black text-brand-700">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold leading-tight">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.sold} sold</p>
                  </div>
                  <span className="text-sm font-extrabold text-brand-700">{formatINR(p.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Category revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="font-extrabold">Revenue by category</h2>
          {analytics.categoryRevenue.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No category sales yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {analytics.categoryRevenue.map((c) => (
                <div key={c.category}>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>{c.category}</span><span>{formatINR(c.revenue)}</span>
                  </div>
                  <div className="mt-1 h-2.5 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#FF9933] to-[#138808]" style={{ width: `${(c.revenue / maxCat) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="font-extrabold">Recent orders</h2>
          {orders.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No orders yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {orders.slice(0, 6).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-2 text-sm">
                  <div>
                    <p className="font-bold">{o.id} · {o.customerName}</p>
                    <p className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold">{formatINR(o.total)}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 rounded-2xl border border-[#138808]/30 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-card">
        <h2 className="font-extrabold text-[#138808]">💡 Founder insights</h2>
        <ul className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <li>• Best-selling category: <b>{analytics.categoryRevenue[0]?.category ?? "—"}</b> ({analytics.categoryRevenue[0] ? formatINR(analytics.categoryRevenue[0].revenue) : "—"})</li>
          <li>• {analytics.ordersByStatus.find((s) => s.status === "pending")?.count ?? 0} orders pending — ask an admin to process them from the admin panel.</li>
          <li>• Average order value is <b>{formatINR(Math.round(analytics.avgOrderValue))}</b> across {analytics.customers} customers.</li>
          <li>• Top product: <b>{analytics.topProducts[0]?.name ?? "—"}</b> with {analytics.topProducts[0]?.sold ?? 0} units sold.</li>
        </ul>
      </div>
    </div>
  );
}
