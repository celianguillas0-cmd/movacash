// Questions du sondage (module sans dépendance serveur, utilisé par le sondage et la page de résultats).
// Même base que le funnel TrendSaaS (situation, temps, niveau, refus, terrain, forces, vie visée), adaptée aux e-books Etsy.

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
};

export const SECTIONS = ["Toi", "Ton temps", "Ton niveau", "Ce que tu refuses", "Ton terrain", "Ta force", "La vie que tu vises"];

export const QUESTIONS: Question[] = [
  // Toi
  { k: "name", s: "Toi", type: "text", t: "Comment tu t'appelles ?", h: "On s'en sert pour personnaliser ton plan.", ph: "Ton prénom" },
  { k: "age", s: "Toi", t: "Quel âge as-tu ?", o: [["18", "18 à 24 ans"], ["25", "25 à 34 ans"], ["35", "35 à 44 ans"], ["45", "45 à 54 ans"], ["55", "55 ans et plus"]] },
  { k: "situation", s: "Toi", t: "Quelle est ta situation aujourd'hui ?", o: [["employed", "Salarié(e)", "Je cherche une activité à côté"], ["student", "Étudiant(e)"], ["parent", "Parent au foyer"], ["freelance", "Indépendant(e) ou freelance"], ["searching", "En recherche d'emploi"], ["retired", "Retraité(e)"]] },
  { k: "job", s: "Toi", type: "text", optional: true, t: "Quel est (ou était) ton métier ?", h: "Ton métier est souvent ton meilleur sujet : tu connais déjà le public et ses problèmes.", ph: "Ex. aide-soignante, commercial, prof de sport…" },

  // Ton temps
  { k: "time", s: "Ton temps", t: "Combien d'heures peux-tu y consacrer par semaine ?", o: [["2", "Moins de 2 heures"], ["5", "2 à 5 heures"], ["10", "5 à 10 heures"], ["15", "Plus de 10 heures"]] },
  { k: "when", s: "Ton temps", t: "Quand est-ce que tu as ce temps ?", o: [["evenings", "Le soir en semaine"], ["weekend", "Le week-end"], ["day", "En journée"], ["random", "C'est irrégulier"]] },
  { k: "start", s: "Ton temps", t: "Quand veux-tu publier ton premier e-book ?", o: [["week", "Cette semaine"], ["month", "Dans le mois"], ["later", "Je ne suis pas pressé(e)"]] },
  { k: "patience", s: "Ton temps", t: "Combien de temps peux-tu tenir avant tes premières ventes ?", h: "Sur Etsy, beaucoup de boutiques mettent plusieurs semaines à décoller. Ta réponse sert à te donner un plan réaliste.", o: [["weeks", "Quelques semaines"], ["months", "2 à 3 mois"], ["long", "6 mois ou plus", "Je construis sur la durée"]] },

  // Ton niveau
  { k: "etsy", s: "Ton niveau", t: "Où en es-tu avec la vente en ligne ?", o: [["none", "Je n'ai jamais vendu en ligne"], ["online", "J'ai déjà vendu ailleurs", "Vinted, Leboncoin, eBay…"], ["shop", "J'ai déjà une boutique Etsy"]] },
  { k: "tools", s: "Ton niveau", t: "Avec les outils en ligne (Canva, Google Docs…), tu es…", o: [["zero", "Je pars de zéro"], ["basic", "À l'aise pour l'essentiel"], ["pro", "Très à l'aise"]] },
  { k: "ai", s: "Ton niveau", t: "Tu utilises déjà l'IA (ChatGPT, Gemini…) ?", o: [["never", "Jamais"], ["sometimes", "De temps en temps"], ["daily", "Tous les jours"]] },
  { k: "writing", s: "Ton niveau", t: "Relire et corriger un texte, pour toi c'est…", h: "L'IA rédige, mais la relecture fait la qualité de ton e-book.", o: [["easy", "Facile, j'aime ça"], ["ok", "Faisable, sans plus"], ["hard", "Difficile", "On te proposera des sujets plus simples à relire"]] },
  { k: "lang", s: "Ton niveau", t: "Dans quelle langue veux-tu vendre ?", o: [["fr", "Français"], ["en", "Anglais", "Marché plus large, plus de concurrence"], ["both", "Les deux"]] },

  // Ce que tu refuses
  { k: "sensitive", s: "Ce que tu refuses", t: "Les sujets santé, minceur ou argent, ça te va ?", h: "Ils se vendent bien, mais demandent plus de prudence et d'avertissements.", o: [["yes", "Oui, avec les bons avertissements"], ["no", "Je préfère les éviter"]] },
  { k: "promo", s: "Ce que tu refuses", t: "Faire connaître tes e-books sur les réseaux, c'est…", o: [["face", "OK, même face caméra"], ["faceless", "OK, mais sans montrer mon visage", "Pinterest, carrousels, vidéos sans visage"], ["none", "Non, seulement Etsy"]] },
  { k: "ads", s: "Ce que tu refuses", t: "Payer de la publicité ?", o: [["no", "Non, zéro budget"], ["small", "Un petit budget", "Moins de 50 € par mois"], ["yes", "Oui, si ça marche"]] },
  { k: "refuse", s: "Ce que tu refuses", type: "multi", optional: true, max: 4, t: "Qu'est-ce que tu refuses de faire ?", h: "Plusieurs choix possibles. On écarte ce qui ne te correspond pas.", o: [["unknown", "Écrire sur un sujet que je ne connais pas"], ["design", "Passer des heures sur le design"], ["support", "Répondre à des clients tous les jours"], ["trend", "Courir après les tendances"]] },

  // Ton terrain
  { k: "themes", s: "Ton terrain", type: "themes", max: 4, t: "Quelles thématiques t'attirent ?", h: "Jusqu'à 4 choix." },
  { k: "audience", s: "Ton terrain", type: "multi", optional: true, max: 3, t: "Quel public connais-tu bien ?", h: "Jusqu'à 3 choix. On vend mieux à des gens qu'on comprend.", o: [["parents", "Les parents"], ["students", "Les étudiants"], ["sport", "Les sportifs"], ["workers", "Les salariés pressés"], ["entrepreneurs", "Les entrepreneurs et créateurs"], ["seniors", "Les seniors"], ["pets", "Les propriétaires d'animaux"], ["beginners", "Les débutants complets"]] },
  { k: "passion", s: "Ton terrain", type: "text", optional: true, t: "Une passion ou un domaine où tu t'y connais vraiment ?", ph: "Ex. jardinage, Vinted, musculation, crochet…" },
  { k: "advice", s: "Ton terrain", type: "text", optional: true, t: "Sur quoi tes proches te demandent-ils conseil ?", h: "C'est souvent là que se cache ton meilleur angle.", ph: "Ex. budget, cuisine, organisation…" },

  // Ta force
  { k: "strengths", s: "Ta force", type: "multi", max: 2, t: "Quelles sont tes deux plus grandes forces ?", h: "Deux choix.", o: [["teach", "J'explique bien"], ["organized", "Je suis organisé(e)"], ["creative", "Je suis créatif(ve)"], ["persistent", "Je suis persévérant(e)"], ["numbers", "Je suis à l'aise avec les chiffres"], ["social", "Je sais parler aux gens"]] },
  { k: "format", s: "Ta force", t: "Ton e-book idéal ressemble à…", o: [["guide", "Un guide pas à pas"], ["program", "Un programme jour par jour"], ["printables", "Des check-lists et pages à imprimer"], ["collection", "Un recueil d'idées ou de recettes"]] },
  { k: "tone", s: "Ta force", t: "Quel ton te ressemble ?", o: [["pedagogique", "Pédagogue et bienveillant"], ["motivant", "Motivant, orienté action"], ["expert", "Expert et précis"], ["convivial", "Convivial, comme un ami"]] },

  // La vie que tu vises
  { k: "goal", s: "La vie que tu vises", t: "Qu'est-ce que tu veux construire ?", o: [["side", "Un revenu d'appoint", "Quelques ventes par mois"], ["build", "Une vraie boutique", "Une activité qui grandit sur plusieurs mois"], ["test", "Juste tester", "Voir si la vente de produits numériques me plaît"]] },
  { k: "why", s: "La vie que tu vises", t: "Si ça marche, qu'est-ce que ça changerait pour toi ?", h: "Aucun revenu n'est garanti. Ta réponse nous aide seulement à te proposer le bon rythme.", o: [["save", "Mettre de côté chaque mois"], ["treat", "Me faire plaisir sans culpabiliser"], ["less", "Travailler un peu moins"], ["free", "Avoir une activité à moi"], ["learn", "Apprendre quelque chose de nouveau"]] },
];

export const label = (k: string, v: string) => QUESTIONS.find((q) => q.k === k)?.o?.find((o) => o[0] === v)?.[1] ?? v;
