# Movacash

SaaS d'aide à la création d'e-books de formation à vendre sur Etsy :
catalogue d'idées (sans API), génération du contenu avec Gemini, export PDF prêt à vendre,
kit de fiche Etsy avec vérification de conformité, abonnement Stripe.

## Démarrage

```bash
npm install
cp .env.example .env.local   # puis compléter les clés
npm run dev                  # http://localhost:3000
```

Sans clés, l'application tourne en **mode démo** :
- pas de `GEMINI_API_KEY` → les e-books contiennent un texte d'exemple (toute la chaîne est testable : plan, chapitres, PDF, fiche Etsy) ;
- pas de `STRIPE_SECRET_KEY` → l'abonnement s'active sans paiement.

La base SQLite (`data/movacash.db`) est créée et remplie automatiquement au premier lancement.

## Parcours

1. `/` landing → `/quiz` (4 questions + thématiques) → idées personnalisées tirées de la base
2. `/inscription` (acceptation des CGV) → `/tarifs` (paywall, case de renonciation au droit de rétractation)
3. `/app/idees` : recherche plein texte, filtres (catégorie, difficulté, potentiel, concurrence, sujets sensibles, favoris), tri
4. `/app/nouveau` : sujet, public, langue (fr/en/es/de/it), ton, nombre de chapitres, consignes
5. `/app/ebooks/[id]` : génération chapitre par chapitre (pilotée par le navigateur pour éviter les timeouts serveur), relecture/édition, régénération, couverture (3 styles, palettes), fiche Etsy (titre ≤140, 13 tags ≤20 car., description avec mention IA), 3 visuels de fiche 2000×1500, export PDF A4/A5/US Letter

## Qualité et conformité (Etsy)

- Plan puis chapitres de 1800 à 2500 mots, avec méthode pas à pas, exemple, exercice ou check-list, encadré « À retenir », plan d'action final.
- Consigne système : pas de remplissage, pas de statistiques ni témoignages inventés, pas de promesse garantie.
- Sujets sensibles (santé, argent, juridique) : prompts plus prudents + avertissement dans le PDF et vérification dans la fiche.
- Mention de l'usage de l'IA dans le PDF (page de droits) et dans la description Etsy.
- Vérificateur de fiche : longueur du titre, tags, mention IA, promesses excessives, marques citées, format numérique.

## Catalogue d'idées

- Source : `data/ideas-catalog.mjs` (537 idées, 31 catégories). Format d'une ligne : `Titre | Public | mots-clés`.
- `npm run seed` ajoute les nouvelles idées du fichier ; `npm run seed -- --reset` recharge tout le catalogue.
- `npm run import-ideas -- fichier.csv` importe en masse (colonnes `titre;categorie_slug;public;mots_cles;prix_min;prix_max`) pour monter à 10 000+ idées. La recherche utilise un index FTS5, prévu pour ce volume.
- Potentiel, concurrence et difficulté sont des **estimations éditoriales**, affichées comme telles.

## Stripe

1. Créer 3 produits avec un prix récurrent mensuel (Starter 19 €, Pro 39 €, Business 79 € : modifiables dans `lib/config.ts`).
2. Renseigner `STRIPE_SECRET_KEY`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS`.
3. Webhook vers `https://votre-domaine/api/stripe/webhook` avec les événements `checkout.session.completed`, `customer.subscription.created|updated|deleted`, puis `STRIPE_WEBHOOK_SECRET`.
4. Activer le portail client Stripe (résiliation, factures) dans le dashboard.

## Gemini

`GEMINI_API_KEY` (Google AI Studio) et `GEMINI_MODEL` (défaut `gemini-2.5-flash`). Un e-book de 9 chapitres fait environ 11 appels.

## Déploiement

SQLite nécessite un disque persistant : VPS, Railway, Render ou Fly.io avec volume monté, `DATABASE_PATH` pointant dessus.
Définir `AUTH_SECRET` (chaîne aléatoire longue) et `NEXT_PUBLIC_APP_URL`. Pour un hébergement serverless (Vercel), il faudra passer la base sur Postgres.

## À faire avant la mise en ligne

- Compléter les mentions légales, CGV et politique de confidentialité (éléments entre crochets) et les faire valider par un juriste.
- Vérifier les règles Etsy en vigueur : https://www.etsy.com/legal/creativity
