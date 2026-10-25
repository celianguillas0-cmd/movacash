# Mise en ligne de Movacash

Tout fonctionne déjà en mode démo. Pour le lancement, il reste à brancher 5 services et à coller leurs clés dans Vercel (Settings → Environment Variables). Ne colle jamais une clé dans une conversation.

## 1. Base de données : Neon, directement dans Vercel (gratuit au démarrage)

1. Dans ton projet Vercel : onglet **Storage** → **Create Database** → **Neon** (Serverless Postgres) → région **Frankfurt** (la plus proche) → plan gratuit → **Create**.
2. À l'étape suivante, laisse le projet Movacash coché et clique **Connect**. Vercel ajoute tout seul la variable `DATABASE_URL` : aucune clé à copier.
3. Onglet **Deployments** → sur le dernier déploiement, menu **⋯** → **Redeploy**.

Les tables et les 537 idées sont créées automatiquement à la première visite du site. Sans base branchée, le site s'affiche quand même en démonstration, mais les comptes sont effacés régulièrement (un bandeau le signale dans l'espace client).

## 2. Site : Vercel

1. Crée le projet sur ton compte Vercel Pro (indépendant de tes autres projets).
2. Variables à ajouter :
   - `AUTH_SECRET` (conseillé) : une longue chaîne aléatoire (au moins 32 caractères, par exemple générée par un gestionnaire de mots de passe).
   - `NEXT_PUBLIC_APP_URL` : l'adresse finale du site, par exemple `https://movacash.fr` (sans / à la fin).
   - `SUPPORT_EMAIL` : l'adresse de contact affichée dans la page Aide.
3. Branche ton nom de domaine (Settings → Domains).

Le code arrive dans Vercel depuis le dépôt GitHub : chaque modification poussée sur `main` est redéployée automatiquement.

## 3. Génération : Gemini

1. Sur aistudio.google.com, crée une clé API sur un projet avec la facturation activée (sinon les quotas gratuits bloquent vite).
2. Dans Vercel : `GEMINI_API_KEY`. `GEMINI_MODEL` peut rester vide (gemini-2.5-flash par défaut).
3. Coût estimé : environ 0,12 € par e-book.

## 4. Paiement : Stripe

1. Produits (Catalogue de produits), un par offre, prix récurrents en EUR :
   - Starter : 19,90 € / mois (et 119,40 € / an : l'annuel est à −50 %)
   - Pro : 39,90 € / mois (et 239,40 € / an)
   - Business : 79,90 € / mois (et 479,40 € / an)
2. Copie chaque identifiant de prix (`price_...`) dans Vercel : `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS`, et pour l'annuel `STRIPE_PRICE_STARTER_ANNUAL`, `STRIPE_PRICE_PRO_ANNUAL`, `STRIPE_PRICE_BUSINESS_ANNUAL`. Sans les trois prix annuels, le choix « Annuel » est simplement masqué.
3. Développeurs → Clés API : `STRIPE_SECRET_KEY` (commence par `sk_live_` en production, `sk_test_` pour tester).
4. Développeurs → Webhooks → Ajouter un endpoint : `https://ton-domaine/api/stripe/webhook`, événements :
   `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`.
   Copie la clé de signature dans `STRIPE_WEBHOOK_SECRET`.
5. Paramètres → Facturation → Portail client : activer, autoriser la mise à jour du moyen de paiement et l'historique des factures. Le changement d'offre et la résiliation se font dans Movacash.
6. Paramètres → Facturation → Abonnements : activer les relances automatiques des paiements échoués (« Smart Retries ») et les e-mails de reçu.

## 5. E-mails : Resend (gratuit jusqu'à 3 000 e-mails par mois), obligatoire avant d'ouvrir les ventes

Sert au « mot de passe oublié » et aux e-mails exigés par la loi : confirmation d'abonnement, confirmation de résiliation, rappel avant le renouvellement d'un abonnement annuel (envoyé chaque matin par une tâche Vercel, entre 60 et 30 jours avant la date).
1. Crée un compte sur resend.com et vérifie ton domaine (quelques enregistrements DNS à ajouter chez ton registrar).
2. Dans Vercel : `RESEND_API_KEY` et `EMAIL_FROM` (par exemple `Movacash <bonjour@movacash.fr>`).
3. Facultatif : `CRON_SECRET` (une longue chaîne aléatoire) pour protéger la tâche du matin.

## 6. Légal : à remplir dans Vercel, pas dans le code

Ajoute ces variables (Settings → Environment Variables), puis redéploie. Tant qu'il en manque, les pages affichent « [à compléter] » et l'onglet Admin les liste.
- `LEGAL_NOM` : ton prénom, ton nom et la mention EI (ex. « Aurèle Martin EI »)
- `LEGAL_SIRET` : ton SIRET
- `LEGAL_ADRESSE` : ton adresse postale, ou celle d'une société de domiciliation si tu ne veux pas afficher la tienne
- `LEGAL_EMAIL` : l'e-mail de contact (sinon `SUPPORT_EMAIL`)
- `LEGAL_TELEPHONE` : un numéro de téléphone (obligatoire dans les mentions légales)
- `MEDIATEUR_NOM`, `MEDIATEUR_SITE` (et si tu veux `MEDIATEUR_ADRESSE`) : ton médiateur de la consommation. L'adhésion est obligatoire pour vendre aux particuliers (compte quelques dizaines d’euros par an selon le médiateur ; liste des médiateurs agréés sur economie.gouv.fr, rubrique médiation de la consommation).

Dans Stripe : Radar → Règles, bloque les paiements dont le pays de la carte n'est pas dans l'Union européenne (le site bloque déjà les visiteurs hors UE, la règle Stripe ferme la porte aux VPN).

Seuil de TVA : en franchise (art. 293 B), surveille ton chiffre d'affaires total et, à part, tes ventes à des particuliers d'autres pays de l'UE. Au-delà de 10 000 € par an de ventes vers les autres pays de l'UE, la TVA du pays du client s'applique (déclaration par le guichet unique OSS).

Fais relire les CGV par un professionnel avant d'ouvrir si tu le peux.

## 7. Test final avant d'ouvrir

En mode test Stripe (`sk_test_`, carte `4242 4242 4242 4242`) :
1. Faire le questionnaire, créer un compte, payer Starter.
2. Créer un e-book jusqu'au bout, télécharger le PDF.
3. Abonnement : passer à Pro (paiement de la différence), revenir à Starter, résilier puis réactiver.
4. Paramètres : changer le mot de passe, tester « Mot de passe oublié » (l'e-mail doit arriver).
5. Vérifier dans Stripe que les factures et le statut de l'abonnement correspondent.

Puis remplacer les clés de test par les clés live (et refaire le webhook en mode live).
