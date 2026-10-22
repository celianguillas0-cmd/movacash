import Link from "next/link";
import { APP_NAME } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500">
        <p className="mb-3 max-w-3xl text-xs">
          {APP_NAME} est un outil d'aide à la création de contenu. Les revenus que vous pourriez tirer de la vente de vos e-books dépendent de nombreux facteurs (choix du sujet, qualité, travail de relecture, fiche produit, concurrence, promotion) et ne sont en aucun cas garantis.
          {APP_NAME} n'est ni affilié à Etsy, ni approuvé par Etsy.
        </p>
        <div className="flex flex-wrap gap-4">
          <span>© {new Date().getFullYear()} {APP_NAME}</span>
          <Link href="/cgv">CGV</Link>
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/confidentialite">Confidentialité</Link>
          <Link href="/avertissement-revenus">Avertissement sur les revenus</Link>
        </div>
      </div>
    </footer>
  );
}
