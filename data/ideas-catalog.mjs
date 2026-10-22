// Catalogue initial d'idées de formations / e-books vendables sur Etsy.
// Format d'une ligne : "Titre | Public cible | mots-clés séparés par des virgules"
// `sensitive` : "health" (santé, nutrition, poids), "finance" (argent, investissement),
// "legal" (droit, fiscalité) -> le générateur ajoute des avertissements adaptés.
// Le schéma (table `ideas` + index FTS5) est prévu pour monter à 10 000+ idées.

export const CATEGORIES = [
  {
    slug: "sport-musculation",
    name: "Sport & musculation",
    emoji: "💪",
    sensitive: "health",
    baseDemand: 5,
    baseCompetition: 4,
    price: [6, 12],
    ideas: `
Programme musculation 12 semaines pour débutant | Hommes débutants 18-35 ans | prise de masse, salle, programme
Prendre du muscle à la maison sans matériel | Personnes sans abonnement salle | poids du corps, home workout
Programme full body 3 séances par semaine | Débutants pressés | full body, routine
Guide de la prise de masse sèche | Pratiquants intermédiaires | sèche, masse, nutrition sportive
Musculation pour femmes : se tonifier en 8 semaines | Femmes débutantes | fessiers, tonification
Programme fessiers et jambes 6 semaines | Femmes 20-45 ans | glutes, jambes
Réussir ses premières tractions en 30 jours | Débutants | tractions, calisthenics
Calisthenics : du zéro au muscle-up | Sportifs intermédiaires | street workout, muscle-up
Courir son premier 5 km en 8 semaines | Débutants complets | running, course à pied
Préparer un semi-marathon en 12 semaines | Coureurs réguliers | semi-marathon, plan d'entraînement
Programme HIIT 20 minutes par jour | Actifs pressés | HIIT, cardio
Musculation après 40 ans | Hommes et femmes 40+ | senior, force
Guide de l'entraînement avec élastiques | Voyageurs, débutants | élastiques, résistance
Retrouver la forme après une grossesse (avec accord médical) | Jeunes mamans | post-partum, remise en forme
Mobilité et souplesse en 15 minutes par jour | Sédentaires | mobilité, stretching
Programme kettlebell pour débutant | Débutants | kettlebell, force
Préparer les tests physiques police / pompiers / armée | Candidats concours | concours, condition physique
Routine abdos et gainage 30 jours | Tous niveaux | abdos, gainage, défi
Boxe à la maison : techniques et circuits | Débutants | boxe, cardio
Carnet d'entraînement musculation à imprimer + guide | Pratiquants | carnet, suivi, printable
Programme natation pour progresser en crawl | Nageurs débutants | natation, crawl
Le guide du vélo d'appartement efficace | Débutants | vélo, cardio
`,
  },
  {
    slug: "nutrition-perte-de-poids",
    name: "Nutrition & perte de poids",
    emoji: "🥗",
    sensitive: "health",
    baseDemand: 5,
    baseCompetition: 5,
    price: [5, 12],
    ideas: `
Perdre du poids durablement sans régime extrême | Adultes souhaitant mincir | rééquilibrage alimentaire, minceur
Meal prep de la semaine en 2 heures | Actifs pressés | meal prep, batch cooking
30 jours de menus équilibrés avec liste de courses | Familles | menus, planning repas
Manger sain avec un petit budget | Étudiants, petits budgets | budget, alimentation saine
Guide du rééquilibrage alimentaire pour débutants | Débutants | équilibre, habitudes
Comprendre les calories et les macros simplement | Sportifs débutants | macros, calories
Le jeûne intermittent expliqué (précautions incluses) | Adultes en bonne santé | jeûne intermittent
Recettes protéinées pour la prise de muscle | Pratiquants de musculation | protéines, recettes
Petits-déjeuners sains et rapides : 50 idées | Actifs | petit-déjeuner, recettes rapides
Réduire le sucre en 21 jours | Adultes | sucre, défi, habitudes
Snacks sains pour le bureau | Salariés | snacks, en-cas
Cuisine anti-gaspi et équilibrée | Familles | anti-gaspi, équilibre
Alimentation végétarienne équilibrée pour débutants | Futurs végétariens | végétarien, protéines végétales
Bien manger quand on travaille de nuit | Travailleurs de nuit | horaires décalés, nutrition
Guide de l'hydratation et des boissons saines | Tous publics | hydratation, boissons
Planificateur repas et suivi minceur à imprimer | Personnes en rééquilibrage | planner, suivi, printable
Nutrition du sportif d'endurance | Coureurs, cyclistes | endurance, nutrition sportive
Recettes healthy au air fryer | Possesseurs d'air fryer | air fryer, recettes
Batch cooking végétarien | Végétariens actifs | batch cooking, végétarien
Manger équilibré en famille avec des enfants difficiles | Parents | enfants, repas famille
Comprendre les étiquettes alimentaires | Consommateurs | étiquettes, nutri-score
Guide des lunch box saines | Salariés, étudiants | lunch box, recettes
`,
  },
  {
    slug: "bien-etre-mental",
    name: "Bien-être & équilibre mental",
    emoji: "🧘",
    sensitive: "health",
    baseDemand: 4,
    baseCompetition: 4,
    price: [5, 10],
    ideas: `
Gérer son stress au quotidien : méthodes simples | Actifs stressés | stress, relaxation
Mieux dormir en 21 jours : routines du soir | Personnes qui dorment mal | sommeil, routine du soir
Méditation pour débutants : programme 30 jours | Débutants | méditation, pleine conscience
Journal de gratitude guidé 90 jours | Tous publics | gratitude, journaling, printable
Sortir du burn-out : comprendre et se faire accompagner | Salariés épuisés | burn-out, prévention
Digital detox : reprendre le contrôle de son téléphone | Jeunes adultes | détox digitale, écrans
Journaling pour mieux se connaître | Adultes | journaling, introspection
Techniques de respiration anti-stress | Tous publics | respiration, cohérence cardiaque
Créer une routine matinale qui tient | Actifs | morning routine, habitudes
Gérer l'anxiété du quotidien (outils non médicaux) | Adultes | anxiété, outils
Self-care : 100 idées pour prendre soin de soi | Femmes 20-40 ans | self care, bien-être
Le guide du minimalisme mental | Adultes surchargés | minimalisme, charge mentale
Gérer la charge mentale à la maison | Parents | charge mentale, organisation
Sophrologie : exercices simples à pratiquer chez soi | Débutants | sophrologie, détente
Apprendre à dire non sans culpabiliser | Personnes trop gentilles | assertivité, limites
Se remettre d'une rupture amoureuse | Personnes en rupture | rupture, reconstruction
Ralentir : le guide du slow living | Citadins | slow living, simplicité
Bien vivre sa solitude | Personnes seules | solitude, épanouissement
Prendre confiance en son corps | Adultes complexés | image de soi, confiance
Carnet bien-être mensuel à imprimer | Tous publics | planner, bien-être, printable
`,
  },
  {
    slug: "yoga-pilates",
    name: "Yoga, Pilates & mobilité",
    emoji: "🤸",
    sensitive: "health",
    baseDemand: 4,
    baseCompetition: 3,
    price: [5, 10],
    ideas: `
Yoga pour débutants : 30 séances guidées | Débutants complets | yoga, débutant
Yoga du matin en 10 minutes | Actifs | yoga matinal, routine
Pilates à la maison : programme 4 semaines | Femmes | pilates, renforcement
Yoga pour le mal de dos (avec avis médical) | Sédentaires | dos, posture
Yoga pour mieux dormir | Insomniaques légers | yoga du soir, sommeil
Wall pilates : programme 28 jours | Femmes débutantes | wall pilates, défi
Yoga pour sportifs : récupération et souplesse | Coureurs, cyclistes | récupération, souplesse
Yoga en famille avec les enfants | Parents | yoga enfants, famille
Chair yoga : yoga sur chaise pour seniors et bureau | Seniors, salariés | chair yoga, bureau
Les postures de yoga illustrées : guide complet | Pratiquants | postures, asanas
Stretching pour grand écart en 60 jours | Sportifs | grand écart, souplesse
Posture parfaite : corriger son dos au bureau | Télétravailleurs | posture, ergonomie
Yoga prénatal : bases et précautions | Femmes enceintes | prénatal, grossesse
Créer sa routine de yoga personnalisée | Pratiquants intermédiaires | routine, autonomie
Yin yoga : lâcher prise et détente | Adultes stressés | yin yoga, détente
`,
  },
  {
    slug: "cuisine-recettes",
    name: "Cuisine & recettes",
    emoji: "🍳",
    sensitive: null,
    baseDemand: 4,
    baseCompetition: 4,
    price: [4, 9],
    ideas: `
Cuisiner pour la semaine en une seule session | Familles actives | batch cooking, organisation
Recettes faciles pour étudiants | Étudiants | recettes étudiantes, budget
Le pain maison pour les nuls | Débutants en boulangerie | pain, levain
Maîtriser le levain naturel | Passionnés de pain | levain, boulangerie
Pâtisserie française : les bases | Débutants pâtissiers | pâtisserie, bases
Recettes au Thermomix / robot cuiseur : 60 classiques | Possesseurs de robot | robot cuiseur, recettes
Cuisine italienne authentique | Amateurs de cuisine | italien, pâtes
Recettes air fryer : 80 idées rapides | Possesseurs d'air fryer | air fryer, rapide
Repas en 15 minutes chrono | Actifs pressés | rapide, express
Cuisine vegan gourmande | Curieux du vegan | vegan, végétal
Recettes de grand-mère revisitées | Amateurs de tradition | terroir, tradition
Gâteaux d'anniversaire spectaculaires faciles | Parents | anniversaire, gâteaux
Cuisine japonaise maison : sushis, ramen, gyozas | Fans de cuisine asiatique | japonais, sushi
Conserves, bocaux et lacto-fermentation | Adeptes du fait-maison | conserves, fermentation
Barbecue et plancha : le guide complet | Amateurs de grillades | barbecue, plancha
Cuisine marocaine : recettes familiales | Amateurs de cuisine orientale | marocain, tajine
Desserts sans sucre ajouté | Personnes réduisant le sucre | desserts, sans sucre
Recettes pour bébé : diversification alimentaire (avis pédiatre) | Jeunes parents | diversification, bébé
Cocktails et mocktails maison | Hôtes, fêtes | cocktails, mocktails
Le carnet de recettes familial à remplir | Familles | carnet, printable
Cuisine du monde en 30 plats | Curieux | cuisine du monde
Bento box créatives pour enfants | Parents | bento, enfants
Cuisiner les restes : 50 recettes anti-gaspi | Familles | anti-gaspi, restes
Recettes de glaces et sorbets maison | Gourmands | glaces, été
`,
  },
  {
    slug: "ia-creation-contenu",
    name: "IA & création de contenu",
    emoji: "🤖",
    sensitive: null,
    baseDemand: 5,
    baseCompetition: 3,
    price: [7, 15],
    ideas: `
Créer des vidéos IA avec des fruits qui parlent pour TikTok | Créateurs TikTok débutants | vidéos IA, fruits, TikTok
Créer un influenceur virtuel avec l'IA | Créateurs de contenu | influenceur IA, avatar
ChatGPT pour les débutants : 200 prompts utiles | Débutants en IA | prompts, ChatGPT
Écrire des prompts efficaces pour l'IA | Tous publics | prompt engineering
Créer des images IA qui se vendent (droits et licences inclus) | Créatifs | image IA, Midjourney
Faire des vidéos faceless sur YouTube avec l'IA | Futurs youtubeurs | faceless, YouTube
Créer des voix off avec l'IA | Créateurs vidéo | voix IA, voix off
Automatiser son business avec l'IA | Entrepreneurs | automatisation, IA business
L'IA pour les enseignants : préparer ses cours | Enseignants | IA éducation
L'IA pour les commerçants et artisans | Petites entreprises | IA, commerce local
Créer des histoires animées pour enfants avec l'IA | Créateurs, parents | histoires IA, animation
Créer des coloriages IA à vendre | Vendeurs de printables | coloriages, IA, printable
Réaliser des clips musicaux avec l'IA | Musiciens | clip, vidéo IA
Monter ses vidéos courtes avec l'IA (CapCut et autres) | Créateurs | montage, CapCut
Créer des carrousels Instagram viraux avec l'IA | Community managers | carrousel, Instagram
Utiliser l'IA pour trouver un emploi | Chercheurs d'emploi | CV, lettre de motivation, IA
Créer une chaîne de vidéos IA d'animaux mignons | Créateurs TikTok | animaux, vidéo IA
L'IA pour écrire son premier livre | Auteurs débutants | écriture, IA
Créer des stickers et designs IA pour print-on-demand | Vendeurs POD | print on demand, design IA
Les meilleurs outils IA gratuits en 2026 | Tous publics | outils IA, gratuit
Créer des vidéos IA de recettes satisfaisantes | Créateurs food | food, vidéo IA
L'IA pour les agents immobiliers | Agents immobiliers | immobilier, IA
Créer des contes du soir personnalisés avec l'IA | Parents | contes, IA, enfants
Éthique et règles de l'IA : ce qu'il faut savoir avant de publier | Créateurs | éthique IA, droits
`,
  },
  {
    slug: "reseaux-sociaux",
    name: "Réseaux sociaux & audience",
    emoji: "📱",
    sensitive: null,
    baseDemand: 5,
    baseCompetition: 4,
    price: [6, 14],
    ideas: `
Lancer son compte TikTok de zéro | Débutants | TikTok, croissance
Atteindre ses 1000 premiers abonnés Instagram | Créateurs débutants | Instagram, abonnés
Devenir UGC creator : le guide complet | Créateurs de contenu | UGC, marques
Créer du contenu en étant introverti | Introvertis | création de contenu, faceless
Calendrier éditorial 90 jours pour réseaux sociaux | Entrepreneurs | calendrier éditorial, planning
Écrire des hooks qui retiennent l'attention | Créateurs | hooks, copywriting
Monétiser son compte Instagram | Créateurs avec audience | monétisation, partenariats
Lancer sa chaîne YouTube en 30 jours | Futurs youtubeurs | YouTube, lancement
YouTube Shorts : stratégie de croissance | Créateurs | Shorts, vidéo courte
LinkedIn : développer sa marque personnelle | Professionnels | LinkedIn, personal branding
Pinterest pour générer du trafic gratuit | Blogueurs, vendeurs Etsy | Pinterest, trafic
Devenir community manager freelance | Reconversion | community manager, freelance
Créer un media kit pour les marques | Influenceurs | media kit, partenariats
Filmer de belles vidéos avec son smartphone | Créateurs | smartphone, tournage
Le storytelling sur les réseaux sociaux | Entrepreneurs | storytelling
Gérer les réseaux sociaux d'un commerce local | Commerçants | commerce local, réseaux
Lancer un podcast de A à Z | Futurs podcasteurs | podcast, audio
Twitch : lancer ses streams | Gamers | Twitch, streaming
Créer une newsletter rentable | Créateurs | newsletter, emailing
100 idées de contenus pour ne jamais être à court | Créateurs | idées contenu
Snapchat et contenus éphémères pour marques | Marques locales | Snapchat
Créer une communauté engagée sur Instagram | Créateurs | communauté, engagement
`,
  },
  {
    slug: "ecommerce-revente",
    name: "E-commerce & achat-revente",
    emoji: "🛍️",
    sensitive: "finance",
    baseDemand: 5,
    baseCompetition: 4,
    price: [7, 15],
    ideas: `
Lancer son business d'achat-revente sur Vinted | Débutants | Vinted, achat-revente
Trouver des pépites en vide-grenier pour la revente | Chineurs | brocante, vide-grenier
Vendre sur Leboncoin comme un pro | Particuliers | Leboncoin, vente
Ouvrir sa boutique Etsy de produits digitaux | Débutants | Etsy, produits digitaux
Réussir ses photos produits avec un smartphone | Vendeurs en ligne | photo produit
Créer et vendre des printables | Créatifs | printables, Etsy
Lancer sa boutique Shopify étape par étape | Futurs e-commerçants | Shopify, boutique en ligne
Le print-on-demand pour débutants | Débutants | print on demand, t-shirts
Revendre des sneakers : le guide | Passionnés de sneakers | sneakers, resell
Vendre ses créations artisanales en ligne | Artisans | artisanat, vente en ligne
Le dropshipping expliqué honnêtement | Curieux de l'e-commerce | dropshipping
Vendre des livres d'occasion en ligne | Particuliers | livres, occasion
Revendre des meubles relookés | Bricoleurs | meubles, relooking
Rédiger des fiches produits qui vendent | Vendeurs en ligne | fiches produits, SEO
Amazon KDP : publier son premier livre | Auteurs débutants | KDP, auto-édition
Vendre sur Vinted : optimiser son dressing | Particuliers | Vinted, dressing
Créer des templates Canva à vendre | Créatifs | Canva, templates
Gérer son stock et sa compta d'achat-revente | Revendeurs | stock, comptabilité
Vendre des cartes Pokémon et objets de collection | Collectionneurs | Pokémon, collection
Débuter sur eBay | Vendeurs | eBay, vente
Trouver ses fournisseurs pour sa boutique | E-commerçants | fournisseurs, sourcing
Le SEO Etsy expliqué simplement | Vendeurs Etsy | SEO Etsy, mots-clés
Lancer une marque de bougies artisanales | Créatifs | bougies, marque
Vendre ses photos en ligne | Photographes | photos, banques d'images
`,
  },
  {
    slug: "freelance-side-business",
    name: "Freelance & side business",
    emoji: "💼",
    sensitive: "legal",
    baseDemand: 4,
    baseCompetition: 3,
    price: [7, 15],
    ideas: `
Devenir freelance : le guide de démarrage | Salariés en reconversion | freelance, indépendant
Créer sa micro-entreprise étape par étape | Futurs entrepreneurs | micro-entreprise, statut
Trouver ses premiers clients en freelance | Freelances débutants | prospection, clients
Fixer ses tarifs de freelance | Freelances | tarifs, prix
Devenir assistant(e) virtuel(le) | Reconversion | assistante virtuelle
Devenir rédacteur web freelance | Amoureux des mots | rédaction web, SEO
Lancer un side business à côté de son CDI | Salariés | side business, revenus complémentaires
Devenir graphiste freelance avec Canva | Créatifs | graphisme, Canva
Devenir monteur vidéo freelance | Créatifs | montage vidéo, freelance
Devenir traducteur freelance | Bilingues | traduction
Lancer son activité de home organiser | Personnes organisées | home organising
Devenir photographe événementiel | Photographes amateurs | photo, événementiel
Créer son activité de garde d'animaux | Amoureux des animaux | pet sitting
Proposer ses services sur Malt et Fiverr | Freelances | Malt, Fiverr, plateformes
Lancer une activité de ménage / conciergerie | Entrepreneurs | conciergerie, services
Devenir formateur indépendant | Experts métier | formation, formateur
Créer son business de cours particuliers | Étudiants, enseignants | soutien scolaire
Rédiger des devis et factures professionnels | Freelances | devis, factures
Organiser sa semaine de freelance | Freelances | organisation, productivité
Lancer un food truck : étapes clés | Passionnés de cuisine | food truck
Devenir wedding planner | Organisateurs nés | wedding planner
Créer une activité de couture à domicile | Couturières | couture, retouches
`,
  },
  {
    slug: "finances-personnelles",
    name: "Finances personnelles & budget",
    emoji: "💰",
    sensitive: "finance",
    baseDemand: 5,
    baseCompetition: 4,
    price: [5, 12],
    ideas: `
Faire son budget mensuel en 1 heure | Jeunes actifs | budget, gestion
La méthode des enveloppes budgétaires | Familles | enveloppes, cash stuffing
Sortir du découvert en 90 jours | Personnes en difficulté | découvert, budget
Économiser 3000 € en un an : défis d'épargne | Tous publics | défi épargne, économies
Planner budget à imprimer + guide | Tous publics | planner budget, printable
Réduire ses factures : énergie, assurances, abonnements | Foyers | économies, factures
Comprendre ses impôts simplement | Jeunes actifs | impôts, déclaration
Préparer un achat immobilier : budget et étapes | Primo-accédants | achat immobilier, prêt
Gérer son argent en couple | Couples | couple, argent
Apprendre l'argent aux enfants | Parents | éducation financière, enfants
Le minimalisme financier | Adultes | minimalisme, consommation
Constituer son épargne de précaution | Jeunes actifs | épargne, sécurité
Faire ses courses moins cher | Familles | courses, économies
Rembourser ses crédits plus vite (méthode boule de neige) | Endettés | dettes, boule de neige
Organiser ses papiers administratifs | Tous publics | administratif, organisation
Préparer financièrement l'arrivée d'un bébé | Futurs parents | bébé, budget
Budget étudiant : vivre avec peu | Étudiants | étudiant, budget
Voyager plus en dépensant moins | Voyageurs | voyage, économies
Préparer sa retraite : les bases à connaître | Adultes 40+ | retraite, épargne
Les bases de l'éducation financière | Débutants | éducation financière
`,
  },
  {
    slug: "investissement",
    name: "Investissement & patrimoine",
    emoji: "📈",
    sensitive: "finance",
    baseDemand: 4,
    baseCompetition: 4,
    price: [8, 15],
    ideas: `
Investir en bourse pour les débutants : les bases | Débutants | bourse, ETF
Comprendre les ETF et l'investissement passif | Épargnants | ETF, investissement passif
Le PEA expliqué simplement | Épargnants français | PEA, bourse
L'assurance-vie : comprendre avant de signer | Épargnants | assurance-vie
Investir dans l'immobilier locatif : les bases | Futurs investisseurs | immobilier locatif
La colocation comme investissement | Investisseurs immobiliers | colocation
Comprendre les cryptomonnaies et leurs risques | Curieux | crypto, Bitcoin, risques
Les SCPI expliquées | Épargnants | SCPI, pierre papier
Le crowdfunding immobilier : avantages et risques | Investisseurs | crowdfunding
Lire un bilan d'entreprise pour investir | Investisseurs débutants | analyse fondamentale
Investir 100 € par mois : stratégies prudentes | Petits budgets | investissement régulier
Les erreurs classiques des débutants en bourse | Débutants | erreurs, psychologie
Location courte durée : règles et gestion | Propriétaires | location saisonnière
Comprendre l'inflation et protéger son épargne | Épargnants | inflation
Diversifier son patrimoine | Épargnants | diversification
Investir dans l'or et les métaux précieux | Curieux | or, métaux
`,
  },
  {
    slug: "productivite",
    name: "Productivité & organisation",
    emoji: "⏱️",
    sensitive: null,
    baseDemand: 4,
    baseCompetition: 3,
    price: [5, 10],
    ideas: `
Arrêter de procrastiner en 21 jours | Procrastinateurs | procrastination, habitudes
La méthode GTD simplifiée | Actifs débordés | GTD, organisation
Organiser sa vie avec Notion | Étudiants, actifs | Notion, organisation
Planificateur annuel et guide d'objectifs | Tous publics | planner, objectifs, printable
Le time blocking pour gagner 2 heures par jour | Actifs | time blocking, agenda
Construire des habitudes qui durent | Tous publics | habitudes, routines
Organiser son télétravail | Télétravailleurs | télétravail, organisation
La méthode Pomodoro et la concentration profonde | Étudiants | Pomodoro, focus
Bullet journal pour débutants | Créatifs organisés | bullet journal
Fixer et atteindre ses objectifs annuels | Tous publics | objectifs, méthode SMART
Productivité pour personnes TDAH : astuces concrètes | Adultes TDAH | TDAH, organisation
Désencombrer sa boîte mail | Actifs | emails, inbox zero
Organiser sa maison en 30 jours | Familles | rangement, organisation maison
Réussir ses révisions et ses examens | Étudiants | révisions, examens
Prendre des notes efficacement | Étudiants | prise de notes
Gérer ses priorités avec la matrice d'Eisenhower | Managers | priorités
Le guide de la routine du dimanche | Actifs | routine, planification
Lire plus de livres chaque année | Lecteurs | lecture, habitudes
`,
  },
  {
    slug: "developpement-personnel",
    name: "Développement personnel",
    emoji: "🌱",
    sensitive: null,
    baseDemand: 4,
    baseCompetition: 4,
    price: [5, 10],
    ideas: `
Développer sa confiance en soi en 30 jours | Adultes timides | confiance en soi
Prendre la parole en public sans stress | Étudiants, salariés | prise de parole
Vaincre sa timidité | Timides | timidité, sociabilité
L'art de la discipline personnelle | Tous publics | discipline, mental
Trouver sa passion et son ikigai | Adultes en questionnement | ikigai, sens
Communication non violente au quotidien | Tous publics | CNV, communication
Développer son intelligence émotionnelle | Adultes | intelligence émotionnelle
Sortir de sa zone de confort : 50 défis | Jeunes adultes | défis, zone de confort
Préparer une reconversion professionnelle | Salariés | reconversion
Le guide de la lecture rapide | Étudiants, lecteurs | lecture rapide
Améliorer sa mémoire | Étudiants, seniors | mémoire, mnémotechnique
Développer un mindset de croissance | Tous publics | mindset
Mieux gérer ses émotions | Adultes | émotions
Charisme et présence : les bases | Professionnels | charisme
Écrire sa vision de vie et son plan sur 5 ans | Tous publics | vision, plan de vie
Le guide de l'estime de soi | Adultes | estime de soi
Apprendre à négocier | Professionnels | négociation
Le pouvoir des petites habitudes | Tous publics | habitudes
Apprendre à apprendre | Étudiants, autodidactes | apprentissage
`,
  },
  {
    slug: "parentalite",
    name: "Parentalité & enfants",
    emoji: "👶",
    sensitive: "health",
    baseDemand: 5,
    baseCompetition: 3,
    price: [5, 10],
    ideas: `
Routine du coucher apaisée pour enfants | Parents de 2-8 ans | sommeil enfant, coucher
Activités Montessori à la maison 0-3 ans | Jeunes parents | Montessori, éveil
Activités Montessori 3-6 ans | Parents | Montessori, maternelle
L'éducation bienveillante au quotidien | Parents | éducation positive
Gérer les colères de son enfant | Parents de jeunes enfants | colères, émotions
Préparer l'arrivée de bébé : checklist complète | Futurs parents | naissance, checklist
100 activités sans écran pour enfants | Parents | activités, sans écran
Accompagner la propreté en douceur | Parents | propreté, pot
Aider son enfant à faire ses devoirs | Parents d'écoliers | devoirs, école
Organiser un anniversaire enfant réussi | Parents | anniversaire, fête
Apprendre à lire en s'amusant | Parents de 4-6 ans | lecture, apprentissage
Gérer les écrans en famille | Parents | écrans, règles
Tableau de routines et de responsabilités à imprimer | Parents | routines, printable
Devenir parent solo : organisation et soutien | Parents solo | parent solo
Allaitement : guide pratique (avec sages-femmes) | Jeunes mamans | allaitement
Accompagner un enfant hypersensible | Parents | hypersensibilité
Voyager avec des enfants | Familles | voyage, enfants
Activités créatives de Noël en famille | Familles | Noël, bricolage
Préparer l'entrée en maternelle | Parents | maternelle, rentrée
Gérer les disputes entre frères et sœurs | Parents | fratrie
Jeux éducatifs pour apprendre les maths | Parents d'écoliers | maths, jeux
`,
  },
  {
    slug: "animaux",
    name: "Animaux",
    emoji: "🐶",
    sensitive: null,
    baseDemand: 4,
    baseCompetition: 3,
    price: [5, 10],
    ideas: `
Éduquer son chiot en 30 jours | Nouveaux propriétaires de chiot | chiot, éducation canine
Apprendre 20 tours à son chien | Propriétaires de chiens | tours, dressage positif
Comprendre le langage de son chat | Propriétaires de chats | chat, comportement
Adopter un chien : le guide avant de se lancer | Futurs adoptants | adoption, chien
Gérer un chien réactif en promenade | Propriétaires de chiens | réactivité, promenade
Cuisiner des friandises maison pour chien | Propriétaires de chiens | friandises, recettes
Bien accueillir un chat adopté | Adoptants de chats | adoption, chat
Le guide du lapin de compagnie | Propriétaires de lapins | lapin, NAC
Créer son aquarium d'eau douce | Débutants en aquariophilie | aquarium, poissons
Les poules au jardin : guide de démarrage | Jardiniers | poules, basse-cour
Voyager avec son chien | Propriétaires de chiens | voyage, chien
Carnet de santé et de suivi animal à imprimer | Propriétaires d'animaux | carnet, printable
Lancer son activité de toilettage | Reconversion | toilettage
Éduquer son chat à la maison | Propriétaires de chats | chat, éducation
Le guide du cheval pour débutants | Cavaliers débutants | cheval, équitation
Photographier son animal comme un pro | Propriétaires d'animaux | photo animale
`,
  },
  {
    slug: "maison-deco-diy",
    name: "Maison, déco & DIY",
    emoji: "🏡",
    sensitive: null,
    baseDemand: 4,
    baseCompetition: 3,
    price: [5, 10],
    ideas: `
Décorer son appartement avec un petit budget | Locataires | déco, petit budget
Relooker ses meubles : peinture et patine | Bricoleurs | relooking, peinture
Home staging pour vendre ou louer plus vite | Propriétaires | home staging
La méthode KonMari pour ranger sa maison | Familles | rangement, KonMari
Ménage efficace : routine en 15 minutes par jour | Actifs | ménage, routine
Produits ménagers maison et naturels | Écolos | produits naturels, DIY
Décoration de Noël faite maison | Familles | Noël, DIY
Petits travaux de bricolage pour débutants | Débutants | bricolage, outils
Aménager un petit espace | Citadins | petit espace, aménagement
Créer ses bougies parfumées | Créatifs | bougies, DIY
Fabriquer ses savons à froid | Créatifs | savon, saponification
Macramé pour débutants | Créatifs | macramé
Aménager son bureau à la maison | Télétravailleurs | bureau, home office
Peindre un mur comme un pro | Débutants | peinture
Le guide de la déco bohème | Amateurs de déco | bohème, déco
Organiser sa cuisine et ses placards | Familles | cuisine, rangement
Créer des cadeaux faits main | Créatifs | cadeaux, DIY
Planner ménage et entretien maison à imprimer | Familles | planner, ménage, printable
Rénover une salle de bain sans tout casser | Propriétaires | rénovation
Couture pour débutants : premiers projets | Débutants | couture, machine à coudre
Tricot pour débutants | Débutants | tricot
Crochet : amigurumis faciles | Créatifs | crochet, amigurumi
`,
  },
  {
    slug: "jardinage",
    name: "Jardinage & nature",
    emoji: "🌿",
    sensitive: null,
    baseDemand: 4,
    baseCompetition: 2,
    price: [5, 10],
    ideas: `
Créer son potager pour les nuls | Débutants | potager, légumes
Le potager sur balcon | Citadins | balcon, potager urbain
Permaculture : les bases | Jardiniers | permaculture
Calendrier du potager mois par mois | Jardiniers | calendrier, semis
Faire son compost | Écolos | compost
Plantes d'intérieur : les garder en vie | Débutants | plantes vertes
Cultiver ses herbes aromatiques | Cuisiniers | aromatiques
Créer un jardin zen | Propriétaires | jardin japonais
Faire ses propres semis | Jardiniers | semis, graines
Cultiver des tomates comme un pro | Jardiniers | tomates
Le jardin sans arrosage | Jardiniers | sécheresse, paillage
Bouturer ses plantes facilement | Passionnés de plantes | bouturage
Attirer les oiseaux et les insectes au jardin | Amoureux de la nature | biodiversité
Cultiver des champignons à la maison | Curieux | champignons
Carnet de jardin à imprimer | Jardiniers | carnet, printable
Créer un terrarium | Créatifs | terrarium
`,
  },
  {
    slug: "beaute-mode",
    name: "Beauté, mode & style",
    emoji: "💄",
    sensitive: "health",
    baseDemand: 4,
    baseCompetition: 4,
    price: [5, 10],
    ideas: `
Routine skincare selon son type de peau | Femmes 18-40 ans | skincare, peau
Maquillage naturel en 10 minutes | Femmes | maquillage, makeup
Trouver son style vestimentaire | Femmes et hommes | style, garde-robe
La garde-robe capsule | Minimalistes | capsule wardrobe
Prendre soin de ses cheveux bouclés | Cheveux bouclés | curly, cheveux
Cosmétiques maison naturels | Écolos | cosmétiques DIY
Le guide du style masculin | Hommes | style homme
Faire ses ongles comme en institut | Femmes | manucure, nail art
S'habiller selon sa morphologie | Femmes | morphologie
Devenir prothésiste ongulaire : bases du métier | Reconversion | ongles, métier
Coiffures faciles pour cheveux longs | Femmes | coiffures
Colorimétrie : trouver ses couleurs | Femmes | colorimétrie
Mode éthique et seconde main | Consommateurs responsables | seconde main
Routine soins barbe | Hommes barbus | barbe
Maquillage de mariée : guide | Futures mariées | mariage, maquillage
Prendre soin de ses cheveux crépus | Cheveux afro | cheveux afro, routine
`,
  },
  {
    slug: "voyage",
    name: "Voyage & expatriation",
    emoji: "✈️",
    sensitive: null,
    baseDemand: 4,
    baseCompetition: 3,
    price: [5, 12],
    ideas: `
Organiser un road trip en van | Voyageurs | van life, road trip
Voyager seul(e) en toute confiance | Voyageurs solo | voyage solo
Préparer un tour du monde | Grands voyageurs | tour du monde
Partir en PVT au Canada | 18-35 ans | PVT, Canada
S'expatrier : la checklist complète | Futurs expatriés | expatriation
Voyager léger : bagage cabine uniquement | Voyageurs | minimalisme, valise
Trouver des billets d'avion pas chers | Voyageurs | vols, astuces
Itinéraire 10 jours au Japon | Voyageurs | Japon, itinéraire
Itinéraire 2 semaines en Thaïlande | Voyageurs | Thaïlande
Road trip aux États-Unis | Voyageurs | USA, road trip
Devenir nomade digital | Travailleurs en ligne | nomade digital
Voyager avec un petit budget en Europe | Étudiants | Europe, budget
Planner de voyage à imprimer | Voyageurs | planner voyage, printable
Faire du camping pour la première fois | Débutants | camping
Randonnée : préparer son premier trek | Randonneurs | trek, randonnée
Week-ends en France : 30 idées | Couples, familles | France, week-end
Itinéraire 7 jours au Portugal | Voyageurs | Portugal
Itinéraire 10 jours en Italie | Voyageurs | Italie
`,
  },
  {
    slug: "langues-etudes",
    name: "Langues & études",
    emoji: "📚",
    sensitive: null,
    baseDemand: 4,
    baseCompetition: 3,
    price: [5, 12],
    ideas: `
Apprendre l'anglais en 3 mois : méthode | Débutants | anglais, méthode
Anglais pour le voyage : phrases essentielles | Voyageurs | anglais voyage
Anglais professionnel : emails et réunions | Salariés | business english
Apprendre l'espagnol pour débutants | Débutants | espagnol
Apprendre le japonais : hiragana et katakana | Débutants | japonais, kana
Apprendre l'italien en 60 jours | Débutants | italien
Réussir le TOEIC | Étudiants, salariés | TOEIC
Préparer le bac : méthode de révision | Lycéens | bac, révisions
Réussir sa première année de fac | Étudiants | université, méthode
Rédiger un mémoire sans stress | Étudiants | mémoire, rédaction
Apprendre l'arabe : l'alphabet en 30 jours | Débutants | arabe, alphabet
Orthographe et grammaire : les règles essentielles | Adultes | orthographe
Préparer un entretien Parcoursup | Lycéens | Parcoursup
Apprendre l'allemand pour débutants | Débutants | allemand
Apprendre le coréen : hangeul et bases | Fans de K-culture | coréen
Le français pour étrangers (FLE) niveau A1 | Apprenants étrangers | FLE
Méthode de mémorisation du vocabulaire | Apprenants | vocabulaire, flashcards
Apprendre le portugais brésilien | Débutants | portugais
`,
  },
  {
    slug: "carriere-emploi",
    name: "Carrière & emploi",
    emoji: "🎯",
    sensitive: null,
    baseDemand: 4,
    baseCompetition: 3,
    price: [6, 12],
    ideas: `
Rédiger un CV qui décroche des entretiens | Chercheurs d'emploi | CV
Réussir son entretien d'embauche | Candidats | entretien d'embauche
Négocier son salaire | Salariés | négociation salariale
Trouver un emploi grâce à LinkedIn | Chercheurs d'emploi | LinkedIn, emploi
Réussir sa période d'essai | Nouveaux embauchés | période d'essai
Devenir manager : les 90 premiers jours | Nouveaux managers | management
Trouver une alternance | Étudiants | alternance
Changer de métier à 40 ans | Adultes en reconversion | reconversion
Lettre de motivation : modèles et méthode | Candidats | lettre de motivation
Réussir son stage | Étudiants | stage
Les soft skills qui font la différence | Professionnels | soft skills
Gérer un conflit au travail | Salariés | conflit, communication
Préparer un concours de la fonction publique | Candidats | concours, fonction publique
Travailler dans la tech sans coder | Reconversion | tech, métiers
Devenir développeur web : la feuille de route | Reconversion | développeur, code
Réussir ses présentations PowerPoint | Professionnels | présentation
Préparer sa demande d'augmentation | Salariés | augmentation
Trouver un job à l'étranger | Jeunes diplômés | emploi international
`,
  },
  {
    slug: "creativite-arts",
    name: "Créativité & arts",
    emoji: "🎨",
    sensitive: null,
    baseDemand: 4,
    baseCompetition: 3,
    price: [5, 12],
    ideas: `
Apprendre à dessiner en 30 jours | Débutants | dessin
Aquarelle pour débutants | Débutants | aquarelle, peinture
Dessin digital sur iPad avec Procreate | Créatifs | Procreate, digital art
Lettering et calligraphie moderne | Créatifs | lettering, calligraphie
Apprendre la photographie avec son reflex | Photographes débutants | photographie, reflex
Retoucher ses photos avec Lightroom | Photographes | Lightroom, retouche
Apprendre la guitare en 60 jours | Débutants | guitare
Apprendre le piano : les premiers morceaux | Débutants | piano
Composer de la musique sur ordinateur | Musiciens | MAO, home studio
Écrire son premier roman | Auteurs débutants | écriture, roman
Dessiner des personnages manga | Fans de manga | manga, dessin
Peinture acrylique : techniques de base | Débutants | acrylique
Créer sa bande dessinée | Créatifs | BD
Le chant pour débutants | Débutants | chant, voix
Poterie et céramique : débuter chez soi | Créatifs | poterie, argile
Écrire des poèmes et des textes de chansons | Auteurs | écriture, chanson
Photographie culinaire | Blogueurs food | food photo
Créer des illustrations pour enfants | Illustrateurs | illustration
Broderie moderne pour débutants | Créatifs | broderie
Scrapbooking et junk journal | Créatifs | scrapbooking, journal
`,
  },
  {
    slug: "tech-outils",
    name: "Tech & outils numériques",
    emoji: "💻",
    sensitive: null,
    baseDemand: 4,
    baseCompetition: 3,
    price: [6, 14],
    ideas: `
Maîtriser Canva en 7 jours | Débutants | Canva, design
Excel pour les débutants : formules essentielles | Salariés | Excel, formules
Créer son site WordPress sans coder | Entrepreneurs | WordPress, site web
Notion : créer son second cerveau | Étudiants, actifs | Notion, second cerveau
Google Sheets pour gérer son activité | Indépendants | Google Sheets
Créer son site avec un outil no-code | Entrepreneurs | no-code
Apprendre Python pour les débutants | Débutants | Python, code
Protéger sa vie privée en ligne | Tous publics | cybersécurité, vie privée
Le guide de l'informatique pour seniors | Seniors | informatique, débutants
Créer des automatisations sans coder | Indépendants | automatisation, Zapier
Monter un PC gamer | Gamers | PC, montage
Le SEO pour les débutants | Blogueurs, entrepreneurs | SEO, référencement
Créer ses présentations avec Google Slides | Étudiants | Slides
Apprendre le HTML et le CSS | Débutants | HTML, CSS
Maîtriser son smartphone : astuces cachées | Tous publics | smartphone, astuces
Créer un blog rentable | Blogueurs | blog, monétisation
Faire du montage vidéo avec DaVinci Resolve | Créateurs | DaVinci Resolve, montage
Créer une application sans coder | Entrepreneurs | app no-code
`,
  },
  {
    slug: "relations-couple",
    name: "Relations & couple",
    emoji: "❤️",
    sensitive: null,
    baseDemand: 4,
    baseCompetition: 3,
    price: [5, 10],
    ideas: `
Raviver la flamme dans son couple | Couples | couple, complicité
100 idées de rendez-vous en amoureux | Couples | date ideas, rendez-vous
Mieux communiquer dans son couple | Couples | communication, couple
Réussir ses rencontres sur les applis | Célibataires | applis de rencontre
Vivre une relation à distance | Couples à distance | relation à distance
Préparer une demande en mariage inoubliable | Amoureux | demande en mariage
Questions pour mieux se connaître en couple | Couples | questions, jeu
Se faire des amis à l'âge adulte | Adultes | amitié, sociabilité
Gérer les tensions avec sa belle-famille | Couples | belle-famille
Emménager ensemble : guide pratique | Jeunes couples | emménager
Carnet de souvenirs de couple à remplir | Couples | carnet, cadeau, printable
Les langages de l'amour au quotidien | Couples | langages de l'amour
Organiser un week-end romantique | Couples | week-end, romantique
Se reconstruire après un divorce | Personnes divorcées | divorce, reconstruction
`,
  },
  {
    slug: "evenements-fetes",
    name: "Mariage, fêtes & événements",
    emoji: "🎉",
    sensitive: null,
    baseDemand: 4,
    baseCompetition: 3,
    price: [6, 14],
    ideas: `
Organiser son mariage en 12 mois : planning complet | Futurs mariés | mariage, planning
Mariage petit budget : le guide | Futurs mariés | mariage, budget
Écrire son discours de témoin | Témoins | discours, mariage
Organiser un EVJF inoubliable | Témoins, amies | EVJF
Organiser une baby shower | Proches de futurs parents | baby shower
Préparer Noël sans stress | Familles | Noël, organisation
Organiser une fête d'anniversaire adulte | Organisateurs | anniversaire
Jeux et animations pour fêtes de famille | Familles | jeux, animation
Organiser un baptême ou une cérémonie laïque | Parents | baptême, cérémonie
Planner de mariage à imprimer | Futurs mariés | planner, mariage, printable
Décoration de mariage DIY | Futurs mariés | DIY, décoration
Organiser une soirée à thème | Organisateurs | soirée, thème
Organiser une chasse au trésor pour enfants | Parents | chasse au trésor
Halloween en famille : déco, costumes, recettes | Familles | Halloween
`,
  },
  {
    slug: "ecologie-zero-dechet",
    name: "Écologie & zéro déchet",
    emoji: "♻️",
    sensitive: null,
    baseDemand: 3,
    baseCompetition: 2,
    price: [5, 9],
    ideas: `
Passer au zéro déchet en 30 jours | Familles | zéro déchet
Réduire sa facture d'énergie | Foyers | énergie, économies
Une salle de bain zéro déchet | Écolos | salle de bain, DIY
Consommer local et de saison | Consommateurs | local, saison
Vivre de façon plus minimaliste | Adultes | minimalisme
Réparer plutôt que jeter | Bricoleurs | réparation
Récupérer l'eau de pluie et économiser l'eau | Propriétaires | eau, récupération
Des fêtes éco-responsables | Familles | fêtes, éco-responsable
Upcycling : transformer ses vieux vêtements | Créatifs | upcycling, couture
Calendrier des fruits et légumes de saison | Familles | saison, printable
Voyager de manière plus responsable | Voyageurs | voyage responsable
Bébé zéro déchet : couches lavables et astuces | Jeunes parents | couches lavables
`,
  },
  {
    slug: "auto-mobilite",
    name: "Auto, moto & mobilité",
    emoji: "🚗",
    sensitive: null,
    baseDemand: 3,
    baseCompetition: 2,
    price: [5, 12],
    ideas: `
Réussir le code de la route du premier coup | Candidats au permis | code de la route
Réussir son permis de conduire | Candidats au permis | permis, conduite
Entretenir sa voiture soi-même | Automobilistes | entretien auto
Acheter une voiture d'occasion sans se faire avoir | Acheteurs | occasion, achat voiture
Aménager un van pour voyager | Bricoleurs voyageurs | van aménagé
Débuter en moto : choisir et rouler | Futurs motards | moto, A2
Le vélo électrique au quotidien | Citadins | vélo électrique
Conduire de manière économique | Automobilistes | écoconduite
Préparer un long trajet en voiture électrique | Conducteurs de VE | voiture électrique
Entretenir son vélo | Cyclistes | entretien vélo
`,
  },
  {
    slug: "gaming-loisirs",
    name: "Gaming & loisirs",
    emoji: "🎮",
    sensitive: null,
    baseDemand: 3,
    baseCompetition: 2,
    price: [4, 10],
    ideas: `
Lancer sa chaîne gaming | Gamers | gaming, chaîne
Apprendre les échecs : des bases aux tactiques | Débutants | échecs
Créer son jeu de société | Créatifs | jeu de société
Le guide du Rubik's cube | Débutants | Rubik's cube
Organiser une soirée jeux de rôle | Joueurs | jeu de rôle
Pêche pour débutants | Débutants | pêche
Apprendre la magie et les tours de cartes | Curieux | magie, cartes
Le guide de l'escalade en salle | Débutants | escalade
Commencer la randonnée en montagne | Débutants | montagne, randonnée
Créer son jeu vidéo sans coder | Créatifs | création jeu vidéo
`,
  },
  {
    slug: "spiritualite",
    name: "Spiritualité & astrologie",
    emoji: "🔮",
    sensitive: null,
    baseDemand: 4,
    baseCompetition: 3,
    price: [5, 10],
    ideas: `
Lire le tarot pour débutants | Curieux | tarot, cartomancie
Comprendre son thème astral | Passionnés d'astrologie | astrologie, thème astral
La lithothérapie expliquée (approche culturelle) | Curieux | pierres, cristaux
Rituels de la nouvelle lune | Passionnés | lune, rituels
Numérologie : les bases | Curieux | numérologie
Journal de manifestation et d'intentions | Adeptes du développement personnel | manifestation, journaling
Créer son autel et ses rituels du quotidien | Curieux | rituels
Interpréter ses rêves | Curieux | rêves
Le guide des oracles | Passionnés | oracle, cartes
Astrologie et compatibilité amoureuse | Curieux | compatibilité, signes
`,
  },
  {
    slug: "seniors",
    name: "Seniors & retraite",
    emoji: "🧓",
    sensitive: "health",
    baseDemand: 3,
    baseCompetition: 1,
    price: [5, 10],
    ideas: `
Bien préparer son passage à la retraite | Futurs retraités | retraite, transition
Rester en forme après 60 ans | Seniors | gym douce, seniors
Utiliser son smartphone et les applis utiles | Seniors | smartphone, numérique
Écrire ses mémoires et son histoire de vie | Seniors | mémoires, écriture
Stimuler sa mémoire au quotidien | Seniors | mémoire, jeux
Aidant familial : s'organiser et se préserver | Aidants | aidant, organisation
Voyager à la retraite | Retraités | voyage seniors
Devenir grand-parent : activités avec les petits-enfants | Grands-parents | grands-parents, activités
`,
  },
  {
    slug: "droit-demarches",
    name: "Démarches & vie pratique",
    emoji: "📋",
    sensitive: "legal",
    baseDemand: 3,
    baseCompetition: 2,
    price: [5, 10],
    ideas: `
Réussir son déménagement : checklist complète | Personnes qui déménagent | déménagement, checklist
Louer son premier appartement | Jeunes locataires | location, dossier
Constituer un dossier de location solide | Locataires | dossier locataire
Comprendre son bail et ses droits de locataire | Locataires | bail, droits
Préparer un dossier de financement de projet | Porteurs de projet | financement
Organiser une succession : les premières étapes | Familles | succession
Vivre en colocation sereinement | Colocataires | colocation
Préparer une rentrée étudiante loin de chez soi | Étudiants | rentrée, logement
`,
  },
];
