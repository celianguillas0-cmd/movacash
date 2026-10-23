import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listEbooks } from "@/lib/ebooks";
import EbookCard from "@/components/ws/EbookCard";

export default async function MyEbooks() {
  const user = await requireUser();
  const ebooks = await listEbooks(user.id);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h1">Mes e-books</h1>
          <p className="muted mt-2">{ebooks.length} e-book{ebooks.length > 1 ? "s" : ""}. Ils restent à toi, même si tu arrêtes ton abonnement.</p>
        </div>
        <Link href="/app/nouveau" className="btn-primary">+ Nouvel e-book</Link>
      </div>
      {ebooks.length === 0 ? (
        <div className="card text-sm text-slate-600">Aucun e-book pour l'instant.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {ebooks.map((e) => <EbookCard key={e.id} e={e} />)}
        </div>
      )}
    </div>
  );
}
