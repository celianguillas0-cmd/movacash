import IdeasBrowser from "./IdeasBrowser";
import { countIdeas, listCategories } from "@/lib/ideas";

export default function IdeasPage() {
  return (
    <div>
      <h1 className="h1">Idées de formations</h1>
      <p className="muted mt-1">
        {countIdeas()} sujets classés par catégorie. Le potentiel et la concurrence sont des estimations éditoriales indicatives : vérifiez toujours la demande en tapant le sujet dans la recherche Etsy avant de vous lancer.
      </p>
      <IdeasBrowser categories={listCategories()} />
    </div>
  );
}
