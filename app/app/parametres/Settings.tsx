"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ws/Modal";

type U = {
  email: string; name: string; author_name: string; default_language: string | null; default_tone: string | null;
  email_tips: boolean; created_at: number; hasSub: boolean;
};

async function send(url: string, method: string, body?: unknown) {
  const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Une erreur est survenue, réessaie.");
  return d;
}

// Petit gestionnaire d'état pour chaque formulaire : envoi, message de succès ou d'erreur
function useAction() {
  const [state, setState] = useState<{ busy: boolean; ok: string; error: string }>({ busy: false, ok: "", error: "" });
  async function run(fn: () => Promise<unknown>, ok: string) {
    setState({ busy: true, ok: "", error: "" });
    try {
      await fn();
      setState({ busy: false, ok, error: "" });
      return true;
    } catch (e) {
      setState({ busy: false, ok: "", error: (e as Error).message });
      return false;
    }
  }
  return { ...state, run };
}

function Status({ ok, error }: { ok: string; error: string }) {
  if (error) return <p className="text-sm text-red-600" role="alert">{error}</p>;
  if (ok) return <p className="text-sm text-green-700" role="status">{ok}</p>;
  return null;
}

export default function Settings({ user }: { user: U }) {
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: user.name, author_name: user.author_name, default_language: user.default_language, default_tone: user.default_tone, email_tips: user.email_tips,
  });
  const [email, setEmail] = useState({ email: user.email, password: "" });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [del, setDel] = useState<{ open: boolean; password: string; confirm: string }>({ open: false, password: "", confirm: "" });
  const pA = useAction(), eA = useAction(), wA = useAction(), sA = useAction(), dA = useAction();

  return (
    <div className="space-y-6">
      <form
        className="card space-y-4"
        onSubmit={(e) => { e.preventDefault(); pA.run(() => send("/api/account/profile", "PATCH", profile), "Profil enregistré ✓").then((ok) => ok && router.refresh()); }}
      >
        <h2 className="h2">Profil</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="s-name">Prénom</label>
            <input id="s-name" className="input" value={profile.name} maxLength={100} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="s-author">Nom d'auteur sur les e-books</label>
            <input id="s-author" className="input" value={profile.author_name} maxLength={100} placeholder={profile.name || "Ex. Camille Martin"} onChange={(e) => setProfile({ ...profile, author_name: e.target.value })} />
            <p className="mt-1 text-xs text-slate-500">Un pseudonyme ou le nom de ta boutique Etsy, au choix.</p>
          </div>
          <div>
            <label className="label" htmlFor="s-lang">Langue par défaut</label>
            <select id="s-lang" className="input" value={profile.default_language ?? ""} onChange={(e) => setProfile({ ...profile, default_language: e.target.value || null })}>
              <option value="">Français (par défaut)</option>
              <option value="fr">Français</option>
              <option value="en">Anglais</option>
              <option value="es">Espagnol</option>
              <option value="de">Allemand</option>
              <option value="it">Italien</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="s-tone">Ton par défaut</label>
            <select id="s-tone" className="input" value={profile.default_tone ?? ""} onChange={(e) => setProfile({ ...profile, default_tone: e.target.value || null })}>
              <option value="">Pédagogique (par défaut)</option>
              <option value="pedagogique">Pédagogique</option>
              <option value="motivant">Motivant</option>
              <option value="expert">Expert</option>
              <option value="convivial">Convivial</option>
            </select>
          </div>
        </div>
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input type="checkbox" className="mt-1 accent-[#a5d8ff]" checked={profile.email_tips} onChange={(e) => setProfile({ ...profile, email_tips: e.target.checked })} />
          Recevoir de temps en temps des conseils pour vendre sur Etsy (désinscription en un clic).
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-primary" disabled={pA.busy}>{pA.busy ? "Enregistrement…" : "Enregistrer"}</button>
          <Status ok={pA.ok} error={pA.error} />
        </div>
      </form>

      <form
        className="card space-y-4"
        onSubmit={(e) => { e.preventDefault(); eA.run(() => send("/api/account/email", "POST", email), "Adresse e-mail mise à jour ✓").then((ok) => { if (ok) { setEmail({ ...email, password: "" }); router.refresh(); } }); }}
      >
        <h2 className="h2">Adresse e-mail</h2>
        <p className="muted">Elle sert à te connecter et à recevoir tes factures.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="s-email">Nouvelle adresse</label>
            <input id="s-email" className="input" type="email" required value={email.email} onChange={(e) => setEmail({ ...email, email: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="s-email-pw">Mot de passe actuel</label>
            <input id="s-email-pw" className="input" type="password" required autoComplete="current-password" value={email.password} onChange={(e) => setEmail({ ...email, password: e.target.value })} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-secondary" disabled={eA.busy || email.email.trim().toLowerCase() === user.email}>Changer d'adresse</button>
          <Status ok={eA.ok} error={eA.error} />
        </div>
      </form>

      <form
        className="card space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (pw.next !== pw.confirm) return wA.run(async () => { throw new Error("Les deux nouveaux mots de passe ne sont pas identiques"); }, "");
          wA.run(() => send("/api/account/password", "POST", { current: pw.current, next: pw.next }), "Mot de passe changé ✓ Tes autres appareils ont été déconnectés.").then((ok) => ok && setPw({ current: "", next: "", confirm: "" }));
        }}
      >
        <h2 className="h2">Mot de passe</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="s-cur">Actuel</label>
            <input id="s-cur" className="input" type="password" required autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="s-new">Nouveau</label>
            <input id="s-new" className="input" type="password" required minLength={8} autoComplete="new-password" placeholder="8 caractères minimum" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="s-conf">Confirmation</label>
            <input id="s-conf" className="input" type="password" required minLength={8} autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-secondary" disabled={wA.busy}>Changer le mot de passe</button>
          <Status ok={wA.ok} error={wA.error} />
        </div>
      </form>

      <section className="card space-y-3">
        <h2 className="h2">Sécurité</h2>
        <p className="muted">Tu t'es connecté(e) sur un ordinateur qui n'est pas le tien ? Déconnecte toutes les autres sessions.</p>
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-secondary" disabled={sA.busy} onClick={() => sA.run(() => send("/api/account/logout-all", "POST"), "Les autres appareils sont déconnectés ✓")}>Déconnecter les autres appareils</button>
          <Status ok={sA.ok} error={sA.error} />
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="h2">Mes données</h2>
        <p className="muted">
          Compte créé le {new Date(user.created_at * 1000).toLocaleDateString("fr-FR")}. Tu peux télécharger toutes tes données (profil, réponses au questionnaire, e-books et chapitres) au format JSON.
        </p>
        <a className="btn-secondary" href="/api/account/export" download>Télécharger mes données</a>
      </section>

      <section className="card space-y-3 border-red-200">
        <h2 className="h2 text-red-600">Supprimer mon compte</h2>
        <p className="muted">
          Suppression définitive de ton compte et de tous tes e-books.{user.hasSub ? " Ton abonnement est arrêté immédiatement, sans remboursement de la période en cours : si tu veux seulement arrêter de payer, résilie plutôt depuis Abonnement." : ""} Pense à télécharger tes PDF avant.
        </p>
        <button className="btn-danger" onClick={() => setDel({ open: true, password: "", confirm: "" })}>Supprimer mon compte</button>
      </section>

      {del.open && (
        <Modal title="Supprimer mon compte" onClose={() => !dA.busy && setDel({ ...del, open: false })}>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              dA.run(() => send("/api/account", "DELETE", { password: del.password, confirm: del.confirm }), "").then((ok) => { if (ok) window.location.href = "/?compte-supprime=1"; });
            }}
          >
            <p className="text-sm text-slate-700">Cette action est définitive : tes e-books, chapitres, favoris et réponses seront effacés.</p>
            <div>
              <label className="label" htmlFor="d-pw">Mot de passe</label>
              <input id="d-pw" className="input" type="password" required autoComplete="current-password" value={del.password} onChange={(e) => setDel({ ...del, password: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="d-conf">Tape SUPPRIMER pour confirmer</label>
              <input id="d-conf" className="input" required value={del.confirm} onChange={(e) => setDel({ ...del, confirm: e.target.value })} autoComplete="off" />
            </div>
            <Status ok="" error={dA.error} />
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setDel({ ...del, open: false })}>Annuler</button>
              <button className="btn-danger" disabled={dA.busy || del.confirm !== "SUPPRIMER"}>{dA.busy ? "Suppression…" : "Supprimer définitivement"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
