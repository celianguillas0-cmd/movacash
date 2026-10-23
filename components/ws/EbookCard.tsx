import Link from "next/link";
import CoverThumb from "@/components/CoverThumb";
import type { EbookListItem } from "@/lib/ebooks";

export default function EbookCard({ e }: { e: EbookListItem }) {
  const pct = e.chapters_total ? Math.round((e.chapters_done / e.chapters_total) * 100) : 0;
  return (
    <Link href={`/app/ebooks/${e.id}`} className="card group block p-3 transition hover:border-brand-100">
      <CoverThumb title={e.title} cover={JSON.parse(e.cover_json)} />
      <p className="mt-3 line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-brand-700">{e.title}</p>
      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
        {e.status === "ready" ? (
          <span className="badge bg-green-100 text-green-800">Prêt</span>
        ) : (
          <span className="badge bg-brand-50 text-brand-700">{e.chapters_done}/{e.chapters_total} chapitres · {pct} %</span>
        )}
        {e.is_demo ? <span>démo</span> : null}
        <span className="ml-auto">{new Date(e.created_at * 1000).toLocaleDateString("fr-FR")}</span>
      </div>
    </Link>
  );
}
