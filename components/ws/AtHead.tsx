import { getT } from "@/lib/i18n/server";

// En-tête commun des pages de l'atelier : surtitre « Ton atelier — Prénom », gros titre, filet.
export default async function AtHead({ name, title, children }: { name?: string; title: React.ReactNode; children?: React.ReactNode }) {
  const { t } = await getT();
  const prenom = (name || "").trim().split(/\s+/)[0];
  return (
    <header>
      <p className="at-kicker">{t("Ton atelier")}{prenom ? ` — ${prenom}` : ""}</p>
      <h1 className="at-titre">{title}</h1>
      {children}
      <hr className="at-trait" />
    </header>
  );
}
