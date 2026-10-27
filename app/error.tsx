"use client";
import { useEffect } from "react";
import { useT } from "@/lib/i18n/client";

// Erreur inattendue dans une page : message clair et bouton pour réessayer, au lieu d'un écran blanc.
export default function Erreur({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT();
  useEffect(() => console.error(error), [error]);
  return (
    <div className="mc dark" style={{ minHeight: "100vh" }}>
      <main className="wrap narrow" style={{ marginInline: "auto", paddingBlock: "18vh", textAlign: "center" }}>
        <h1 className="q-title">{t("Oups, un souci est survenu.")}</h1>
        <p className="q-help" style={{ marginTop: 10 }}>{t("Réessaie dans un instant. Si ça continue, écris-nous depuis la page Support.")}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 26 }}>
          <button className="btn btn-accent btn-lg" onClick={reset}>{t("Réessayer")}</button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="btn btn-ghost btn-lg" href="/">{t("Retour à l'accueil")}</a>
        </div>
      </main>
    </div>
  );
}
