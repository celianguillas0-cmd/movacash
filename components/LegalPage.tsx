import FunnelNav from "./funnel/FunnelNav";
import FunnelFooter from "./funnel/FunnelFooter";

export default function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mc">
      <FunnelNav />
      <main className="wrap narrow prose-legal" style={{ marginInline: "auto", paddingBlock: 48 }}>
        <h1 className="q-title">{title}</h1>
        <p className="dim" style={{ marginTop: 8 }}>Modèle à faire valider par un professionnel du droit. Les éléments entre crochets sont à compléter.</p>
        {children}
      </main>
      <FunnelFooter />
    </div>
  );
}
