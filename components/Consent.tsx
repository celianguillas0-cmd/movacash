"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n/client";

// Microsoft Clarity (cartes de clics, enregistrements de sessions) : chargé UNIQUEMENT après « Accepter ».
// Sans NEXT_PUBLIC_CLARITY_ID dans Vercel, ni bandeau ni script.
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;
const CLE = "mc_consent";

type Clarity = ((...args: unknown[]) => void) & { q?: unknown[] };
declare global { interface Window { clarity?: Clarity } }

function chargerClarity(id: string) {
  if (window.clarity) return;
  const c: Clarity = (...args: unknown[]) => { (c.q = c.q || []).push(args); };
  window.clarity = c;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.clarity.ms/tag/" + id;
  document.head.appendChild(s);
  c("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" });
}

const lire = () => { try { return localStorage.getItem(CLE); } catch { return null; } };
const ecrire = (v: string) => { try { localStorage.setItem(CLE, v); } catch {} };

export default function Consent() {
  const t = useT();
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    if (!CLARITY_ID) return;
    const choix = lire();
    if (choix === "oui") chargerClarity(CLARITY_ID);
    else if (choix !== "non") setOuvert(true);
    const rouvrir = () => setOuvert(true);
    window.addEventListener("mc-consent", rouvrir);
    return () => window.removeEventListener("mc-consent", rouvrir);
  }, []);

  if (!CLARITY_ID || !ouvert) return null;

  const accepter = () => { ecrire("oui"); setOuvert(false); chargerClarity(CLARITY_ID); };
  const refuser = () => {
    const avant = lire();
    ecrire("non");
    setOuvert(false);
    // Retrait du consentement : Clarity efface ses cookies, puis on recharge sans le script.
    if (avant === "oui" && window.clarity) { window.clarity("consent", false); window.location.reload(); }
  };

  return (
    <div className="mc-consent" role="dialog" aria-live="polite" aria-label={t("Cookies")}>
      <p>
        {t("On utilise Microsoft Clarity pour voir comment le site est utilisé (clics, défilement) et l'améliorer. Ça dépose des cookies de mesure d'audience, seulement si tu acceptes.")}{" "}
        <Link href="/confidentialite">{t("En savoir plus")}</Link>
      </p>
      <div className="mc-consent-btns">
        <button onClick={refuser}>{t("Refuser")}</button>
        <button onClick={accepter}>{t("Accepter")}</button>
      </div>
    </div>
  );
}

// Lien « Gérer les cookies » (pied de page, confidentialité) : rouvre le bandeau.
export function ConsentLink() {
  const t = useT();
  if (!CLARITY_ID) return null;
  return (
    <button type="button" className="mc-consent-lien" onClick={() => window.dispatchEvent(new Event("mc-consent"))}>
      {t("Gérer les cookies")}
    </button>
  );
}
