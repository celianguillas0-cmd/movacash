import IdeasBrowser from "./IdeasBrowser";
import { countIdeas, listCategories } from "@/lib/ideas";

export default async function IdeasPage() {
  const [total, categories] = await Promise.all([countIdeas(), listCategories()]);
  return (
    <div>
      <p className="eyebrow-ws">Base d'idées</p>
      <h1 className="h1 mt-2">Idées de formations</h1>
      <p className="muted mt-2 max-w-3xl">
        {total} sujets classés par catégorie. Le potentiel et la concurrence sont des estimations éditoriales indicatives : vérifie toujours la demande en tapant le sujet dans la recherche Etsy avant de te lancer.
      </p>
      <IdeasBrowser categories={categories} />
    </div>
  );
}
