"use client";
import { LOCALES } from "@/lib/i18n/locales";
import { useLocale, useT } from "@/lib/i18n/client";

// Sélecteur de langue (la langue est détectée automatiquement, ce menu permet d'en changer).
export default function LangSwitch({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const t = useT();
  return (
    <select
      className={`lang-switch ${className}`}
      value={locale}
      aria-label={t("Langue")}
      onChange={async (e) => {
        await fetch("/api/lang", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locale: e.target.value }) });
        // Rechargement complet : le sondage et les pages serveur repartent dans la nouvelle langue
        window.location.reload();
      }}
    >
      {LOCALES.map((l) => <option key={l.code} value={l.code}>{l.nom}</option>)}
    </select>
  );
}
