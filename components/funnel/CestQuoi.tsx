"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { rich } from "@/lib/i18n/rich";
import { useT } from "@/lib/i18n/client";

// Fenêtre « Movacash, c'est quoi ? » affichée sur /tarifs entre le clic sur « Payer » et Stripe.
// Même contenu que l'étape du questionnaire (lib/funnel/engine.ts, showCestQuoi).
const ico = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const ICONES = [
  <svg key="l" viewBox="0 0 24 24" {...ico}><path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z" /><path d="M4 21V5" /></svg>,
  <svg key="c" viewBox="0 0 24 24" {...ico}><path d="M20 12v9H4v-9" /><path d="M2 7h20v5H2z" /><path d="M12 21V7" /><path d="M12 7c-2-4-6-4-6-1s6 1 6 1 6 2 6-1-4-3-6 1" /></svg>,
  <svg key="b" viewBox="0 0 24 24" {...ico}><path d="M3 9l1.5-5h15L21 9" /><path d="M3 9h18v11H3z" /><path d="M9 20v-6h6v6" /></svg>,
];

export default function CestQuoi({ onContinue, onClose, loading, error }: { onContinue: () => void; onClose: () => void; loading: boolean; error: string }) {
  const t = useT();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && !loading && onClose();
    document.addEventListener("keydown", esc);
    const avant = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = avant;
    };
  }, [loading, onClose]);
  const usages = [
    [t("Pour toi"), t("Apprendre, t'organiser, garder ce que tu sais dans un vrai livre.")],
    [t("Pour tes proches"), t("Offrir un guide, partager une passion ou un savoir-faire.")],
    [t("Pour le vendre"), t("Sur des plateformes comme Etsy, Gumroad ou Amazon Kindle.")],
  ];
  return (
    <div className="cq-modal" role="dialog" aria-modal="true" aria-labelledby="cq-titre" onClick={(e) => e.target === e.currentTarget && !loading && onClose()}>
      <div className="cq-boite">
        <h2 id="cq-titre">{t("Movacash, c'est quoi ?")} <em>{t("Avant de payer, deux minutes.")}</em></h2>
        <p className="cq-lede">{t("Movacash est une intelligence artificielle qui crée pour toi des e-books de qualité, prêts en quelques minutes. Tu en fais ce que tu veux.")}</p>
        <div className="cq-usages">
          {usages.map(([titre, texte], i) => (
            <div className="cq-usage" key={titre}><span className="cq-ico">{ICONES[i]}</span><div><b>{titre}</b><span>{texte}</span></div></div>
          ))}
        </div>
        <div className="cq-duo">
          <div><b>{t("Movacash fait")}</b><ul><li>{t("L'e-book complet")}</li><li>{t("Le PDF mis en page")}</li><li>{t("La couverture")}</li><li>{t("La fiche de vente")}</li></ul></div>
          <div><b>{t("Movacash ne fait pas")}</b><ul><li>{t("Vendre à ta place")}</li><li>{t("Trouver tes acheteurs")}</li><li>{t("Garantir des revenus")}</li></ul></div>
        </div>
        <label className="check cq-case" htmlFor="cq-compris">
          <input id="cq-compris" type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />
          <span>{rich(t("J'ai compris que Movacash est un outil qui crée des e-books. Si je choisis de les vendre, mes résultats dépendent de moi et des plateformes, et aucun revenu n'est garanti. <1>En savoir plus</1>"), { 1: (s) => <Link href="/avertissement-revenus" target="_blank">{s}</Link> })}</span>
        </label>
        {error && <p className="error">{error}</p>}
        <button type="button" className="btn btn-accent btn-lg" disabled={!ok || loading} onClick={onContinue}>
          {loading ? t("Redirection vers le paiement…") : t("J'ai compris, continuer vers le paiement") + " →"}
        </button>
        <button type="button" className="cq-retour" onClick={onClose} disabled={loading}>{t("Revenir aux formules")}</button>
      </div>
    </div>
  );
}
