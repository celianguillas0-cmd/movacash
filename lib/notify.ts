import type { User } from "./auth";
import { APP_NAME, APP_URL, getPlan } from "./config";
import { sendEmail } from "./email";
import { legal } from "./legal";
import { getDict } from "./i18n/server";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./i18n/locales";
import { fmtEur, makeT } from "./i18n/t";

// E-mails liés au contrat, envoyés dans la langue de l'interface au moment du paiement.
// Ils servent de « support durable » exigé par le Code de la consommation (confirmation du contrat,
// confirmation de résiliation, rappel avant reconduction annuelle). Un échec d'envoi ne bloque jamais l'action.

function ctx(user: User) {
  const locale: Locale = isLocale(user.locale) ? user.locale : DEFAULT_LOCALE;
  const t = makeT(getDict(locale));
  const date = (s: number | null) => (s ? new Date(s * 1000).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }) : "—");
  const plan = getPlan(user.plan);
  const price = plan ? t(plan.priceLabel, { prix: fmtEur(plan.priceEur, locale) }) : "";
  const planName = plan ? t(plan.name) : "";
  const hello = user.name ? t("Bonjour {prenom},", { prenom: user.name }) : t("Bonjour,");
  const sign = `\n\n${t("À bientôt,")}\n${t("L'équipe {app}", { app: APP_NAME })}`;
  return { t, date, plan, planName, price, hello, sign };
}

async function send(user: User, subject: string, body: string) {
  try {
    return await sendEmail(user.email, subject, body);
  } catch (e) {
    console.error("[e-mail]", (e as Error).message);
    return false;
  }
}

export async function emailSubscriptionConfirmed(user: User) {
  const { t, plan, planName, price, hello, sign } = ctx(user);
  if (!plan) return;
  const lines = [
    hello,
    "",
    t("Merci pour ta confiance. Voici le récapitulatif de ton abonnement :"),
    `- ${t("Formule : {plan}, {quota}", { plan: planName, quota: t(plan.ebooksLabel, { n: plan.ebooks }) })}`,
    `- ${t("Prix : {prix}, TVA non applicable (art. 293 B du CGI)", { prix: price })}`,
    `- ${t("Renouvellement automatique : {renouvellement}, jusqu'à résiliation", { renouvellement: t(plan.renewLabel) })}`,
    `- ${t("Résiliation à tout moment depuis ton espace, rubrique Abonnement : elle prend effet à la fin de la période payée.")} ${APP_URL}/app/abonnement`,
    "",
    t("Tu as demandé l'accès immédiat au service et reconnu perdre ton droit de rétractation de 14 jours dès la création de ton premier e-book. Tant que tu n'as créé aucun e-book, tu peux encore te rétracter pendant 14 jours en écrivant à {email}.", { email: legal().email || APP_URL }),
    "",
    `${t("Conditions générales de vente")} : ${APP_URL}/cgv`,
    t("Aucun revenu n'est garanti : tes ventes dépendent de ton sujet, de ta fiche Etsy et de ta régularité."),
  ];
  await send(user, t("{app} : ton abonnement {plan} est actif", { app: APP_NAME, plan: planName }), lines.join("\n") + sign);
}

export async function emailCancellationConfirmed(user: User) {
  const { t, date, planName, hello, sign } = ctx(user);
  const lines = [
    hello,
    "",
    t("Nous avons bien reçu ta demande de résiliation le {date}.", { date: date(Math.floor(Date.now() / 1000)) }),
    t("Ton abonnement {plan} prend fin le {fin}. Tu gardes l'accès jusqu'à cette date, puis plus aucun prélèvement n'aura lieu.", { plan: planName, fin: date(user.current_period_end) }),
    t("Tes e-books déjà créés restent consultables et téléchargeables."),
    "",
    `${t("Tu as changé d'avis ? Tu peux réactiver ton abonnement jusqu'au dernier jour :")} ${APP_URL}/app/abonnement`,
  ];
  await send(user, t("{app} : ta résiliation est enregistrée", { app: APP_NAME }), lines.join("\n") + sign);
}

export async function emailRenewalReminder(user: User) {
  const { t, date, plan, planName, price, hello, sign } = ctx(user);
  if (!plan) return false;
  const fin = date(user.current_period_end);
  const lines = [
    hello,
    "",
    t("Ton abonnement {plan} sera renouvelé automatiquement le {date}, pour {prix}.", { plan: planName, date: fin, prix: price }),
    `${t("Si tu ne souhaites pas le renouveler, tu peux le résilier à tout moment avant cette date depuis ton espace, rubrique Abonnement :")} ${APP_URL}/app/abonnement`,
    "",
    t("Cet e-mail t'est envoyé conformément à l'article L215-1 du Code de la consommation."),
  ];
  return send(user, t("{app} : ton abonnement se renouvelle le {date}", { app: APP_NAME, date: fin }), lines.join("\n") + sign);
}
