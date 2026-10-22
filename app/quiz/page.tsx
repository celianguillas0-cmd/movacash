import PublicNav from "@/components/PublicNav";
import Quiz from "./Quiz";
import { countIdeas, listCategories } from "@/lib/ideas";

export const dynamic = "force-dynamic";

export default function QuizPage() {
  return (
    <>
      <PublicNav />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Quiz categories={listCategories()} total={countIdeas()} />
      </main>
    </>
  );
}
