// Étapes du sondage public, calquées sur le parcours TrendSaaS (relevé du 24/10, voir /mnt/project-files/movacash/funnel-trendsaas/).
// Textes propres à Movacash. Pas de fausse preuve sociale, pas de promesse de gains, pas de garantie de remboursement.

export type Answers = Record<string, string | string[] | number | undefined>;

export type Opt = { id: string; label: string; detail?: string; note?: string };

export type Step = {
  type:
    | "q"
    | "multi"
    | "themes"
    | "preuve"
    | "explication"
    | "url"
    | "echelle"
    | "slider"
    | "chargement"
    | "simulation"
    | "barriere"
    | "message"
    | "compte"
    | "text"
    | "objectif"
    | "parcours"
    | "serment"
    | "formules";
  id: string;
  condition?: (a: Answers) => boolean;
  kicker?: string;
  titre?: string;
  aide?: string;
  options?: Opt[];
  illustrations?: boolean;
  compact?: boolean;
  confirmer?: boolean;
  notesVisibles?: boolean;
  apresChoix?: string;
  libre?: { placeholder: string; label?: string };
  placeholder?: string;
  optional?: boolean;
  max?: number;
  illustration?: "etoile" | "ampoule" | "livre" | "chemin";
  sous?: string;
  cta?: string;
};

export const PRIX_EBOOK = 9;

export const SLIDER = {
  min: 0,
  max: 10000,
  pas: 50,
  defaut: 300,
  paliers: [
    { jusqua: 300, mot: "Premier pas", note: "Un objectif de départ : le bon niveau pour apprendre avec ton premier e-book." },
    { jusqua: 1000, mot: "Motivant", note: "Ça demande en général plusieurs e-books et de la régularité sur Etsy et Pinterest." },
    { jusqua: 3000, mot: "Ambitieux", note: "Ça demande un vrai catalogue et du temps. Vise-le comme une étape, pas comme un point de départ." },
    { jusqua: Infinity, mot: "Très ambitieux", note: "C'est un objectif de long terme, sans aucune garantie. Garde-le en tête, mais commence par le premier palier." },
  ],
};

export const LEVIERS = [
  {
    id: "pinterest",
    question: "Es-tu prêt à publier sur Pinterest ?",
    detail: "Des épingles qui renvoient vers ta fiche Etsy. Pas besoin de montrer ton visage.",
    libelle: "Pinterest",
    action: "Épingler ton e-book sur Pinterest",
  },
  {
    id: "catalogue",
    question: "Es-tu prêt à créer plusieurs e-books ?",
    detail: "Un deuxième ou un troisième guide sur le même thème, pour que chaque acheteur en découvre d'autres.",
    libelle: "Tes autres e-books",
    action: "Créer d'autres e-books sur ton thème",
  },
];

export const TEMPS: Record<string, string> = { "15": "15 minutes", "30": "30 minutes", "60": "1 heure", "120": "2 heures" };

export const ETAPES_CALCUL = ["Lecture de tes réponses", "Ton temps et ton rythme", "Calcul des ventes nécessaires", "Préparation de ton diagnostic"];

export const PARCOURS = [
  { titre: "Tes 3 idées", texte: "Trois sujets choisis dans notre base d'idées à partir de tes réponses." },
  { titre: "Ton e-book", texte: "Movacash écrit le plan, les chapitres et les exemples pour toi." },
  { titre: "Ta couverture et ton PDF", texte: "Une mise en page propre, prête à mettre en vente." },
  { titre: "Ta fiche Etsy", texte: "Titre, description et 13 tags préparés pour ta fiche." },
  { titre: "Ton plan de 30 jours", texte: "Quoi faire chaque semaine pour publier et te faire connaître, à ton rythme." },
];

const debutant = (a: Answers) => a.anciennete === "jamais";

export const STEPS: Step[] = [
  {
    type: "q",
    id: "age",
    kicker: "Pour commencer",
    titre: "Tu as quel âge ?",
    illustrations: true,
    compact: true,
    options: [
      { id: "18-30", label: "18 – 30 ans" },
      { id: "31-60", label: "31 – 60 ans" },
      { id: "60plus", label: "60 ans et plus" },
    ],
  },

  { type: "preuve", id: "preuve" },

  {
    type: "q",
    id: "anciennete",
    kicker: "Ton parcours",
    titre: "As-tu déjà vendu des produits numériques ?",
    options: [
      { id: "jamais", label: "Jamais", note: "C'est le bon moment pour commencer : tu n'as aucune mauvaise habitude à défaire." },
      { id: "debut", label: "Oui, depuis moins d'un an", note: "Tu as déjà fait le plus dur : te lancer. On t'aide à structurer la suite." },
      { id: "experience", label: "Oui, depuis plus d'un an", note: "Tu connais le terrain. On t'aide à produire plus vite, sans baisser la qualité." },
    ],
  },

  { type: "explication", id: "ebook101", condition: debutant },

  {
    type: "q",
    id: "revenus",
    condition: (a) => Boolean(a.anciennete) && !debutant(a),
    kicker: "Où tu en es",
    titre: "Combien te rapportent tes ventes en ligne aujourd'hui ?",
    options: [
      { id: "rien", label: "Rien pour l'instant", note: "Pas de souci, on part de zéro ensemble, avec un premier e-book." },
      { id: "moins100", label: "Moins de 100 € par mois", note: "Des gens ont déjà payé pour ce que tu fais : c'est une bonne base pour continuer." },
      { id: "100-1000", label: "100 à 1 000 € par mois", note: "Tu as une base solide. On t'aide à élargir ton catalogue." },
      { id: "plus1000", label: "Plus de 1 000 € par mois", note: "Tu sais vendre. Movacash t'aide à créer de nouveaux produits plus vite." },
    ],
  },
  {
    type: "q",
    id: "plateformes",
    condition: (a) => Boolean(a.anciennete) && !debutant(a),
    kicker: "Ta présence",
    titre: "Tu vends sur combien de plateformes ?",
    options: [
      { id: "3plus", label: "3 ou plus" },
      { id: "2", label: "2" },
      { id: "1", label: "1" },
      { id: "0", label: "Aucune pour l'instant" },
    ],
  },
  {
    type: "q",
    id: "boutique",
    condition: (a) => Boolean(a.anciennete) && !debutant(a),
    kicker: "Ta vitrine",
    titre: "As-tu déjà une boutique Etsy ?",
    confirmer: true,
    options: [
      { id: "oui", label: "Oui" },
      { id: "non", label: "Pas encore" },
    ],
  },
  {
    type: "url",
    id: "boutiqueUrl",
    condition: (a) => a.boutique === "oui",
    kicker: "Ta boutique",
    titre: "Donne-nous le lien de ta boutique.",
    aide: "On le garde avec ton dossier pour adapter tes conseils.",
    placeholder: "etsy.com/shop/…",
  },

  {
    type: "q",
    id: "reve",
    kicker: "Ce qui te fait avancer",
    titre: "Quel est ton rêve ?",
    libre: { placeholder: "Ex : partir en voyage chaque année…" },
    options: [
      { id: "premiers", label: "Gagner mes premiers euros en ligne" },
      { id: "cote", label: "Avoir un revenu à côté" },
      { id: "liberte", label: "Être plus libre de mon temps" },
      { id: "quitter", label: "Quitter mon travail un jour" },
      { id: "fiers", label: "Rendre mes proches fiers" },
    ],
  },
  {
    type: "q",
    id: "frein",
    kicker: "Ce qui bloque",
    titre: "Qu'est-ce qui t'empêche d'y arriver ?",
    libre: { placeholder: "Ex : personne autour de moi ne fait ça…" },
    options: [
      { id: "methode", label: "Je ne sais pas par où commencer", note: "C'est exactement ce que Movacash règle : un sujet, un e-book, une fiche Etsy, dans le bon ordre." },
      { id: "temps", label: "Je manque de temps", note: "L'IA écrit à ta place. Fini la page blanche." },
      { id: "sujet", label: "Je ne sais pas quoi vendre", note: "On part de tes réponses pour te proposer trois sujets qui te ressemblent." },
      { id: "peur", label: "J'ai peur que ça ne marche pas", note: "C'est normal, et personne ne peut te le garantir. Commence petit, avec un seul e-book, pour voir si ça te plaît." },
    ],
  },
  {
    type: "echelle",
    id: "perseverance",
    kicker: "Ton tempérament",
    titre: "Quand je commence quelque chose, je vais au bout.",
    options: [
      { id: "non-fort", label: "Pas du tout" },
      { id: "non", label: "Plutôt non" },
      { id: "neutre", label: "Je ne sais pas" },
      { id: "oui", label: "Plutôt oui" },
      { id: "oui-fort", label: "Complètement" },
    ],
  },
  {
    type: "q",
    id: "time",
    kicker: "Ton carburant",
    titre: "Combien de temps peux-tu y consacrer par jour ?",
    apresChoix: "Un quart d'heure ou deux heures, ce n'est pas la durée qui compte, c'est la régularité. On adapte ton plan à ton rythme.",
    options: [
      { id: "15", label: "15 minutes" },
      { id: "30", label: "30 minutes" },
      { id: "60", label: "1 heure" },
      { id: "120", label: "2 heures ou plus" },
    ],
  },
  { type: "slider", id: "revenu", kicker: "Ton objectif", titre: "Quel complément de revenu aimerais-tu viser chaque mois ?" },
  { type: "chargement", id: "calcul" },
  { type: "simulation", id: "simulation" },
  { type: "barriere", id: "barriere", condition: (a) => debutant(a) || a.revenus === "rien" || a.boutique === "non" },

  {
    type: "message",
    id: "bienvenue",
    illustration: "etoile",
    kicker: "Bienvenue",
    titre: "Bienvenue dans Movacash.",
    sous: "Des idées d'e-books triées pour toi, un générateur qui écrit avec toi, et tout le kit pour vendre sur Etsy.",
    cta: "Suivant",
  },
  {
    type: "message",
    id: "idees",
    illustration: "ampoule",
    kicker: "L'idée",
    titre: "Trouve ton sujet.",
    sous: "On croise ce que tu connais avec notre base d'idées d'e-books pensées pour Etsy. Ton sujet, c'est la rencontre des deux.",
    cta: "Suivant",
  },
  {
    type: "message",
    id: "ia-ecrit",
    illustration: "livre",
    kicker: "L'écriture",
    titre: "L'IA écrit pour toi.",
    sous: "Plan, chapitres, exemples, couverture et fiche Etsy : tout est préparé pour toi.",
    cta: "Suivant",
  },
  {
    type: "message",
    id: "quotidien",
    illustration: "chemin",
    kicker: "L'objectif",
    titre: "Fais le premier pas.",
    sous: "Un e-book en vente, c'est le début d'un projet à toi. La suite dépend de ton sujet, de ta fiche Etsy et de ta régularité.",
    cta: "Continuer",
  },

  { type: "compte", id: "compte" },

  { type: "themes", id: "themes", kicker: "Ton terrain", titre: "Quelles thématiques t'attirent ?", aide: "Jusqu'à 4 choix.", max: 4, libre: { placeholder: "Ex : la couture, l'apiculture, la photo…", label: "Autre domaine (précise-le)" } },
  {
    type: "multi",
    id: "frustrations",
    kicker: "Ce qui pique",
    titre: "Qu'est-ce qui t'agace le plus aujourd'hui ?",
    libre: { placeholder: "Ex : je tourne en rond…" },
    options: [
      { id: "plafond", label: "Mes revenus n'augmentent pas" },
      { id: "temps", label: "Je n'ai pas de temps pour moi" },
      { id: "autres", label: "Je vois d'autres gens y arriver" },
      { id: "rater", label: "J'ai peur de passer à côté" },
    ],
  },
  {
    type: "q",
    id: "blocage",
    kicker: "Le vrai blocage",
    titre: "Qu'est-ce qui t'a arrêté jusqu'ici ?",
    libre: { placeholder: "Ex : je n'ose pas me lancer seul…" },
    options: [
      { id: "sujet", label: "Trouver le bon sujet" },
      { id: "ecrire", label: "Écrire le contenu" },
      { id: "vendre", label: "Trouver des acheteurs" },
      { id: "finir", label: "Aller au bout" },
    ],
  },
  {
    type: "multi",
    id: "refus",
    kicker: "Tes limites",
    titre: "Qu'est-ce que tu refuses de faire ?",
    aide: "On écartera ce qui ne te ressemble pas.",
    libre: { placeholder: "Ex : parler de ma vie privée…" },
    options: [
      { id: "video", label: "Me montrer en vidéo" },
      { id: "inconnu", label: "Écrire sur un sujet que je ne connais pas" },
      { id: "relire", label: "Passer des heures à écrire" },
      { id: "rien", label: "Rien, je suis prêt à essayer" },
    ],
  },
  {
    type: "q",
    id: "goal",
    kicker: "Ton objectif",
    titre: "Qu'attends-tu en premier ?",
    options: [
      { id: "publier", label: "Mettre mon premier e-book en vente" },
      { id: "sujet", label: "Trouver mon sujet" },
      {
        id: "ventes",
        label: "Faire mes premières ventes",
        note: "On te donne les outils pour publier. Les ventes, personne ne peut te les garantir : elles dépendent du sujet et de ta régularité.",
      },
    ],
  },
  {
    type: "q",
    id: "vie",
    kicker: "La vie derrière l'argent",
    titre: "Et au fond, tu cherches quoi ?",
    libre: { placeholder: "Ex : être plus présent pour mes enfants…" },
    options: [
      { id: "securite", label: "Plus de sécurité" },
      { id: "liberte", label: "Plus de liberté" },
      { id: "fierte", label: "Être fier de ce que je construis" },
      { id: "proches", label: "Plus de temps pour mes proches" },
    ],
  },
  {
    type: "q",
    id: "echeance",
    kicker: "Ton horloge",
    titre: "Quand veux-tu publier ton premier e-book ?",
    options: [
      { id: "aujourdhui", label: "Aujourd'hui", note: "C'est possible : l'e-book et la fiche Etsy sont préparés pour toi." },
      { id: "semaine", label: "Cette semaine" },
      { id: "mois", label: "Ce mois-ci" },
      { id: "tranquille", label: "Je prends mon temps" },
    ],
  },
  {
    type: "q",
    id: "market",
    kicker: "Tes futurs acheteurs",
    titre: "Tu préfères écrire pour qui ?",
    notesVisibles: true,
    options: [
      { id: "particuliers", label: "Des particuliers", note: "Loisirs, maison, famille, bien-être : des guides pratiques du quotidien." },
      { id: "pros", label: "Des professionnels", note: "Métiers, indépendants, petites entreprises : des guides plus techniques." },
    ],
  },
  {
    type: "text",
    id: "dansUnAn",
    kicker: "Dans un an",
    titre: "En une phrase, où aimerais-tu en être dans un an ?",
    aide: "Écris-le comme si c'était déjà vrai.",
    placeholder: "Ex : je vends mes guides sur Etsy et j'ai plus de temps pour moi…",
    optional: true,
  },
  { type: "objectif", id: "objectif" },
  { type: "parcours", id: "parcours" },
  {
    type: "message",
    id: "methode",
    kicker: "Ce qui te sépare de tout ça",
    titre: "Ce qui te manque peut-être, c'est une méthode claire et les bons outils.",
    sous: "Pas besoin d'être écrivain. Il te faut un sujet, un bon outil et de la régularité. Le résultat, lui, dépend de toi.",
    cta: "Voir les formules",
  },
  { type: "serment", id: "serment" },
  { type: "formules", id: "formules" },
];

// Réponses du sondage traduites dans les clés utilisées pour choisir les idées et le plan (lib/ideas.ts, /resultats).
export function scoringAnswers(a: Answers, name?: string) {
  const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]) : []);
  const refus = arr(a.refus);
  return {
    ...a,
    name: name || a.name,
    etsy: a.boutique === "oui" ? "shop" : a.anciennete && a.anciennete !== "jamais" ? "online" : "none",
    writing: refus.includes("relire") ? "hard" : "ok",
    sensitive: "yes",
    refuse: refus.includes("inconnu") ? ["unknown"] : [],
    promo: refus.includes("video") ? (a.pinterest === "non" ? "none" : "faceless") : "face",
    start: a.echeance === "aujourdhui" || a.echeance === "semaine" ? "week" : undefined,
    goal: a.goal === "ventes" ? "side" : a.goal === "publier" ? "build" : "test",
  };
}
