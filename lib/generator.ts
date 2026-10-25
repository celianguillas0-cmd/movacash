import { geminiGenerate, parseJsonLoose } from "./gemini";
import { isGeminiConfigured } from "./config";
import { LANGUAGES, TONES, SENSITIVE_LABELS, aiDisclosure, type EtsyKit } from "./etsy";

export interface EbookBrief {
  topic: string;
  audience: string;
  language: string;
  tone: string;
  chapters: number;
  sensitive: string | null;
  extras: string;
  format: string;
}

export interface Outline {
  title: string;
  subtitle: string;
  promise: string;
  chapters: { title: string; summary: string; keyPoints: string[] }[];
}

const SYSTEM = `Tu es un auteur et éditeur professionnel de guides pratiques numériques (e-books) vendus sur Etsy.
Ton objectif : produire un contenu réellement utile, concret et actionnable, qui justifie son prix et obtient de bons avis clients.
Règles absolues :
- Pas de remplissage, pas de généralités creuses, pas de répétitions entre chapitres.
- Donne des étapes concrètes, des exemples précis, des chiffres réalistes, des modèles et des exercices.
- N'invente jamais de statistiques, d'études, de citations ou de témoignages. Si tu n'es pas sûr d'un chiffre, présente-le comme un ordre de grandeur indicatif.
- Aucune promesse de résultat garanti (revenus, perte de poids, guérison…). Reste honnête et réaliste.
- Sujets de santé, nutrition, sport : pas de conseil médical, pas de régime extrême, recommande de consulter un professionnel quand c'est pertinent.
- Sujets d'argent : pas de conseil en investissement personnalisé, rappelle les risques.
- Ne présente pas le guide comme affilié à une marque citée.`;

function briefText(b: EbookBrief) {
  return `Sujet : ${b.topic}
Public cible : ${b.audience || "grand public débutant"}
Format : ${b.format || "Guide complet"}
Langue de rédaction : ${LANGUAGES[b.language] || "français"} (tout le contenu doit être dans cette langue)
Ton : ${TONES[b.tone] || TONES.pedagogique}
${b.sensitive ? `Sujet sensible : ${SENSITIVE_LABELS[b.sensitive]} (prudence et avertissements adaptés)` : ""}
${b.extras ? `Consignes de l'auteur : ${b.extras}` : ""}`;
}

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function generateOutline(b: EbookBrief, fake = false): Promise<Outline> {
  if (fake) return pause(3500).then(() => mockOutline(b, true));
  if (!isGeminiConfigured()) return mockOutline(b);
  const prompt = `${briefText(b)}

Conçois le plan détaillé d'un e-book de ${b.chapters} chapitres (introduction et conclusion comprises : le premier chapitre est l'introduction, le dernier est un plan d'action / conclusion).
Le titre doit être accrocheur mais honnête, et le sous-titre doit préciser le bénéfice concret et le public.
Chaque chapitre doit avoir un rôle distinct et faire progresser le lecteur.

Réponds uniquement en JSON avec ce format :
{"title": "...", "subtitle": "...", "promise": "Ce que le lecteur saura faire à la fin (2 phrases)", "chapters": [{"title": "...", "summary": "2-3 phrases sur le contenu", "keyPoints": ["4 à 6 points précis à couvrir"]}]}`;
  const out = parseJsonLoose<Outline>(await geminiGenerate(prompt, { system: SYSTEM, json: true, temperature: 0.9 }));
  if (!out.title || !Array.isArray(out.chapters) || !out.chapters.length) throw new Error("Plan invalide renvoyé par Gemini");
  return out;
}

export async function generateChapter(
  b: EbookBrief,
  outline: Outline,
  index: number,
  fake = false
): Promise<string> {
  const ch = outline.chapters[index];
  if (fake) return pause(2500 + Math.random() * 2000).then(() => mockChapter(b, outline, index, true));
  if (!isGeminiConfigured()) return mockChapter(b, outline, index);
  const toc = outline.chapters.map((c, i) => `${i + 1}. ${c.title} : ${c.summary}`).join("\n");
  const isFirst = index === 0;
  const isLast = index === outline.chapters.length - 1;
  const prompt = `${briefText(b)}

Titre de l'e-book : ${outline.title}
Sous-titre : ${outline.subtitle}
Plan complet (pour éviter les répétitions) :
${toc}

Rédige maintenant intégralement le chapitre ${index + 1} : « ${ch.title} ».
Contenu attendu : ${ch.summary}
Points à couvrir : ${ch.keyPoints.join(" ; ")}

Exigences :
- Longueur : 1800 à 2500 mots.
- Format Markdown simple uniquement : sous-titres avec "## " et "### ", paragraphes, listes "- " ou "1. ", cases à cocher "- [ ] ", gras **...**, encadrés avec "> ". Pas de tableau, pas d'image, pas d'emoji, pas de lien.
- Ne répète pas le titre du chapitre en tête (il est ajouté automatiquement).
- Inclus au moins : un exemple concret détaillé, une méthode pas à pas, ${isLast ? "un plan d'action sur 7 ou 30 jours sous forme de cases à cocher" : "un exercice pratique ou une mini check-list"}, et un encadré "> À retenir : ..." en fin de chapitre.
${isFirst ? "- C'est l'introduction : explique à qui s'adresse le guide, ce qu'il apporte, comment l'utiliser, sans promesse irréaliste." : ""}
${isLast ? "- C'est la conclusion : synthèse, plan d'action, erreurs à éviter et prochaines étapes." : ""}`;
  return (await geminiGenerate(prompt, { system: SYSTEM, temperature: 0.8 })).trim().replace(/^#\s+.*\n/, "");
}

export async function generateEtsyKit(
  b: EbookBrief,
  outline: Outline,
  pages: number,
  fake = false
): Promise<EtsyKit> {
  if (fake) return pause(3000).then(() => mockEtsyKit(b, outline, pages));
  if (!isGeminiConfigured()) return mockEtsyKit(b, outline, pages);
  const prompt = `${briefText(b)}

E-book terminé : « ${outline.title} » — ${outline.subtitle}
Nombre de pages du PDF : environ ${pages}
Chapitres : ${outline.chapters.map((c) => c.title).join(" | ")}

Rédige la fiche produit Etsy optimisée (SEO Etsy) dans la langue de l'e-book.
Contraintes Etsy strictes :
- "title" : 140 caractères maximum, mots-clés importants au début, sans majuscules abusives ni promesse exagérée.
- "tags" : exactement 13 tags, chacun de 20 caractères MAXIMUM, expressions que les acheteurs tapent vraiment, sans doublons.
- "description" : 1200 à 2000 caractères, avec : accroche, à qui s'adresse le guide, ce qu'il contient (liste des chapitres), format (PDF numérique de ${pages} pages, téléchargement immédiat, aucun envoi physique), et une ligne finale qui indique : "${aiDisclosure(b.language)}"${b.sensitive ? ", plus un avertissement indiquant que le guide est informatif et ne remplace pas un professionnel" : ""}. Si une marque est citée, précise que le guide n'est pas affilié à cette marque. Aucune promesse de résultat garanti. Texte brut avec retours à la ligne, sans Markdown.
- "priceSuggestion" : fourchette de prix réaliste en euros avec une justification courte.
- "imageIdeas" : 5 idées d'images de fiche (couverture, aperçu du sommaire, page intérieure, bénéfices, format).
- "category" : catégorie Etsy suggérée.

Réponds uniquement en JSON : {"title": "...", "tags": ["..."], "description": "...", "priceSuggestion": "...", "imageIdeas": ["..."], "category": "..."}`;
  const kit = parseJsonLoose<EtsyKit>(await geminiGenerate(prompt, { system: SYSTEM, json: true, temperature: 0.7 }));
  kit.tags = (kit.tags || []).map((t) => t.trim().slice(0, 20)).filter(Boolean).slice(0, 13);
  kit.title = (kit.title || outline.title).slice(0, 140);
  return kit;
}

// ---------------------------------------------------------------------------
// Mode démo (sans clé Gemini) : contenu structuré d'exemple pour tester tout le parcours.
// ---------------------------------------------------------------------------

function mockOutline(b: EbookBrief, film = false): Outline {
  const n = Math.max(4, b.chapters);
  const middle = [
    "Les bases indispensables",
    "Préparer son environnement et ses outils",
    "La méthode pas à pas",
    "Les erreurs fréquentes et comment les éviter",
    "Passer au niveau supérieur",
    "Études de cas et exemples concrets",
    "Garder la motivation sur la durée",
    "Ressources, modèles et check-lists",
    "Adapter la méthode à sa situation",
    "Mesurer ses progrès",
  ];
  const chapters = [
    { title: "Introduction : comment utiliser ce guide", summary: `Pourquoi ce guide sur « ${b.topic} », à qui il s'adresse et comment en tirer le meilleur.`, keyPoints: ["À qui s'adresse ce guide", "Ce que vous allez apprendre", "Comment l'utiliser"] },
    ...middle.slice(0, n - 2).map((t) => ({ title: t, summary: `${t} appliqués à : ${b.topic}.`, keyPoints: ["Point clé 1", "Point clé 2", "Point clé 3"] })),
    { title: "Votre plan d'action", summary: "Synthèse et plan d'action concret pour passer à la pratique.", keyPoints: ["Synthèse", "Plan sur 30 jours", "Prochaines étapes"] },
  ];
  return {
    title: b.topic,
    subtitle: `Le guide pratique pour ${b.audience ? b.audience.toLowerCase() : "débutants"}`,
    promise: `À la fin de ce guide, vous saurez par où commencer et quelles étapes suivre.${film ? "" : " (Contenu de démonstration : configurez GEMINI_API_KEY pour générer le vrai contenu.)"}`,
    chapters,
  };
}

function mockChapter(b: EbookBrief, o: Outline, i: number, film = false) {
  const ch = o.chapters[i];
  return `${film ? "" : "> **Mode démo** : ce chapitre est un exemple de mise en page. Ajoutez votre clé GEMINI_API_KEY pour générer un vrai contenu de 1800 à 2500 mots par chapitre.\n\n"}Ce chapitre traite de **${ch.title.toLowerCase()}** dans le cadre de « ${b.topic} ». ${ch.summary}

## Pourquoi c'est important

Chaque lecteur arrive avec une situation différente. L'objectif de cette partie est de vous donner des repères clairs, puis une méthode simple que vous pouvez appliquer dès aujourd'hui, sans matériel coûteux ni connaissances préalables.

## La méthode en 4 étapes

1. **Faites le point** sur votre situation de départ et notez-la par écrit.
2. **Fixez un objectif précis**, mesurable et réaliste pour les 30 prochains jours.
3. **Planifiez de courtes sessions** régulières plutôt que de longues sessions rares.
4. **Mesurez et ajustez** chaque semaine en fonction de ce qui fonctionne.

### Exemple concret

Camille, débutante, consacre 20 minutes trois fois par semaine à appliquer cette méthode. Au bout d'un mois, elle sait ce qui lui convient, ce qu'elle doit améliorer, et elle a gagné en régularité.

## Exercice pratique

- [ ] Notez votre point de départ en trois phrases
- [ ] Écrivez votre objectif pour les 30 prochains jours
- [ ] Bloquez trois créneaux dans votre agenda cette semaine
- [ ] Préparez ce dont vous avez besoin pour la première session

> À retenir : la régularité compte plus que l'intensité. Avancez par petites étapes et ajustez en cours de route.
`;
}

function mockEtsyKit(b: EbookBrief, o: Outline, pages: number): EtsyKit {
  const STOP = new Set(["avec", "sans", "pour", "dans", "comme", "votre", "son", "sur", "plus", "moins", "tout", "être", "faire", "une", "des", "les"]);
  const base = b.topic.toLowerCase().split(/[\s:,'’]+/).filter((w) => w.length > 3 && !STOP.has(w)).slice(0, 4);
  const tags = Array.from(
    new Set(["ebook pdf", "guide pdf", "guide débutant", "téléchargement", "printable", "cadeau numérique", ...base.map((w) => `${w} guide`), "planner", "workbook", "méthode simple", "formation pdf", "checklist"])
  )
    .map((t) => t.slice(0, 20))
    .slice(0, 13);
  return {
    title: `${o.title} | Guide PDF ${pages} pages | E-book débutant à télécharger`.slice(0, 140),
    tags,
    description: `${o.title} — ${o.subtitle}

Ce guide pratique s'adresse à : ${b.audience || "tous les débutants"}.

CE QUE CONTIENT LE GUIDE
${o.chapters.map((c, i) => `${i + 1}. ${c.title}`).join("\n")}

FORMAT
- E-book PDF numérique de ${pages} pages
- Téléchargement immédiat après l'achat, aucun envoi physique
- Lisible sur ordinateur, tablette et smartphone, imprimable

${b.sensitive ? "Ce guide est informatif et ne remplace pas l'avis d'un professionnel.\n\n" : ""}${aiDisclosure(b.language)}

(Fiche de démonstration : configurez GEMINI_API_KEY pour une fiche optimisée.)`,
    priceSuggestion: "5 à 9 € selon la longueur finale et vos personnalisations",
    imageIdeas: ["Couverture en grand", "Aperçu du sommaire", "Double page intérieure", "Liste des bénéfices", "Format et nombre de pages"],
    category: "Livres, films et musique > Livres > E-books",
  };
}
