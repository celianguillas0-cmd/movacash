import { APP_NAME } from "./config";

// Envoi d'e-mails transactionnels via l'API Resend (https://resend.com), sans dépendance.
// Variables : RESEND_API_KEY et EMAIL_FROM (ex. « Movacash <bonjour@ton-domaine.fr> », domaine vérifié chez Resend).
export const isEmailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

export async function sendEmail(to: string, subject: string, text: string, headers?: Record<string, string>) {
  if (!isEmailConfigured()) {
    console.log(`[e-mail non envoyé, RESEND_API_KEY absent] À : ${to}\nObjet : ${subject}\n${text}`);
    return false;
  }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, text, ...(headers ? { headers } : {}) }),
  });
  if (!r.ok) throw new Error(`Envoi de l'e-mail impossible (${r.status})`);
  return true;
}

export const signature = `\n\nÀ bientôt,\nL'équipe ${APP_NAME}`;
