import Link from "next/link";

export default function FunnelFooter() {
  return (
    <footer>
      <div className="wrap">
        <div>
          <span className="logo" style={{ fontSize: 20 }}>Mova<span>cash</span></span>
          <p style={{ marginTop: 6 }}>Le radar des formations qui se vendent. Non affilié à Etsy. Aucun revenu garanti.</p>
        </div>
        <div className="links">
          <Link href="/cgv">CGV</Link>
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/confidentialite">Confidentialité</Link>
          <Link href="/avertissement-revenus">Avertissement sur les revenus</Link>
        </div>
      </div>
    </footer>
  );
}
