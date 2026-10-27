import crypto from "node:crypto";
import { all, one, run } from "./db";
import type { User } from "./auth";
import { getSecret } from "./auth";
import { APP_NAME, APP_URL, isAdmin } from "./config";
import { isEmailConfigured, sendEmail } from "./email";
import { getDict } from "./i18n/server";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./i18n/locales";
import { makeT } from "./i18n/t";
import { getIdeasByIds } from "./ideas";
import { localizeIdeas } from "./ideas-i18n";

// Relance des inscrits qui n'ont pas payé : un seul e-mail, 24 h après l'inscription, et seulement
// s'ils ont coché « envoie-moi mes idées par e-mail » (prospection = consentement préalable, art. L34-5 CPCE).
// Chaque e-mail porte un lien de désinscription en un clic.

const H = 3600;

export function jetonDesinscription(id: number) {
  return crypto.createHmac("sha256", Buffer.from(getSecret())).update(`desinscription:${id}`).digest("hex").slice(0, 32);
}

export function lienDesinscription(id: number) {
  return `${APP_URL}/desinscription?u=${id}&s=${jetonDesinscription(id)}`;
}

export async function desinscrire(id: number, s: string) {
  const attendu = jetonDesinscription(id);
  if (!s || s.length !== attendu.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(attendu))) return false;
  await run("UPDATE users SET tips_consent = 0 WHERE id = ?", [id]);
  return true;
}

async function emailRelance(u: User) {
  const locale: Locale = isLocale(u.locale) ? u.locale : DEFAULT_LOCALE;
  const t = makeT(getDict(locale));
  let ids: number[] = [];
  try {
    ids = (JSON.parse(u.quiz_json || "{}").ideaIds || []).map(Number).filter(Number.isFinite);
  } catch {}
  // Seule la première idée est nommée : les deux autres restent à débloquer, comme sur la page des résultats
  const [idee] = await localizeIdeas(await getIdeasByIds(ids.slice(0, 1)), locale);
  const desinscription = lienDesinscription(u.id);
  const lignes = [
    u.name ? t("Bonjour {prenom},", { prenom: u.name }) : t("Bonjour,"),
    "",
    idee ? t("Hier, tu as répondu à notre questionnaire. Ta première idée d'e-book à vendre sur Etsy :") : t("Hier, tu as créé ton compte {app}.", { app: APP_NAME }),
    ...(idee ? [locale === "fr" ? `« ${idee.title} »` : `“${idee.title}”`, t("Deux autres idées t'attendent sur ta page de résultats.")] : []),
    "",
    t("Avec ton abonnement, l'IA écrit ton e-book, ta fiche Etsy et ta miniature. Tu n'as plus qu'à le mettre en vente."),
    `${t("Reprendre là où tu t'es arrêté(e) :")} ${APP_URL}/resultats${locale === DEFAULT_LOCALE ? "" : `?lang=${locale}`}`,
    t("Astuce : en annuel, c'est −50 %."),
    "",
    t("Une question ? Écris-nous sur le chat du site, un conseiller Movacash te répond au plus vite."),
    t("Aucun revenu n'est garanti : tes ventes dépendent de ton sujet, de ta fiche Etsy et de ta régularité."),
    "",
    `${t("À bientôt,")}\n${t("L'équipe {app}", { app: APP_NAME })}`,
    "",
    `${t("Tu ne veux plus recevoir ces e-mails ?")} ${desinscription}`,
  ];
  const objet = idee ? (u.name ? t("{prenom}, tes idées d'e-books t'attendent", { prenom: u.name }) : t("Tes idées d'e-books t'attendent")) : t("Ton premier e-book t'attend");
  return sendEmail(u.email, objet, lignes.join("\n"), {
    "List-Unsubscribe": `<${APP_URL}/api/email/desinscription?u=${u.id}&s=${jetonDesinscription(u.id)}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  });
}

// Inscrits depuis 24 h à 7 jours, consentants, sans abonnement, jamais relancés.
export async function envoyerRelances() {
  if (!isEmailConfigured()) return 0;
  const now = Math.floor(Date.now() / 1000);
  const users = await all<User>(
    `SELECT * FROM users WHERE tips_consent = 1 AND relance_at IS NULL AND banned = 0 AND is_demo_sub = 0
       AND stripe_subscription_id IS NULL AND sub_status NOT IN ('active', 'trialing')
       AND created_at <= ? AND created_at > ? ORDER BY created_at LIMIT 50`,
    [now - 24 * H, now - 7 * 24 * H]
  );
  let n = 0;
  for (const u of users) {
    if (isAdmin(u.email)) continue;
    // Réservation atomique : deux instances ne relancent jamais deux fois la même personne
    if (!(await one("UPDATE users SET relance_at = ? WHERE id = ? AND relance_at IS NULL RETURNING id", [now, u.id]))) continue;
    try {
      if (await emailRelance(u)) n++;
    } catch (e) {
      console.error("[relance]", (e as Error).message);
      await run("UPDATE users SET relance_at = NULL WHERE id = ?", [u.id]);
    }
  }
  return n;
}

// Le cron Vercel ne passe qu'une fois par jour : on vérifie aussi, au plus tous les quarts d'heure, pendant les visites du site.
let derniere = 0;
export function relancesSiBesoin() {
  if (Date.now() - derniere < 15 * 60 * 1000) return Promise.resolve(0);
  derniere = Date.now();
  return envoyerRelances().catch((e) => (console.error("[relance]", (e as Error).message), 0));
}
