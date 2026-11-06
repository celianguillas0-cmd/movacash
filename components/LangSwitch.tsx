"use client";
import { useEffect, useRef, useState } from "react";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { FLAGS } from "@/lib/i18n/flags";
import { useLocale, useT } from "@/lib/i18n/client";

// Menu des langues avec drapeaux (la langue est détectée automatiquement, ce menu permet d'en changer).
// Seulement les langues des pays de l'UE où Movacash est vendu (lib/i18n/locales.ts), chacune avec le drapeau d'un pays de l'UE.
// up : la liste s'ouvre vers le haut (pied de page). bloc : bouton pleine largeur (Paramètres, Admin).
const Drapeau = ({ l }: { l: Locale }) => <span className="lang-drapeau" aria-hidden="true" dangerouslySetInnerHTML={{ __html: FLAGS[l] }} />;

export default function LangSwitch({ className = "", up = false, bloc = false }: { className?: string; up?: boolean; bloc?: boolean }) {
  const locale = useLocale();
  const t = useT();
  const [ouvert, setOuvert] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const boite = useRef<HTMLDivElement>(null);
  const actuelle = LOCALES.find((l) => l.code === locale) || LOCALES[0];

  useEffect(() => {
    if (!ouvert) return;
    const dehors = (e: PointerEvent) => !boite.current?.contains(e.target as Node) && setOuvert(false);
    const echap = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(false);
    document.addEventListener("pointerdown", dehors);
    document.addEventListener("keydown", echap);
    // La langue choisie est visible tout de suite dans la liste
    boite.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
    return () => {
      document.removeEventListener("pointerdown", dehors);
      document.removeEventListener("keydown", echap);
    };
  }, [ouvert]);

  async function choisir(code: Locale) {
    if (code === locale) return setOuvert(false);
    setEnvoi(true);
    await fetch("/api/lang", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locale: code }) }).catch(() => null);
    // Rechargement complet : le sondage et les pages serveur repartent dans la nouvelle langue.
    // Le paramètre ?lang= de l'adresse aurait priorité sur le choix : on l'enlève.
    const u = new URL(window.location.href);
    if (u.searchParams.has("lang")) {
      u.searchParams.delete("lang");
      window.location.replace(u.toString());
    } else window.location.reload();
  }

  return (
    <div ref={boite} className={`lang-menu ${up ? "lang-menu-haut" : ""} ${bloc ? "lang-menu-bloc" : ""} ${className}`}>
      <button type="button" className="lang-bouton" aria-haspopup="listbox" aria-expanded={ouvert} aria-label={`${t("Langue")} : ${actuelle.nom}`} onClick={() => setOuvert((o) => !o)} disabled={envoi}>
        <Drapeau l={actuelle.code} />
        <span className="lang-nom">{actuelle.nom}</span>
        <span className="lang-code" aria-hidden="true">{actuelle.code.toUpperCase()}</span>
        <svg className="lang-fleche" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {ouvert && (
        <div className="lang-liste">
          <ul role="listbox" aria-label={t("Langue")}>
            {LOCALES.map((l) => (
              <li key={l.code}>
                <button type="button" role="option" aria-selected={l.code === locale} lang={l.code} onClick={() => choisir(l.code)}>
                  <Drapeau l={l.code} />
                  <span>{l.nom}</span>
                  {l.code === locale && <svg className="lang-coche" viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </button>
              </li>
            ))}
          </ul>
          <p className="lang-note">{t("Movacash est disponible dans les pays de l'Union européenne.")}</p>
        </div>
      )}
    </div>
  );
}
