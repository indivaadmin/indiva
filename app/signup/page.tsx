"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

export default function SignUpPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? t("invalid"));
      return;
    }
    router.push("/signin?signup=1");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
        <div className="text-center">
          <span className="text-3xl">🪔</span>
          <h1 className="mt-2 text-2xl font-black">{t("suTitle")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("suSub")}</p>
        </div>
        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>}
        <div className="mt-5 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("name")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-kumkum focus:ring-2 focus:ring-kumkum/15"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("email")}
            type="email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-kumkum focus:ring-2 focus:ring-kumkum/15"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("passMin")}
            type="password"
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-kumkum focus:ring-2 focus:ring-kumkum/15"
          />
        </div>
        <button
          onClick={submit}
          disabled={busy || password.length < 6}
          className="mt-5 w-full rounded-xl bg-kumkum py-3 font-bold text-cream shadow-card transition hover:bg-kumkum-dark disabled:bg-slate-300"
        >
          {busy ? t("creating") : t("suBtn")}
        </button>
        <p className="mt-4 text-center text-sm text-slate-500">
          {t("haveAcc")} <Link href="/signin" className="font-bold text-kumkum hover:underline">{t("signin")}</Link>
        </p>
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-700">
          {t("adminNote")}
        </p>
      </div>
    </div>
  );
}
