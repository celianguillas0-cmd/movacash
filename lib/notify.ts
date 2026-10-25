import type { User } from "./auth";
import { APP_NAME, APP_URL, PLANS } from "./config";
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
  const plan = PLANS.find((p) => p.id === user.plan);
  const annual = user.billing_interval === "year";
  const price = plan ? fmtEur(annual ? Math.round(plan.annualMonthlyEur * 1200) / 100 : plan.priceEur, locale) : "";
  const hello = user.name ? t("Bonjour {prenom},", { prenom: user.name }) : t("Bonjour,");
  const sign = `\n\n${t("À bientôt,")}\n${t("L'équipe {app}", { app: APP_NAME })}`;
  return { t, date, plan, annual, price, hello, sign };
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
  const { t, plan, annual, price, hello, sign } = ctx(user);
  if (!plan) return;
  const lines = [
    hello,
    "",
    t("Merci pour ta confiance. Voici le récapitulatif de ton abonnement :"),
    `- ${t("Formule : {plan}, {n} e-books par mois", { plan: plan.name, n: plan.ebooksPerMonth })}`,
    `- ${annual ? t("Prix : {prix} par an, TVA non applicable (art. 293 B du CGI)", { prix: price }) : t("Prix : {prix} par mois, TVA non applicable (art. 293 B du CGI)", { prix: price })}`,
    `- ${annual ? t("Renouvellement automatique chaque année, jusqu'à résiliation") : t("Renouvellement automatique chaque mois, jusqu'à résiliation")}`,
    `- ${t("Résiliation à tout moment depuis ton espace, rubrique Abonnement : elle prend effet à la fin de la période payée.")} ${APP_URL}/app/abonnement`,
    "",
    t("Tu as demandé l'accès immédiat au service et reconnu perdre ton droit de rétractation de 14 jours dès la création de ton premier e-book. Tant que tu n'as créé aucun e-book, tu peux encore te rétracter pendant 14 jours en écrivant à {email}.", { email: legal().email || APP_URL }),
    "",
    `${t("Conditions générales de vente")} : ${APP_URL}/cgv`,
    t("Aucun revenu n'est garanti : tes ventes dépendent de ton sujet, de ta fiche Etsy et de ta régularité."),
  ];
  await send(user, t("{app} : ton abonnement {plan} est actif", { app: APP_NAME, plan: plan.name }), lines.join("\n") + sign);
}

export async function emailCancellationConfirmed(user: User) {
  const { t, date, plan, hello, sign } = ctx(user);
  const lines = [
    hello,
    "",
    t("Nous avons bien reçu ta demande de résiliation le {date}.", { date: date(Math.floor(Date.now() / 1000)) }),
    t("Ton abonnement {plan} prend fin le {fin}. Tu gardes l'accès jusqu'à cette date, puis plus aucun prélèvement n'aura lieu.", { plan: plan?.name || "", fin: date(user.current_period_end) }),
    t("Tes e-books déjà créés restent consultables et téléchargeables."),
    "",
    `${t("Tu as changé d'avis ? Tu peux réactiver ton abonnement jusqu'au dernier jour :")} ${APP_URL}/app/abonnement`,
  ];
  await send(user, t("{app} : ta résiliation est enregistrée", { app: APP_NAME }), lines.join("\n") + sign);
}

export async function emailRenewalReminder(user: User) {
  const { t, date, plan, price, hello, sign } = ctx(user);
  if (!plan) return false;
  const fin = date(user.current_period_end);
  const lines = [
    hello,
    "",
    t("Ton abonnement annuel {plan} sera renouvelé automatiquement le {date}, pour {prix}.", { plan: plan.name, date: fin, prix: price }),
    `${t("Si tu ne souhaites pas le renouveler, tu peux le résilier à tout moment avant cette date depuis ton espace, rubrique Abonnement :")} ${APP_URL}/app/abonnement`,
    "",
    t("Cet e-mail t'est envoyé conformément à l'article L215-1 du Code de la consommation."),
  ];
  return send(user, t("{app} : ton abonnement annuel se renouvelle le {date}", { app: APP_NAME, date: fin }), lines.join("\n") + sign);
}
