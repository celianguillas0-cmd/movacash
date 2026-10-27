// Guides publics (référencement) : de vrais articles utiles, en français et en anglais.
// Règles de rédaction : aucune promesse de revenus, chiffres Etsy vérifiables, conseils concrets.
// Les autres langues du site affichent la version anglaise (canonique : ?lang=en).

export type Section = { h: string; p?: string[]; ul?: string[] };
export type GuideText = { title: string; description: string; intro: string; sections: Section[]; faq?: [string, string][] };
export type Guide = { slug: string; date: string; fr: GuideText; en: GuideText };

export const GUIDES: Guide[] = [
  {
    slug: "vendre-ebook-etsy",
    date: "2026-10-27",
    fr: {
      title: "Comment vendre un e-book sur Etsy : le guide complet",
      description: "Ouvrir sa boutique, choisir un sujet, créer le PDF, rédiger la fiche et fixer le prix : toutes les étapes pour vendre ton premier e-book sur Etsy.",
      intro: "Etsy n'est pas réservé aux bijoux et à la déco faits main. Les produits numériques, et notamment les e-books en PDF, y ont leur place : l'acheteur paie, télécharge le fichier, et tu n'as rien à expédier. Voici la marche à suivre, étape par étape, sans raccourci magique.",
      sections: [
        { h: "1. Ouvrir ta boutique Etsy", p: ["L'inscription vendeur se fait depuis etsy.com/sell. Etsy te demande un nom de boutique, une pièce d'identité et un compte bancaire (IBAN) sur lequel il versera tes ventes. En France, tu peux vendre en micro-entreprise : déclare ton activité avant de commencer à encaisser régulièrement."] },
        { h: "2. Choisir un sujet qui répond à un vrai besoin", p: ["Un bon e-book Etsy résout un problème précis pour un public précis : « Préparer l'arrivée de bébé : la checklist complète » se vend mieux que « Tout sur la parentalité ». Regarde ce qui existe déjà sur Etsy, lis les avis des acheteurs et cherche ce qui manque : un niveau débutant, un format plus pratique, une langue moins couverte."], ul: ["Un public identifiable (débutants, jeunes parents, sportifs, étudiants…)", "Un résultat concret (un plan, une méthode, une checklist)", "Un sujet que tu peux présenter honnêtement, sans promesse médicale ou financière"] },
        { h: "3. Créer le PDF", p: ["Ton e-book doit être agréable à lire : un sommaire, des chapitres courts, des exemples, des exercices et un plan d'action. Vise la qualité plutôt que le nombre de pages. Avec un outil comme Movacash, l'IA rédige le plan et les chapitres à partir de ton sujet, puis tu relis, modifies ce qui ne te plaît pas et exportes un PDF A4, A5 ou US Letter."] },
        { h: "4. Rédiger une fiche Etsy qui se trouve", p: ["Sur Etsy, la recherche lit surtout le titre et les 13 tags. Mets les mots que tapent tes acheteurs au début du titre (140 caractères maximum), utilise les 13 tags (20 caractères chacun) avec des expressions variées, et écris une description qui dit clairement ce que contient le fichier, pour qui il est fait et comment le télécharger."] },
        { h: "5. Soigner la miniature", p: ["La première image est celle qu'on voit dans les résultats. Elle doit montrer le titre lisible en petit, le type de produit (e-book PDF) et donner envie de cliquer. Évite les visuels surchargés et les promesses écrites en gros."] },
        { h: "6. Fixer ton prix", p: ["Regarde les prix des e-books comparables sur Etsy et tiens compte des frais : mise en vente (0,20 $ par annonce, valable 4 mois), commission sur la transaction (6,5 %) et frais de paiement. Beaucoup de vendeurs débutent à un prix accessible pour obtenir leurs premiers avis, puis ajustent."] },
        { h: "7. Publier régulièrement et apprendre", p: ["Une seule fiche donne rarement des résultats. Les vendeurs qui progressent publient plusieurs e-books sur des sujets proches, observent les statistiques de la boutique (vues, favoris, ventes) et améliorent les titres et les miniatures qui ne fonctionnent pas."] },
      ],
      faq: [
        ["Faut-il un statut pour vendre sur Etsy ?", "Pour une activité régulière, oui. En France, la micro-entreprise est le statut le plus simple pour démarrer."],
        ["Etsy accepte-t-il les e-books écrits avec l'IA ?", "Oui, à condition d'indiquer dans la description que l'IA a été utilisée et de respecter les règles d'Etsy sur la propriété intellectuelle."],
        ["Combien peut-on gagner ?", "Personne ne peut le garantir. Les ventes dépendent du sujet, de la qualité de la fiche, de la concurrence et de ta régularité."],
      ],
    },
    en: {
      title: "How to sell an e-book on Etsy: the complete guide",
      description: "Open your shop, pick a topic, create the PDF, write the listing and set your price: every step to sell your first e-book on Etsy.",
      intro: "Etsy isn't only for handmade jewelry and decor. Digital products, including PDF e-books, have their place there: the buyer pays, downloads the file, and you have nothing to ship. Here is the process, step by step, with no magic shortcut.",
      sections: [
        { h: "1. Open your Etsy shop", p: ["Seller sign-up starts at etsy.com/sell. Etsy asks for a shop name, an ID and a bank account where it will pay out your sales. Check the business registration rules in your country before you start selling regularly."] },
        { h: "2. Pick a topic that solves a real problem", p: ["A good Etsy e-book solves a specific problem for a specific audience: \"Preparing for baby: the complete checklist\" sells better than \"All about parenting\". Look at what already exists on Etsy, read buyer reviews and find what's missing: a beginner level, a more practical format, a less covered language."], ul: ["A clear audience (beginners, new parents, athletes, students…)", "A concrete outcome (a plan, a method, a checklist)", "A topic you can present honestly, without medical or financial promises"] },
        { h: "3. Create the PDF", p: ["Your e-book should be pleasant to read: a table of contents, short chapters, examples, exercises and an action plan. Aim for quality rather than page count. With a tool like Movacash, AI writes the outline and chapters from your topic, then you review, edit what you don't like and export an A4, A5 or US Letter PDF."] },
        { h: "4. Write a listing people can find", p: ["Etsy search mostly reads the title and the 13 tags. Put the words buyers type at the start of the title (140 characters max), use all 13 tags (20 characters each) with varied phrases, and write a description that clearly says what the file contains, who it's for and how to download it."] },
        { h: "5. Take care of the thumbnail", p: ["The first image is what shoppers see in search results. It should show a title that's readable at small size, make the product type obvious (PDF e-book) and make people want to click. Avoid cluttered visuals and big written promises."] },
        { h: "6. Set your price", p: ["Look at comparable e-books on Etsy and account for fees: listing ($0.20 per listing, valid 4 months), transaction fee (6.5%) and payment processing. Many sellers start at an accessible price to get their first reviews, then adjust."] },
        { h: "7. Publish consistently and learn", p: ["A single listing rarely does much. Sellers who make progress publish several e-books on related topics, watch their shop stats (views, favorites, sales) and improve the titles and thumbnails that don't perform."] },
      ],
      faq: [
        ["Do I need a business status to sell on Etsy?", "For regular activity, usually yes. Check the rules in your country before you start."],
        ["Does Etsy accept e-books written with AI?", "Yes, as long as you state in the description that AI was used and respect Etsy's intellectual property rules."],
        ["How much can I earn?", "Nobody can guarantee it. Sales depend on the topic, the listing quality, competition and your consistency."],
      ],
    },
  },
  {
    slug: "idees-ebook-etsy",
    date: "2026-10-27",
    fr: {
      title: "Quels e-books vendre sur Etsy ? 30 idées de sujets",
      description: "30 idées d'e-books adaptées à Etsy, classées par thème (famille, sport, argent, maison, IA, loisirs), et comment choisir la tienne.",
      intro: "Le bon sujet, c'est celui qui croise trois choses : un besoin réel, un public qui achète sur Etsy, et un angle que tu peux traiter correctement. Voici 30 pistes tirées de notre base d'idées, à adapter à ton profil.",
      sections: [
        { h: "Famille et parentalité", ul: ["Préparer l'arrivée de bébé : la checklist complète", "Allaitement : guide pratique pour les premières semaines", "Routines du soir pour enfants de 3 à 6 ans", "Tableau de responsabilités familiales à imprimer", "Organiser un anniversaire d'enfant sans stress"] },
        { h: "Sport et bien-être", ul: ["Programme HIIT de 20 minutes par jour", "Le guide du vélo d'appartement efficace", "Débuter la musculation à la maison", "Routine d'étirements pour le travail de bureau", "Préparer son premier 10 km"] },
        { h: "Budget et organisation", ul: ["Planificateur de budget mensuel", "Méthode des enveloppes expliquée pas à pas", "Organiser ses papiers administratifs", "Préparer un déménagement sans oubli", "Batch cooking pour la semaine"] },
        { h: "Maison et jardin", ul: ["Attirer les oiseaux et les insectes au jardin", "Potager sur balcon pour débutants", "Désencombrer sa maison pièce par pièce", "Nettoyage écologique : recettes maison", "Plantes d'intérieur faciles à entretenir"] },
        { h: "IA et outils numériques", ul: ["Écrire des prompts efficaces pour l'IA", "Les meilleurs outils IA gratuits", "Utiliser l'IA pour trouver un emploi", "Créer des visuels avec l'IA (droits et licences)", "Pinterest pour générer du trafic gratuit"] },
        { h: "Loisirs et créativité", ul: ["Couture pour débutants : premiers projets", "Apprendre le crochet en 10 projets", "Photographie au smartphone", "Tenir un bullet journal", "Éduquer son chiot : les 30 premiers jours"] },
        { h: "Comment choisir ton sujet", p: ["Pars de ce que tu connais ou de ce qui t'intéresse vraiment : tu repéreras plus facilement les erreurs et tu sauras mieux présenter le produit. Vérifie ensuite sur Etsy qu'il existe une demande (des e-books proches ont des avis) sans que les premiers résultats soient tous identiques au tien. Enfin, évite les sujets qui demandent une expertise médicale, juridique ou financière que tu n'as pas."] },
        { h: "Trouver des idées adaptées à ton profil", p: ["Le questionnaire gratuit de Movacash te pose quelques questions sur ton temps, ton niveau et tes centres d'intérêt, puis te propose 3 idées de notre base avec une estimation de la demande et de la concurrence (nos estimations, pas des garanties)."] },
      ],
    },
    en: {
      title: "Which e-books sell on Etsy? 30 topic ideas",
      description: "30 e-book ideas suited to Etsy, grouped by theme (family, fitness, budget, home, AI, hobbies), and how to choose yours.",
      intro: "The right topic sits where three things meet: a real need, an audience that buys on Etsy, and an angle you can cover properly. Here are 30 ideas from our database, to adapt to your profile.",
      sections: [
        { h: "Family and parenting", ul: ["Preparing for baby: the complete checklist", "Breastfeeding: a practical guide for the first weeks", "Bedtime routines for kids aged 3 to 6", "Printable family chore chart", "Planning a stress-free kids' birthday party"] },
        { h: "Fitness and wellness", ul: ["20-minute daily HIIT program", "The effective exercise bike guide", "Starting strength training at home", "Stretching routine for desk workers", "Training for your first 10K"] },
        { h: "Budget and organization", ul: ["Monthly budget planner", "The envelope method, step by step", "Organizing your paperwork", "A moving checklist with nothing forgotten", "Weekly meal prep"] },
        { h: "Home and garden", ul: ["Attracting birds and insects to your garden", "Balcony vegetable garden for beginners", "Decluttering your home room by room", "Eco-friendly cleaning: homemade recipes", "Easy-care houseplants"] },
        { h: "AI and digital tools", ul: ["Writing effective AI prompts", "The best free AI tools", "Using AI to find a job", "Creating visuals with AI (rights and licenses)", "Pinterest for free traffic"] },
        { h: "Hobbies and creativity", ul: ["Sewing for beginners: first projects", "Learn crochet in 10 projects", "Smartphone photography", "Keeping a bullet journal", "Training your puppy: the first 30 days"] },
        { h: "How to choose your topic", p: ["Start from what you know or genuinely care about: you'll spot mistakes more easily and present the product better. Then check on Etsy that there is demand (similar e-books have reviews) without the top results all being identical to yours. Finally, avoid topics that require medical, legal or financial expertise you don't have."] },
        { h: "Find ideas that fit your profile", p: ["Movacash's free questionnaire asks a few questions about your time, level and interests, then suggests 3 ideas from our database with an estimate of demand and competition (our estimates, not guarantees)."] },
      ],
    },
  },
  {
    slug: "creer-ebook-ia",
    date: "2026-10-27",
    fr: {
      title: "Créer un e-book avec l'IA : la méthode pas à pas",
      description: "Du sujet au PDF : comment utiliser l'IA pour écrire un e-book utile, éviter les erreurs classiques et obtenir un produit prêt à vendre.",
      intro: "L'IA peut écrire un e-book entier en quelques minutes. Mais un bon e-book, ce n'est pas un texte long : c'est un texte utile, bien structuré et sans erreurs. Voici une méthode qui fonctionne.",
      sections: [
        { h: "1. Définir le lecteur et la promesse du livre", p: ["Avant de générer quoi que ce soit, écris en une phrase pour qui est le livre et ce qu'il permet de faire. Exemple : « Aider un grand débutant à coudre ses 5 premiers projets en un mois. » Cette phrase guide tout le reste."] },
        { h: "2. Faire générer un plan détaillé", p: ["Demande d'abord un plan : 7 à 12 chapitres, chacun avec un objectif clair. Relis-le : l'ordre est-il logique ? Manque-t-il une étape ? Un chapitre fait-il doublon ? Corriger le plan prend deux minutes et évite de réécrire des pages."] },
        { h: "3. Générer chapitre par chapitre", p: ["Un chapitre à la fois donne un texte plus précis qu'un livre entier d'un coup. Chaque chapitre devrait contenir une explication, des exemples concrets, un exercice ou une checklist, et un résumé de ce qu'il faut retenir."] },
        { h: "4. Relire et vérifier", ul: ["Supprimer les chiffres et statistiques que tu ne peux pas vérifier", "Retirer les promesses (« garanti », « résultat en 7 jours »)", "Vérifier les conseils de sécurité, de santé et d'argent", "Ajouter tes propres astuces : c'est ce qui rend le livre unique"] },
        { h: "5. Mettre en page et exporter", p: ["Un sommaire, une couverture, une pagination et des titres clairs font la différence. Exporte en PDF au format attendu par tes acheteurs (A4 en Europe, US Letter aux États-Unis, A5 pour la lecture sur téléphone)."] },
        { h: "Ce que fait Movacash", p: ["Movacash enchaîne ces étapes : plan détaillé, chapitres avec exemples et exercices, régénération d'un chapitre en un clic, couverture, PDF et fiche Etsy. Le contenu est écrit pour éviter les statistiques inventées et les promesses excessives, et tu restes l'auteur : tu relis et tu modifies ce que tu veux avant de vendre."] },
      ],
      faq: [
        ["Un e-book écrit par l'IA est-il légal à vendre ?", "Oui, dans la plupart des cas, à condition de ne pas reprendre de contenu protégé et d'indiquer l'usage de l'IA quand la plateforme le demande, comme Etsy."],
        ["Combien de pages faut-il ?", "Il n'y a pas de minimum. 40 à 60 pages bien remplies valent mieux que 150 pages délayées."],
      ],
    },
    en: {
      title: "Create an e-book with AI: a step-by-step method",
      description: "From topic to PDF: how to use AI to write a useful e-book, avoid classic mistakes and get a ready-to-sell product.",
      intro: "AI can write a whole e-book in minutes. But a good e-book isn't a long text: it's a useful, well-structured text with no mistakes. Here is a method that works.",
      sections: [
        { h: "1. Define the reader and the book's promise", p: ["Before generating anything, write in one sentence who the book is for and what it helps them do. Example: \"Help a complete beginner sew their first 5 projects in a month.\" That sentence guides everything else."] },
        { h: "2. Generate a detailed outline", p: ["Ask for an outline first: 7 to 12 chapters, each with a clear goal. Review it: is the order logical? Is a step missing? Does a chapter overlap another? Fixing the outline takes two minutes and saves rewriting pages."] },
        { h: "3. Generate chapter by chapter", p: ["One chapter at a time gives more precise text than a whole book at once. Each chapter should include an explanation, concrete examples, an exercise or checklist, and a summary of key takeaways."] },
        { h: "4. Review and check", ul: ["Remove figures and statistics you can't verify", "Remove promises (\"guaranteed\", \"results in 7 days\")", "Check safety, health and money advice", "Add your own tips: that's what makes the book unique"] },
        { h: "5. Lay out and export", p: ["A table of contents, a cover, page numbers and clear headings make the difference. Export a PDF in the size your buyers expect (A4 in Europe, US Letter in the US, A5 for phone reading)."] },
        { h: "What Movacash does", p: ["Movacash chains these steps: detailed outline, chapters with examples and exercises, one-click chapter regeneration, cover, PDF and Etsy listing. The content is written to avoid made-up statistics and exaggerated promises, and you stay the author: you review and edit whatever you want before selling."] },
      ],
      faq: [
        ["Is it legal to sell an AI-written e-book?", "In most cases yes, as long as you don't reuse protected content and you disclose AI use when the platform asks for it, as Etsy does."],
        ["How many pages do I need?", "There's no minimum. 40 to 60 solid pages beat 150 padded ones."],
      ],
    },
  },
  {
    slug: "fiche-etsy-produit-numerique",
    date: "2026-10-27",
    fr: {
      title: "Fiche Etsy pour un produit numérique : titre, 13 tags et description",
      description: "Comment écrire le titre, choisir les 13 tags et rédiger la description d'un e-book ou d'un PDF sur Etsy pour qu'il soit trouvé et compris.",
      intro: "Sur Etsy, un bon produit invisible ne se vend pas. La fiche sert à deux choses : être trouvée par la recherche, puis convaincre en quelques secondes. Voici comment la construire.",
      sections: [
        { h: "Le titre (140 caractères maximum)", p: ["Commence par l'expression exacte que tape ton acheteur, puis précise le format et le public. Exemple : « Programme HIIT 20 minutes – E-book PDF pour débutants – Entraînement maison sans matériel ». Évite les titres poétiques : ils plaisent, mais ne se trouvent pas."] },
        { h: "Les 13 tags (20 caractères chacun)", ul: ["Utilise les 13, toujours", "Varie les expressions au lieu de répéter le même mot", "Pense aux synonymes et aux usages (« cadeau », « imprimable », « débutant »)", "Ajoute le format : « ebook pdf », « guide pdf »"] },
        { h: "La description", p: ["Les premières lignes s'affichent en aperçu : dis tout de suite ce que contient le fichier et pour qui il est. Ensuite, liste le contenu (chapitres, checklists, exercices), le format (PDF, nombre de pages, A4 ou US Letter) et la façon de le télécharger. Termine par la mention de l'usage de l'IA si tu en as utilisé, comme l'exige Etsy."] },
        { h: "Les images", p: ["La miniature doit rester lisible en petit. Ajoute 2 ou 3 aperçus de pages intérieures : l'acheteur veut voir ce qu'il achète. Évite les logos de marques et les promesses de résultats écrites sur l'image."] },
        { h: "Ce que Movacash prépare pour toi", p: ["Pour chaque e-book, Movacash génère un titre de 140 caractères, 13 tags, une description avec la mention IA et une miniature, prêts à copier dans Etsy. Tu peux tout modifier avant de publier."] },
      ],
    },
    en: {
      title: "Etsy listing for a digital product: title, 13 tags and description",
      description: "How to write the title, choose the 13 tags and write the description of an e-book or PDF on Etsy so it gets found and understood.",
      intro: "On Etsy, a great product nobody sees doesn't sell. The listing does two jobs: get found in search, then convince in a few seconds. Here's how to build it.",
      sections: [
        { h: "The title (140 characters max)", p: ["Start with the exact phrase your buyer types, then add the format and audience. Example: \"20-Minute HIIT Program – PDF E-book for Beginners – No-Equipment Home Workout\". Avoid poetic titles: they're nice, but nobody finds them."] },
        { h: "The 13 tags (20 characters each)", ul: ["Always use all 13", "Vary the phrases instead of repeating the same word", "Think of synonyms and uses (\"gift\", \"printable\", \"beginner\")", "Add the format: \"ebook pdf\", \"pdf guide\""] },
        { h: "The description", p: ["The first lines show as a preview: say right away what the file contains and who it's for. Then list the content (chapters, checklists, exercises), the format (PDF, page count, A4 or US Letter) and how to download it. End with a note on AI use if you used it, as Etsy requires."] },
        { h: "The images", p: ["The thumbnail must stay readable at small size. Add 2 or 3 previews of inside pages: buyers want to see what they're buying. Avoid brand logos and result promises written on the image."] },
        { h: "What Movacash prepares for you", p: ["For each e-book, Movacash generates a 140-character title, 13 tags, a description with the AI note and a thumbnail, ready to paste into Etsy. You can edit everything before publishing."] },
      ],
    },
  },
  {
    slug: "prix-ebook-etsy",
    date: "2026-10-27",
    fr: {
      title: "À quel prix vendre un e-book sur Etsy ?",
      description: "Comment fixer le prix d'un e-book sur Etsy : observer la concurrence, compter les frais Etsy, choisir un prix de lancement et l'ajuster.",
      intro: "Trop cher, personne n'achète un inconnu. Trop bas, ton e-book paraît sans valeur et les frais mangent ta marge. Voici comment trouver le bon prix.",
      sections: [
        { h: "Observer les e-books comparables", p: ["Cherche sur Etsy ton sujet et note le prix des 15 à 20 premiers résultats qui ont des avis. Tu obtiens une fourchette réaliste pour ce type de produit. Sur beaucoup de sujets pratiques, les e-books se situent entre quelques euros et une quinzaine d'euros, mais chaque niche est différente."] },
        { h: "Compter les frais", ul: ["Mise en vente : 0,20 $ par annonce, renouvelée tous les 4 mois ou à chaque vente", "Commission sur la transaction : 6,5 % du prix", "Frais de traitement du paiement : un pourcentage plus un montant fixe, selon ton pays", "Publicités Etsy et Offsite Ads : seulement si elles s'appliquent à ta boutique"] },
        { h: "Choisir un prix de lancement", p: ["Beaucoup de vendeurs démarrent dans le bas de la fourchette pour obtenir leurs premières ventes et leurs premiers avis, puis remontent le prix. Une autre option est de proposer un lot (pack de 2 ou 3 e-books sur des sujets proches) à un prix plus élevé."] },
        { h: "Ajuster avec les statistiques", p: ["Si une fiche reçoit des vues et des favoris mais pas de ventes, le prix ou la description posent peut-être problème. Si elle ne reçoit pas de vues, c'est d'abord le titre, les tags ou la miniature qu'il faut revoir."] },
        { h: "L'aide de Movacash", p: ["Chaque idée de notre base indique un prix conseillé, estimé à partir de produits comparables. C'est un point de départ, pas une garantie : c'est toi qui fixes ton prix."] },
      ],
    },
    en: {
      title: "How much should you charge for an e-book on Etsy?",
      description: "How to price an e-book on Etsy: study the competition, count Etsy fees, choose a launch price and adjust it.",
      intro: "Too expensive and nobody buys from an unknown shop. Too cheap and your e-book looks worthless while fees eat your margin. Here's how to find the right price.",
      sections: [
        { h: "Look at comparable e-books", p: ["Search your topic on Etsy and note the prices of the top 15 to 20 results that have reviews. That gives you a realistic range for this type of product. For many practical topics, e-books sit between a few dollars and around fifteen, but every niche is different."] },
        { h: "Count the fees", ul: ["Listing: $0.20 per listing, renewed every 4 months or with each sale", "Transaction fee: 6.5% of the price", "Payment processing: a percentage plus a fixed amount, depending on your country", "Etsy Ads and Offsite Ads: only if they apply to your shop"] },
        { h: "Choose a launch price", p: ["Many sellers start at the lower end of the range to get their first sales and reviews, then raise the price. Another option is a bundle (2 or 3 e-books on related topics) at a higher price."] },
        { h: "Adjust with your stats", p: ["If a listing gets views and favorites but no sales, the price or description may be the issue. If it gets no views, look at the title, tags or thumbnail first."] },
        { h: "How Movacash helps", p: ["Each idea in our database shows a suggested price, estimated from comparable products. It's a starting point, not a guarantee: you set your own price."] },
      ],
    },
  },
  {
    slug: "etsy-ia-regles",
    date: "2026-10-27",
    fr: {
      title: "Etsy et l'IA : ce qui est autorisé pour les produits numériques",
      description: "Peut-on vendre sur Etsy un e-book créé avec l'IA ? Les règles à connaître : mention de l'IA, propriété intellectuelle, sujets sensibles.",
      intro: "Etsy accepte les produits créés avec l'aide de l'IA, mais avec des règles. Les ignorer peut faire supprimer une annonce, voire suspendre une boutique. Voici l'essentiel.",
      sections: [
        { h: "Indiquer l'usage de l'IA", p: ["Etsy demande aux vendeurs d'être transparents : si ton produit a été créé avec l'aide d'outils d'IA, indique-le dans la description de l'annonce. Une phrase simple suffit, par exemple « Contenu rédigé avec l'aide d'outils d'IA, puis relu et mis en page par la boutique »."] },
        { h: "Respecter la propriété intellectuelle", ul: ["Pas de marques, logos ou personnages protégés dans le titre, les tags ou les visuels", "Pas de reprise de livres, cours ou articles existants", "Des images dont tu as les droits (créées par toi, par une IA qui le permet, ou sous licence)"] },
        { h: "Faire attention aux sujets sensibles", p: ["Santé, minceur, argent, investissements : ces sujets se vendent, mais ils exigent de la prudence. Pas de promesse de guérison ou de gains, des avertissements clairs, et un renvoi vers un professionnel quand c'est nécessaire."] },
        { h: "Apporter de la valeur", p: ["Etsy met en avant les boutiques dont les clients sont satisfaits. Un e-book relu, utile et bien présenté reçoit de meilleurs avis qu'un texte généré et publié sans vérification."] },
        { h: "Comment Movacash t'aide à rester dans les règles", p: ["La mention de l'IA est ajoutée automatiquement dans la fiche et dans le PDF. Les sujets santé et argent reçoivent des avertissements, et le texte évite les promesses excessives et les marques citées. Tu restes responsable de ce que tu publies : relis toujours avant de vendre."] },
      ],
    },
    en: {
      title: "Etsy and AI: what's allowed for digital products",
      description: "Can you sell an AI-created e-book on Etsy? The rules to know: AI disclosure, intellectual property, sensitive topics.",
      intro: "Etsy accepts products made with the help of AI, but with rules. Ignoring them can get a listing removed or even a shop suspended. Here's what matters.",
      sections: [
        { h: "Disclose AI use", p: ["Etsy asks sellers to be transparent: if your product was made with the help of AI tools, say so in the listing description. One simple sentence is enough, for example \"Content written with the help of AI tools, then reviewed and laid out by the shop\"."] },
        { h: "Respect intellectual property", ul: ["No protected brands, logos or characters in the title, tags or visuals", "No copying of existing books, courses or articles", "Images you have rights to (made by you, by an AI that allows it, or licensed)"] },
        { h: "Be careful with sensitive topics", p: ["Health, weight loss, money, investing: these topics sell, but they require care. No promises of cures or earnings, clear disclaimers, and a referral to a professional when needed."] },
        { h: "Bring real value", p: ["Etsy favors shops with satisfied customers. A reviewed, useful, well-presented e-book gets better reviews than text generated and published without checking."] },
        { h: "How Movacash helps you follow the rules", p: ["The AI note is added automatically to the listing and the PDF. Health and money topics get disclaimers, and the text avoids exaggerated promises and brand names. You remain responsible for what you publish: always review before selling."] },
      ],
    },
  },
];

export const guideLang = (locale: string): "fr" | "en" => (locale === "fr" ? "fr" : "en");
export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
