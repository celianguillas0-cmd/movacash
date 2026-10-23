// Jauge du quota mensuel d'e-books
export default function QuotaMeter({ used, limit, compact }: { used: number; limit: number; compact?: boolean }) {
  const pct = limit ? Math.min(100, (used / limit) * 100) : 0;
  return (
    <div>
      <div className={`flex items-baseline justify-between ${compact ? "text-xs" : "text-sm"}`}>
        <span className="text-slate-600">E-books ce mois-ci</span>
        <span className="font-semibold text-slate-900">{used} / {limit}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${pct >= 100 ? "bg-red-400" : "bg-brand-600"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
