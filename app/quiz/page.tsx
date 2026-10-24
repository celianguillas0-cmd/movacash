import FunnelNav from "@/components/funnel/FunnelNav";
import Survey from "./Survey";
import { countIdeas, listCategories } from "@/lib/ideas";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function QuizPage() {
  const [user, categories, total] = await Promise.all([getCurrentUser(), listCategories(), countIdeas()]);
  return (
    <div className="mc dark has-photo">
      <div className="page-photo" aria-hidden="true" />
      <FunnelNav minimal />
      <Survey categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} total={total} loggedIn={Boolean(user)} />
    </div>
  );
}
