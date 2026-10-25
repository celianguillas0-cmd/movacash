// En-tête commun des pages de l'atelier : surtitre « Ton atelier — Prénom », gros titre, filet.
export default function AtHead({ name, title, children }: { name?: string; title: React.ReactNode; children?: React.ReactNode }) {
  const prenom = (name || "").trim().split(/\s+/)[0];
  return (
    <header>
      <p className="at-kicker">Ton atelier{prenom ? ` — ${prenom}` : ""}</p>
      <h1 className="at-titre">{title}</h1>
      {children}
      <hr className="at-trait" />
    </header>
  );
}
