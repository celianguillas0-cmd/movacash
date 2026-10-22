import PublicNav from "./PublicNav";
import Footer from "./Footer";

export default function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <PublicNav />
      <main className="prose-legal mx-auto max-w-3xl px-4 py-10">
        <h1 className="h1">{title}</h1>
        <p className="muted">Modèle à faire valider par un professionnel du droit. Les éléments entre crochets sont à compléter.</p>
        {children}
      </main>
      <Footer />
    </>
  );
}
