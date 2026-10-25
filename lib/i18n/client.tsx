"use client";
import { createContext, useContext, useMemo } from "react";
import { makeT, type Dict, type T } from "./t";
import type { Locale } from "./locales";

const Ctx = createContext<{ locale: Locale; dict: Dict }>({ locale: "fr", dict: {} });

export function I18nProvider({ locale, dict, children }: { locale: Locale; dict: Dict; children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, dict }), [locale, dict]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale() {
  return useContext(Ctx).locale;
}

export function useT(): T {
  const { dict } = useContext(Ctx);
  return useMemo(() => makeT(dict), [dict]);
}

export function useDict() {
  return useContext(Ctx).dict;
}
