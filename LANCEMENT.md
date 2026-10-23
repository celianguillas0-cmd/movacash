# Mise en ligne de Movacash

Tout fonctionne déjà en mode démo. Pour le lancement, il reste à brancher 5 services et à coller leurs clés dans Vercel (Settings → Environment Variables). Ne colle jamais une clé dans une conversation.

## 1. Base de données : Turso (gratuit au démarrage)

1. Crée un compte sur turso.tech, puis une base (région la plus proche : Paris ou Francfort).
2. Récupère l'URL de la base (commence par `libsql://`) et crée un jeton (« Create token »).
3. Dans Vercel : `TURSO_DATABASE_URL` = l'URL, `TURSO_AUTH_TOKEN` = le jeton.

Les tables et les 537 idées sont créées automatiquement à la première visite du site.

## 2. Site : Vercel

1. Crée le projet sur ton compte Vercel Pro (indépendant de tes autres projets).
2. Variables à ajouter :
   - `AUTH_SECRET` : une longue chaîne aléatoire (au moins 32 caractères, par exemple générée par un gestionnaire de mots de passe).
   - `NEXT_PUBLIC_APP_URL` : l'adresse finale du site, par exemple `https://movacash.fr` (sans / à la fin).
   - `SUPPORT_EMAIL` : l'adresse de contact affichée dans la page Aide.
3. Branche ton nom de domaine (Settings → Domains).

Le code doit arriver dans Vercel par un dépôt GitHub (le plus simple) : je peux le préparer quand tu seras prêt.

## 3. Génération : Gemini

1. Sur aistudio.google.com, crée une clé API sur un projet avec la facturation activée (sinon les quotas gratuits bloquent vite).
2. Dans Vercel : `GEMINI_API_KEY`. `GEMINI_MODEL` peut rester vide (gemini-2.5-flash par défaut).
3. Coût estimé : environ 0,12 € par e-book.

## 4. Paiement : Stripe

1. Produits (Catalogue de produits), un par offre, prix récurrents en EUR :
   - Starter : 19,90 € / mois (et 190,80 € / an si tu proposes l'annuel)
   - Pro : 39,90 € / mois (et 382,80 € / an)
   - Business : 79,90 € / mois (et 766,80 € / an)
2. Copie chaque identifiant de prix (`price_...`) dans Vercel : `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS`, et pour l'annuel `STRIPE_PRICE_STARTER_ANNUAL`, `STRIPE_PRICE_PRO_ANNUAL`, `STRIPE_PRICE_BUSINESS_ANNUAL`. Sans les trois prix annuels, le choix « Annuel » est simplement masqué.
3. Développeurs → Clés API : `STRIPE_SECRET_KEY` (commence par `sk_live_` en production, `sk_test_` pour tester).
4. Développeurs → Webhooks → Ajouter un endpoint : `https://ton-domaine/api/stripe/webhook`, événements :
   `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`.
   Copie la clé de signature dans `STRIPE_WEBHOOK_SECRET`.
5. Paramètres → Facturation → Portail client : activer, autoriser la mise à jour du moyen de paiement et l'historique des factures. Le changement d'offre et la résiliation se font dans Movacash.
6. Paramètres → Facturation → Abonnements : activer les relances automatiques des paiements échoués (« Smart Retries ») et les e-mails de reçu.

## 5. E-mails : Resend (gratuit jusqu'à 3 000 e-mails par mois)

Sert au « mot de passe oublié ».
1. Crée un compte sur resend.com et vérifie ton domaine (quelques enregistrements DNS à ajouter chez ton registrar).
2. Dans Vercel : `RESEND_API_KEY` et `EMAIL_FROM` (par exemple `Movacash <bonjour@movacash.fr>`).

## 6. Légal

Complète les éléments entre crochets dans les mentions légales, les CGV et la politique de confidentialité (nom, SIRET, adresse, e-mail, médiateur de la consommation, durée de conservation), et fais-les relire.

## 7. Test final avant d'ouvrir

En mode test Stripe (`sk_test_`, carte `4242 4242 4242 4242`) :
1. Faire le questionnaire, créer un compte, payer Starter.
2. Créer un e-book jusqu'au bout, télécharger le PDF.
3. Abonnement : passer à Pro (paiement de la différence), revenir à Starter, résilier puis réactiver.
4. Paramètres : changer le mot de passe, tester « Mot de passe oublié » (l'e-mail doit arriver).
5. Vérifier dans Stripe que les factures et le statut de l'abonnement correspondent.

Puis remplacer les clés de test par les clés live (et refaire le webhook en mode live).
