"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/t";

// Menu latéral de l'atelier, dans l'ordre de l'atelier TrendSaaS (sans agent IA, marketing ni vidéo).
const LINKS: [href: string, label: string, icon: string, also?: string[]][] = [
  ["/app", tk("Trouver mon idée"), "M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z", ["/app/idees"]],
  ["/app/mon-idee", tk("Mon idée"), "M6 3h12v18l-6-4-6 4z", ["/app/creer"]],
  ["/app/ebooks", tk("Mes e-books"), "M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5zM4 19a2 2 0 0 1 2-2h12", ["/app/nouveau"]],
  ["/app/abonnement", tk("Abonnement"), "M3 6h18v12H3zM3 10h18"],
  ["/app/parametres", tk("Paramètres"), "M4 7h10M18 7h2M4 17h4M12 17h8M14 4v6M8 14v6"],
  ["/app/support", "Support", "M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z", ["/app/aide", "/app/regles-etsy"]],
];
const ADMIN_LINK: [string, string, string] = ["/app/admin", "Admin", "M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"];

export default function WsNav({ admin = false }: { admin?: boolean }) {
  const path = usePathname();
  const t = useT();
  const active = (href: string, also: string[] = []) =>
    href === "/app" ? path === "/app" || also.some((a) => path.startsWith(a)) : [href, ...also].some((a) => path.startsWith(a));
  return (
    <nav aria-label={t("Sections de l'atelier")}>
      {(admin ? [...LINKS, ADMIN_LINK] : LINKS).map(([href, label, d, also]) => (
        <Link key={href} href={href} className="at-lien" aria-current={active(href, also) ? "page" : undefined}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={d} />
          </svg>
          {t(label)}
        </Link>
      ))}
    </nav>
  );
}
