"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import en from "./lang/en";
import hi from "./lang/hi";
import ta from "./lang/ta";
import te from "./lang/te";
import kn from "./lang/kn";
import ml from "./lang/ml";
import mr from "./lang/mr";
import bn from "./lang/bn";
import gu from "./lang/gu";
import pa from "./lang/pa";
import or from "./lang/or";
import ur from "./lang/ur";

export const LANGS = [
  { code: "en", native: "English" },
  { code: "hi", native: "हिन्दी" },
  { code: "ta", native: "தமிழ்" },
  { code: "te", native: "తెలుగు" },
  { code: "kn", native: "ಕನ್ನಡ" },
  { code: "ml", native: "മലയാളം" },
  { code: "mr", native: "मराठी" },
  { code: "bn", native: "বাংলা" },
  { code: "gu", native: "ગુજરાતી" },
  { code: "pa", native: "ਪੰਜਾਬੀ" },
  { code: "or", native: "ଓଡ଼ିଆ" },
  { code: "ur", native: "اردو" },
] as const;

export type LangCode = (typeof LANGS)[number]["code"];

export const DICT: Record<string, Record<string, string>> = { en, hi, ta, te, kn, ml, mr, bn, gu, pa, or, ur };

type I18nState = {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nState>({ lang: "en", setLang: () => {}, t: (k) => k });

export function useI18n() {
  return useContext(I18nContext);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    const saved = localStorage.getItem("indiva_lang") as LangCode | null;
    if (saved && (LANGS as readonly { code: string }[]).some((l) => l.code === saved)) setLangState(saved as LangCode);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: LangCode) => {
    setLangState(l);
    localStorage.setItem("indiva_lang", l);
  };

  const t = useMemo(() => {
    return (key: string, vars?: Record<string, string | number>) => {
      const dict = DICT[lang] ?? en;
      let s = dict[key] ?? en[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
      return s;
    };
  }, [lang]);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}
