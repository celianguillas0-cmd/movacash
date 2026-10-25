import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listEbooks } from "@/lib/ebooks";
import EbookCard from "@/components/ws/EbookCard";
import AtHead from "@/components/ws/AtHead";

export default async function MyEbooks() {
  const user = await requireUser();
  const ebooks = await listEbooks(user.id);
  return (
    <div className="space-y-6">
      <AtHead name={user.name} title="Tes e-books.">
        <p className="at-dim" style={{ marginTop: 10 }}>{ebooks.length} e-book{ebooks.length > 1 ? "s" : ""}. Ils restent à toi, même si tu arrêtes ton abonnement.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
          <Link href="/app" className="at-btn">+ Nouvel e-book</Link>
          <Link href="/app/nouveau" className="at-btn at-btn-sec">Sur un sujet libre</Link>
        </div>
      </AtHead>
      {ebooks.length === 0 ? (
        <div className="at-carte"><p>Aucun e-book pour l&apos;instant. Commence par trouver ton idée, ton premier e-book se crée en quelques questions.</p></div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {ebooks.map((e) => <EbookCard key={e.id} e={e} />)}
        </div>
      )}
    </div>
  );
}
