// Questions du sondage (module sans dépendance serveur, utilisé par le sondage et la page de résultats).
// Version courte (MAJ 23/10) : seulement les questions qui changent les idées proposées ou le plan de 30 jours.

export type Opt = [value: string, label: string, sub?: string];
export type Question = {
  k: string;
  s: string; // chapitre du sondage
  t: string;
  h?: string;
  type?: "text" | "multi" | "themes";
  ph?: string;
  max?: number;
  optional?: boolean;
  o?: Opt[];
  // Variante du libellé selon la réponse à une question précédente (ex. le métier selon la situation)
  dep?: string;
  hideIf?: string[]; // valeurs de « dep » pour lesquelles la question n'est pas posée
  v?: Record<string, { t?: string; h?: string; ph?: string }>;
};

export const SECTIONS = ["Toi", "Ton niveau", "Ton terrain", "Ton style"];

export const QUESTIONS: Question[] = [
  // Toi
  { k: "name", s: "Toi", type: "text", t: "Comment tu t'appelles ?", h: "On s'en sert pour personnaliser ton plan.", ph: "Ton prénom" },
  { k: "situation", s: "Toi", t: "Quelle est ta situation aujourd'hui ?", o: [["employed", "Salarié(e)", "Je cherche une activité à côté"], ["student", "Étudiant(e)"], ["parent", "Parent au foyer"], ["freelance", "Indépendant(e) ou freelance"], ["searching", "En recherche d'emploi"], ["retired", "Retraité(e)"]] },
  {
    k: "job", s: "Toi", type: "text", optional: true, dep: "situation", hideIf: ["student"],
    t: "Quel est ton métier ?", h: "Ton métier est souvent ton meilleur sujet : tu connais déjà le public et ses problèmes.", ph: "Ex. aide-soignante, commercial, prof de sport…",
    v: {
      parent: { t: "Quel métier faisais-tu avant ?", h: "Ton ancien métier, ou ton quotidien de parent, peut devenir ton meilleur sujet.", ph: "Ex. assistante RH, coiffeuse, ou « parent à plein temps »" },
      freelance: { t: "Quelle est ton activité ?", ph: "Ex. graphiste, coach sportif, photographe…" },
      searching: { t: "Quel était ton dernier métier ?", h: "Ton expérience passée est souvent ton meilleur sujet.", ph: "Ex. vendeuse, logisticien, secrétaire…" },
      retired: { t: "Quel était ton métier ?", h: "Des années d'expérience, c'est un sujet que peu de gens peuvent écrire.", ph: "Ex. infirmière, artisan, comptable…" },
    },
  },
  { k: "time", s: "Toi", t: "Combien de temps peux-tu y consacrer par jour ?", o: [["15", "15 minutes"], ["30", "30 minutes"], ["60", "1 heure"], ["120", "Plus de 2 heures"]] },
  { k: "goal", s: "Toi", t: "Qu'est-ce que tu veux construire ?", o: [["side", "Un revenu d'appoint", "Quelques ventes par mois"], ["build", "Une vraie boutique", "Une activité qui grandit sur plusieurs mois"], ["test", "Juste tester", "Voir si la vente de produits numériques me plaît"]] },

  // Ton niveau
  { k: "etsy", s: "Ton niveau", t: "Où en es-tu avec la vente en ligne ?", o: [["none", "Je n'ai jamais vendu en ligne"], ["online", "J'ai déjà vendu ailleurs", "Vinted, Leboncoin, eBay…"], ["shop", "J'ai déjà une boutique Etsy"]] },
  { k: "writing", s: "Ton niveau", t: "Relire et corriger un texte, pour toi c'est…", h: "L'IA rédige, mais la relecture fait la qualité de ton e-book.", o: [["easy", "Facile, j'aime ça"], ["ok", "Faisable, sans plus"], ["hard", "Difficile", "On te proposera des sujets plus simples à relire"]] },
  { k: "sensitive", s: "Ton niveau", t: "Les sujets santé, minceur ou argent, ça te va ?", h: "Ils se vendent bien, mais demandent plus de prudence et d'avertissements.", o: [["yes", "Oui, avec les bons avertissements"], ["no", "Je préfère les éviter"]] },
  { k: "promo", s: "Ton niveau", t: "Faire connaître tes e-books sur les réseaux, c'est…", o: [["face", "OK, même face caméra"], ["faceless", "OK, mais sans montrer mon visage", "Pinterest, carrousels, vidéos sans visage"], ["none", "Non, seulement Etsy"]] },

  // Ton terrain
  { k: "themes", s: "Ton terrain", type: "themes", max: 4, t: "Quelles thématiques t'attirent ?", h: "Jusqu'à 4 choix." },
  { k: "passion", s: "Ton terrain", type: "text", optional: true, t: "Une passion, ou un sujet sur lequel on te demande souvent conseil ?", h: "C'est souvent là que se cache ton meilleur angle.", ph: "Ex. jardinage, Vinted, musculation, crochet…" },

  // Ton style
  { k: "format", s: "Ton style", t: "Ton e-book idéal ressemble à…", o: [["guide", "Un guide pas à pas"], ["program", "Un programme jour par jour"], ["printables", "Des check-lists et pages à imprimer"], ["collection", "Un recueil d'idées ou de recettes"]] },
  { k: "tone", s: "Ton style", t: "Quel ton te ressemble ?", o: [["pedagogique", "Pédagogue et bienveillant"], ["motivant", "Motivant, orienté action"], ["expert", "Expert et précis"], ["convivial", "Convivial, comme un ami"]] },
];

// Libellé effectif d'une question, compte tenu des réponses déjà données.
export function resolve(q: Question, answers: Record<string, unknown>): Question {
  const key = q.dep ? answers[q.dep] : undefined;
  const v = typeof key === "string" ? q.v?.[key] : undefined;
  return v ? { ...q, ...v } : q;
}

export const isAsked = (q: Question, answers: Record<string, unknown>) => !(q.dep && q.hideIf?.includes(String(answers[q.dep])));

// Prochaine (ou précédente) question réellement posée ; -1 ou QUESTIONS.length si aucune.
export function stepFrom(i: number, dir: 1 | -1, answers: Record<string, unknown>) {
  let j = i + dir;
  while (j >= 0 && j < QUESTIONS.length && !isAsked(QUESTIONS[j], answers)) j += dir;
  return j;
}

export const label = (k: string, v: string) => QUESTIONS.find((q) => q.k === k)?.o?.find((o) => o[0] === v)?.[1] ?? v;
