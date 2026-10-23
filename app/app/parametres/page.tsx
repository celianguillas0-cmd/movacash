import { requireUser } from "@/lib/auth";
import Settings from "./Settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  let quizTone: string | null = null;
  try {
    quizTone = JSON.parse(user.quiz_json || "{}").answers?.tone ?? null;
  } catch {}
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="h1">Paramètres</h1>
        <p className="muted mt-2">Ton profil, tes préférences d'écriture, la sécurité de ton compte et tes données.</p>
      </div>
      <Settings
        user={{
          email: user.email,
          name: user.name,
          author_name: user.author_name,
          default_language: user.default_language,
          default_tone: user.default_tone ?? quizTone,
          email_tips: Boolean(user.email_tips),
          created_at: user.created_at,
          hasSub: ["active", "trialing", "past_due"].includes(user.sub_status),
        }}
      />
    </div>
  );
}
