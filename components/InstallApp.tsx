"use client";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/client";

type Invite = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
declare global { interface Window { __mcInstall?: Invite | null } }

const CLE = "mc_install_off";

// Bandeau « Installer l'appli » sur téléphone : bouton natif sur Android, mode d'emploi sur iPhone.
export default function InstallApp() {
  const t = useT();
  const [mode, setMode] = useState<"" | "android" | "ios">("");
  const [aide, setAide] = useState(false);

  useEffect(() => {
    const installee = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone;
    const mobile = window.matchMedia("(pointer: coarse)").matches;
    let ferme = false;
    try { ferme = localStorage.getItem(CLE) === "1"; } catch {}
    if (installee || !mobile || ferme) return;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (ios) { setMode("ios"); return; }
    if (window.__mcInstall) setMode("android");
    const pret = () => setMode("android");
    const fait = () => setMode("");
    window.addEventListener("mc-install", pret);
    window.addEventListener("appinstalled", fait);
    return () => { window.removeEventListener("mc-install", pret); window.removeEventListener("appinstalled", fait); };
  }, []);

  if (!mode) return null;

  const fermer = () => {
    try { localStorage.setItem(CLE, "1"); } catch {}
    setMode("");
  };

  const installer = async () => {
    if (mode === "ios") { setAide(true); return; }
    const invite = window.__mcInstall;
    if (!invite) return;
    await invite.prompt();
    const { outcome } = await invite.userChoice;
    window.__mcInstall = null;
    if (outcome === "accepted") setMode("");
  };

  return (
    <div className="at-install">
      <img src="/icon-192.png" alt="" width={44} height={44} />
      <div className="at-install-texte">
        <b>{t("Installe Movacash sur ton téléphone")}</b>
        <span>{aide ? t("Dans Safari, touche le bouton Partager (le carré avec une flèche), puis « Sur l'écran d'accueil ».") : t("Ouvre ton atelier en un geste, comme une vraie appli.")}</span>
      </div>
      <div className="at-install-actions">
        {!aide && <button type="button" className="at-btn" onClick={installer}>{t("Installer")}</button>}
        <button type="button" className="at-install-x" onClick={fermer} aria-label={t("Fermer")}>×</button>
      </div>
    </div>
  );
}
