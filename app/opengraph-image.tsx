import { ImageResponse } from "next/og";
import { APP_NAME } from "@/lib/config";
import { getT } from "@/lib/i18n/server";

// Aperçu affiché quand le lien est partagé (WhatsApp, Facebook, X, Discord…)
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = APP_NAME;

export default async function OgImage() {
  const { t } = await getT();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "#000", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40, fontWeight: 700 }}>
          <svg width="64" height="64" viewBox="0 0 32 32">
            <rect x=".5" y=".5" width="31" height="31" rx="6.5" fill="none" stroke="#fff" strokeOpacity=".3" />
            <path d="M9 8h10a4 4 0 0 1 4 4v12H13a4 4 0 0 1-4-4z" fill="#fff" />
            <path d="M13 13h6M13 17h6" stroke="#000" strokeWidth="2" />
          </svg>
          {APP_NAME}
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 700, lineHeight: 1.08, letterSpacing: -2 }}>
          <span>{t("Crée ton premier business")}</span>
          <span style={{ color: "#8a8a8a" }}>{t("dès aujourd'hui.")}</span>
        </div>
        <div style={{ fontSize: 30, color: "#bdbdbd" }}>{t("Créez des e-books de qualité à vendre sur Etsy")}</div>
      </div>
    ),
    size,
  );
}
