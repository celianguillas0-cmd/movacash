"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/client";

// Bouton « D'autres idées » de la page de résultats : remplace les 3 idées par 3 nouvelles.
export default function AutresIdees() {
  const t = useT();
  const router = useRouter();
  const [charge, setCharge] = useState(false);
  return (
    <div className="autres-idees">
      <p>{t("Aucune ne te plaît ?")}</p>
      <button
        className="btn btn-ghost"
        disabled={charge}
        onClick={async () => {
          setCharge(true);
          await fetch("/api/quiz/autres", { method: "POST" }).catch(() => null);
          router.refresh();
          setTimeout(() => setCharge(false), 600);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        {charge ? t("Recherche…") : t("Voir 3 autres idées")} <span aria-hidden="true">↻</span>
      </button>
    </div>
  );
}
