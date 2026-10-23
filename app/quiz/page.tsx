import FunnelNav from "@/components/funnel/FunnelNav";
import Survey from "./Survey";
import { countIdeas, listCategories } from "@/lib/ideas";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function QuizPage() {
  const user = await getCurrentUser();
  return (
    <div className="mc has-photo">
      <div className="page-photo" aria-hidden="true" />
      <FunnelNav />
      <Survey categories={listCategories().map((c) => ({ slug: c.slug, name: c.name }))} total={countIdeas()} loggedIn={Boolean(user)} />
    </div>
  );
}
