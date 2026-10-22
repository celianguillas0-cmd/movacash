import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import Footer from "@/components/Footer";
import { countIdeas, listCategories, searchIdeas } from "@/lib/ideas";
import { APP_NAME } from "@/lib/config";

export const dynamic = "force-dynamic";

// Landing minimale et fonctionnelle (le design final sera refait).
export default function Home() {
  const total = countIdeas();
  const cats = listCategories();
  const sample = searchIdeas({ sort: "random", pageSize: 8 }).items;
  return (
    <>
      <PublicNav />
      <main>
        <section className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="badge mb-4 bg-brand-100 text-brand-700">{total} idées de formations prêtes à créer</p>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Créez des e-books de formation de qualité et vendez-les sur Etsy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Choisissez une idée dans notre base, laissez l'IA rédiger un guide complet et structuré, relisez-le, exportez un PDF professionnel et publiez votre fiche Etsy optimisée. Vous fixez votre prix, vous gardez 100 % de vos ventes.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/quiz" className="btn-primary px-6 py-3 text-base">Trouver mon idée (1 min)</Link>
            <Link href="/tarifs" className="btn-secondary px-6 py-3 text-base">Voir les tarifs</Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">Aucun revenu garanti : le résultat dépend de votre travail, de vos sujets et de vos fiches.</p>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-4 md:grid-cols-4">
          {[
            ["1. Trouvez l'idée", `${total} sujets classés en ${cats.length} catégories, avec un potentiel estimé, la concurrence et un prix conseillé.`],
            ["2. Générez l'e-book", "Plan détaillé puis chapitres de 1800 à 2500 mots : méthodes, exemples, exercices, check-lists et plan d'action."],
            ["3. Relisez et exportez", "Modifiez chaque chapitre, choisissez la couverture, exportez en PDF A4, A5 ou Letter."],
            ["4. Publiez sur Etsy", "Titre, 13 tags, description, mention IA obligatoire et vérification de conformité générés pour vous."],
          ].map(([t, d]) => (
            <div key={t} className="card">
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-slate-600">{d}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="h1 mb-6 text-center">Quelques idées de la base</h2>
          <div className="grid gap-3 md:grid-cols-4">
            {sample.map((i) => (
              <div key={i.id} className="card">
                <p className="text-xs text-slate-500">{i.emoji} {i.category_name}</p>
                <p className="mt-1 font-medium">{i.title}</p>
                <p className="mt-2 text-xs text-slate-500">Prix conseillé : {i.price_min}–{i.price_max} €</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4">
          <div className="card">
            <h2 className="text-lg font-semibold">Ce que {APP_NAME} fait, et ne fait pas</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>Il vous fait gagner des heures de rédaction et de mise en page sur des guides réellement utiles.</li>
              <li>Il respecte les règles Etsy : mention de l'IA dans la fiche, avertissements sur les sujets santé et argent, pas de promesse miracle.</li>
              <li>Il ne garantit aucun revenu : vendre demande de bons sujets, de la relecture, des fiches soignées et de la régularité.</li>
              <li>Vous êtes l'auteur : relisez et personnalisez chaque e-book avant de le vendre.</li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
