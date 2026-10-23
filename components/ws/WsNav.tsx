"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS: [href: string, label: string, icon: string][] = [
  ["/app", "Tableau de bord", "M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10"],
  ["/app/idees", "Idées", "M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"],
  ["/app/nouveau", "Nouvel e-book", "M12 5v14M5 12h14"],
  ["/app/ebooks", "Mes e-books", "M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5zM4 19a2 2 0 0 1 2-2h12"],
  ["/app/regles-etsy", "Guide Etsy", "M4 6h16M4 12h16M4 18h10"],
  ["/app/abonnement", "Abonnement", "M3 7h18v10H3zM3 11h18"],
  ["/app/parametres", "Paramètres", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"],
  ["/app/aide", "Aide", "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"],
];

export default function WsNav() {
  const path = usePathname();
  const active = (href: string) => (href === "/app" ? path === "/app" : path.startsWith(href));
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none] md:flex-col md:overflow-visible md:pb-0">
      {LINKS.map(([href, label, d]) => (
        <Link
          key={href}
          href={href}
          aria-current={active(href) ? "page" : undefined}
          className={`flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition ${
            active(href) ? "bg-brand-50 font-semibold text-brand-700 ring-1 ring-brand-100" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <svg viewBox="0 0 24 24" className="hidden h-[18px] w-[18px] shrink-0 md:block" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={d} />
          </svg>
          {label}
        </Link>
      ))}
    </nav>
  );
}
