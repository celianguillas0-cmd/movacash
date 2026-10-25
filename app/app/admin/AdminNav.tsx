import Link from "next/link";

// Onglets internes de l'Admin
export default function AdminNav({ current }: { current: "vue" | "comptes" }) {
  const l = (href: string, label: string, on: boolean) => (
    <Link href={href} className={`rounded-full px-4 py-1.5 text-sm ${on ? "bg-slate-300 font-semibold text-slate-900" : "text-slate-600"}`} aria-current={on ? "page" : undefined}>{label}</Link>
  );
  return (
    <div className="flex w-fit gap-1 rounded-full border border-slate-300 bg-slate-100 p-1" role="navigation" aria-label="Admin">
      {l("/app/admin", "Vue d'ensemble", current === "vue")}
      {l("/app/admin/comptes", "Comptes", current === "comptes")}
    </div>
  );
}
