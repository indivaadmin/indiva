"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function FooterLinks() {
  const { t } = useI18n();
  return (
    <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 font-semibold">
      <Link href="/" className="hover:text-gold-light hover:underline">{t("shop")}</Link>
      <Link href="/signin" className="hover:text-gold-light hover:underline">{t("signin")}</Link>
      <Link href="/signup" className="hover:text-gold-light hover:underline">{t("signup")}</Link>
      <Link href="/founder" className="hover:text-gold-light hover:underline">{t("founder")}</Link>
      <Link href="/admin" className="hover:text-gold-light hover:underline">{t("admin")}</Link>
    </div>
  );
}
