import type { T } from "@/lib/i18n/t";

// Contenu commun de « Movacash, c'est quoi ? » : la fenêtre avant le paiement (CestQuoi.tsx) et la page publique /c-est-quoi.
// Même texte que l'étape du questionnaire (lib/funnel/engine.ts, showCestQuoi) et que l'article 2 bis des CGV.
// Si ce texte change, changer aussi UNDERSTOOD_VERSION (lib/legal.ts).
const ico = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const ICONES = [
  <svg key="l" viewBox="0 0 24 24" {...ico}><path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z" /><path d="M4 21V5" /></svg>,
  <svg key="c" viewBox="0 0 24 24" {...ico}><path d="M20 12v9H4v-9" /><path d="M2 7h20v5H2z" /><path d="M12 21V7" /><path d="M12 7c-2-4-6-4-6-1s6 1 6 1 6 2 6-1-4-3-6 1" /></svg>,
  <svg key="b" viewBox="0 0 24 24" {...ico}><path d="M3 9l1.5-5h15L21 9" /><path d="M3 9h18v11H3z" /><path d="M9 20v-6h6v6" /></svg>,
];

export const cqLede = (t: T) => t("Movacash est une intelligence artificielle qui crée pour toi des e-books de qualité, prêts en quelques minutes. Tu en fais ce que tu veux.");

export function CestQuoiBlocs({ t }: { t: T }) {
  const usages = [
    [t("Pour toi"), t("Apprendre, t'organiser, garder ce que tu sais dans un vrai livre.")],
    [t("Pour tes proches"), t("Offrir un guide, partager une passion ou un savoir-faire.")],
    [t("Pour le vendre"), t("Sur des plateformes comme Etsy, Gumroad ou Amazon Kindle.")],
  ];
  return (
    <>
      <div className="cq-usages">
        {usages.map(([titre, texte], i) => (
          <div className="cq-usage" key={titre}><span className="cq-ico">{ICONES[i]}</span><div><b>{titre}</b><span>{texte}</span></div></div>
        ))}
      </div>
      <div className="cq-duo">
        <div><b>{t("Movacash fait")}</b><ul><li>{t("L'e-book complet")}</li><li>{t("Le PDF mis en page")}</li><li>{t("La couverture")}</li><li>{t("La fiche de vente")}</li></ul></div>
        <div><b>{t("Movacash ne fait pas")}</b><ul><li>{t("Vendre à ta place")}</li><li>{t("Trouver tes acheteurs")}</li><li>{t("Garantir des revenus")}</li></ul></div>
      </div>
    </>
  );
}
