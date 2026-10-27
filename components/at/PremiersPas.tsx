"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/t";

// Guide court pour les abonnés qui débutent sur Etsy : 5 étapes d'une ligne, cochables, et le support à portée de clic.
const ETAPES: { titre: string; detail: string; lien?: [string, string] }[] = [
  { titre: tk("Ouvre ta boutique Etsy"), detail: tk("En 10 minutes : nom de boutique, pièce d'identité et IBAN pour recevoir tes ventes."), lien: ["https://www.etsy.com/sell", tk("Ouvrir Etsy")] },
  { titre: tk("Choisis ton idée et crée ton e-book"), detail: tk("Juste en dessous : « Générer », puis « Créer cet e-book ». L'IA écrit tout.") },
  { titre: tk("Télécharge ton PDF"), detail: tk("Dans ton e-book, onglet « Export PDF ».") },
  { titre: tk("Crée ton annonce sur Etsy"), detail: tk("« Ajouter une annonce », type « Numérique ». Copie le titre, les 13 tags et la description de l'onglet « Fiche Etsy », ajoute la miniature et le PDF.") },
  { titre: tk("Publie, puis recommence"), detail: tk("Etsy facture 0,20 $ par annonce. Ajoute ensuite un nouvel e-book régulièrement pour faire vivre ta boutique.") },
];
const CLE = "mc_premiers_pas";

// Guillemets français jamais seuls en bout de ligne.
const insecable = (s: string) => s.replace(/« /g, "«\u00a0").replace(/ »/g, "\u00a0»");

export default function PremiersPas() {
  const t = useT();
  const [faits, setFaits] = useState<number[]>([]);
  const [ouvert, setOuvert] = useState(true);
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(CLE) || "{}");
      setFaits(Array.isArray(s.faits) ? s.faits : []);
      if (s.ferme) setOuvert(false);
    } catch {}
  }, []);
  const garder = (f: number[], o: boolean) => {
    try { localStorage.setItem(CLE, JSON.stringify({ faits: f, ferme: !o })); } catch {}
  };
  const cocher = (k: number) => {
    const f = faits.includes(k) ? faits.filter((x) => x !== k) : [...faits, k];
    setFaits(f);
    garder(f, ouvert);
  };
  const basculer = () => {
    setOuvert(!ouvert);
    garder(faits, !ouvert);
  };
  const support = () => {
    const w = window as unknown as { $crisp?: unknown[][] };
    if (w.$crisp) w.$crisp.push(["do", "chat:open"]);
    else window.location.href = "/app/support";
  };

  return (
    <section className="pp">
      <button type="button" className="pp-tete" onClick={basculer} aria-expanded={ouvert}>
        <span>
          <b>{t("Tes premiers pas sur Etsy")}</b>
          <small>{t("{n} sur {total} faits", { n: faits.length, total: ETAPES.length })}</small>
        </span>
        <i aria-hidden="true">{ouvert ? "−" : "+"}</i>
      </button>
      {ouvert && (
        <>
          <ol className="pp-liste">
            {ETAPES.map((e, k) => (
              <li key={k} className={faits.includes(k) ? "fait" : ""}>
                <button type="button" className="pp-case" onClick={() => cocher(k)} aria-pressed={faits.includes(k)} aria-label={t("Marquer comme fait")}>{faits.includes(k) ? "✓" : k + 1}</button>
                <div>
                  <b>{t(e.titre)}</b>
                  <p>
                    {insecable(t(e.detail))}
                    {e.lien && <> <a href={e.lien[0]} target="_blank" rel="noopener noreferrer">{t(e.lien[1])} ↗</a></>}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div className="pp-aide">
            <p>{t("Bloqué à une étape ? Pose ta question : un conseiller Movacash te répond au plus vite.")}</p>
            <button type="button" className="at-btn" onClick={support}>{t("Poser ma question")}</button>
            <Link href="/app/regles-etsy" className="pp-regles">{t("Les règles d'Etsy à connaître")}</Link>
          </div>
        </>
      )}
    </section>
  );
}
