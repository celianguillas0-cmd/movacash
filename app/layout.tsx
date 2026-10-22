import type { Metadata } from "next";
import "./globals.css";
import { APP_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: `${APP_NAME} — Créez des e-books de qualité à vendre sur Etsy`,
  description: "Trouvez une idée de formation, générez un e-book complet avec l'IA, exportez un PDF prêt à vendre et la fiche Etsy qui va avec.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
