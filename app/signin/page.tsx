"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? t("invalid"));
      return;
    }
    signIn(data.token, data.user);
    const next = params.get("next");
    if (next === "/founder" && data.user.role === "founder") router.push("/founder");
    else if ((next === "/admin") && (data.user.role === "admin" || data.user.role === "founder")) router.push("/admin");
    else if (data.user.role === "founder") router.push("/founder");
    else if (data.user.role === "admin") router.push("/admin");
    else router.push("/");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
        <div className="text-center">
          <span className="text-3xl">🪔</span>
          <h1 className="mt-2 text-2xl font-black">{t("siTitle")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("siSub")}</p>
        </div>
        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>}
        <div className="mt-5 space-y-3">
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
            placeholder={t("pass")}
            type="password"
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-kumkum focus:ring-2 focus:ring-kumkum/15"
          />
        </div>
        <button
          onClick={submit}
          disabled={busy}
          className="mt-5 w-full rounded-xl bg-kumkum py-3 font-bold text-cream shadow-card transition hover:bg-kumkum-dark disabled:bg-slate-300"
        >
          {busy ? t("signing") : t("siBtn")}
        </button>
        <p className="mt-4 text-center text-sm text-slate-500">
          New customer? <Link href="/signup" className="font-bold text-kumkum hover:underline">Create an account</Link>
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">
          {t("adminNote")}
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<p className="py-20 text-center text-slate-400">Loading…</p>}>
      <SignInForm />
    </Suspense>
  );
}
