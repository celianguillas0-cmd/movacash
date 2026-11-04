"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { rich } from "@/lib/i18n/rich";
import { useT } from "@/lib/i18n/client";
import { CestQuoiBlocs, cqLede } from "./CestQuoiContenu";

// Fenêtre « Movacash, c'est quoi ? » affichée sur /tarifs entre le clic sur « Payer » et Stripe.
// Contenu partagé avec la page publique /c-est-quoi (CestQuoiContenu.tsx) ; même texte que l'étape du questionnaire.
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
  return (
    <div className="cq-modal" role="dialog" aria-modal="true" aria-labelledby="cq-titre" onClick={(e) => e.target === e.currentTarget && !loading && onClose()}>
      <div className="cq-boite">
        <h2 id="cq-titre">{t("Movacash, c'est quoi ?")} <em>{t("Avant de payer, deux minutes.")}</em></h2>
        <p className="cq-lede">{cqLede(t)}</p>
        <CestQuoiBlocs t={t} />
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
