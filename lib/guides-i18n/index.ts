// Fichier généré par scripts/guides-index.mjs : ne pas modifier à la main.
import type { GuideText } from "../guides";
import type { GuideUI } from "@/app/guides/ui";
import type { Locale } from "../i18n/locales";
import de from "./de.json";
import es from "./es.json";
import it from "./it.json";
import nl from "./nl.json";
import pl from "./pl.json";
import pt from "./pt.json";

type Fichier = { ui: GuideUI; guides: Record<string, GuideText> };
// Les JSON ont la même forme que la version anglaise (vérifiée avant chaque ajout) ; TypeScript ne sait pas typer les paires de la FAQ.
export const TRADUCTIONS: Partial<Record<Locale, Fichier>> = { de: de as unknown as Fichier, es: es as unknown as Fichier, it: it as unknown as Fichier, nl: nl as unknown as Fichier, pl: pl as unknown as Fichier, pt: pt as unknown as Fichier };
