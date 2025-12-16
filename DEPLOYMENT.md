# 🚀 Guide de Déploiement ReplyFast AI

## ⚡ Déploiement Rapide (15 minutes)

### 1️⃣ Prérequis

- [ ] Compte Supabase (gratuit)
- [ ] Compte Stripe (mode test gratuit)
- [ ] Compte Render (gratuit)
- [ ] Clé API OpenAI
- [ ] Instance WAHA (Docker ou hébergé)

---

## 📦 Étape 1: Supabase

### 1. Créer un projet Supabase
- Aller sur https://supabase.com
- Créer un nouveau projet
- Noter l'URL et l'ANON_KEY

### 2. Exécuter le schéma SQL
- Aller dans SQL Editor
- Copier le contenu de `database-schema.sql`
- Exécuter

### 3. Configurer l'authentification
- Aller dans Authentication > Settings
- Activer Email provider
- Configurer l'URL du site: `https://votre-app.onrender.com`

---

## 💳 Étape 2: Stripe

### 1. Créer un compte Stripe
- Aller sur https://stripe.com
- Créer un compte (mode test)

### 2. Créer le produit
- Aller dans Products
- Créer 1 produit:
  - **ReplyFast AI - Mensuel**: 19.99€/mois (recurring)
- Noter le Price ID (price_...)

### 3. Récupérer les clés
- Aller dans Developers > API keys
- Noter la Secret key (sk_test_...)
- Noter la Publishable key (pk_test_...)

### 4. Configurer le webhook (après déploiement)
- Aller dans Developers > Webhooks
- Ajouter un endpoint: `https://votre-app.onrender.com/api/stripe/webhook`
- Sélectionner les événements:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- Noter le Signing secret (whsec_...)

---

## 🤖 Étape 3: OpenAI

### 1. Créer une clé API
- Aller sur https://platform.openai.com
- Créer une API key
- Noter la clé (sk-...)

---

## 📱 Étape 4: WAHA

### Option A: Docker local
\`\`\`bash
docker run -d -p 3000:3000 --name waha devlikeapro/waha
\`\`\`

### Option B: Hébergement cloud
- Déployer WAHA sur Render/Railway/Fly.io
- Noter l'URL et l'API key

---

## 🌐 Étape 5: Render

### 1. Connecter le dépôt GitHub
- Aller sur https://render.com
- Créer un nouveau Web Service
- Connecter votre dépôt GitHub

### 2. Configuration
- **Name**: replyfast-ai
- **Environment**: Node
- **Region**: Frankfurt (ou proche de vous)
- **Branch**: main
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start`

### 3. Variables d'environnement

Ajouter toutes ces variables:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_...

# WAHA
WAHA_API_URL=http://votre-waha:3000
WAHA_API_KEY=votre-api-key
NEXT_PUBLIC_WAHA_API_URL=http://votre-waha:3000
NEXT_PUBLIC_WAHA_API_KEY=votre-api-key

# App
NEXT_PUBLIC_APP_URL=https://votre-app.onrender.com
\`\`\`

### 4. Déployer
- Cliquer sur "Create Web Service"
- Attendre 5-10 minutes

---

## ✅ Étape 6: Vérification

### 1. Tester l'application
- [ ] Ouvrir `https://votre-app.onrender.com`
- [ ] Créer un compte
- [ ] Compléter l'onboarding
- [ ] Scanner le QR code WAHA
- [ ] Envoyer un message test depuis WhatsApp
- [ ] Vérifier que le bot répond

### 2. Tester Stripe
- [ ] Aller sur `/billing`
- [ ] Cliquer sur "Commencer l'essai gratuit"
- [ ] Utiliser une carte test: `4242 4242 4242 4242`
- [ ] Vérifier que l'abonnement est créé

### 3. Finaliser le webhook Stripe
- Retourner dans Stripe > Webhooks
- Ajouter l'URL finale: `https://votre-app.onrender.com/api/stripe/webhook`
- Copier le Signing secret
- Mettre à jour la variable `STRIPE_WEBHOOK_SECRET` dans Render

---

## 🔧 Dépannage

### L'application ne démarre pas
- Vérifier les logs dans Render
- Vérifier que toutes les variables d'environnement sont définies
- Vérifier que le build a réussi

### Le QR code ne s'affiche pas
- Vérifier que WAHA est accessible
- Vérifier l'URL et l'API key WAHA
- Vérifier les logs de `/api/waha/get-qr`

### Le bot ne répond pas
- Vérifier que le webhook WAHA pointe vers `https://votre-app.onrender.com/api/waha/webhook`
- Vérifier la clé OpenAI
- Vérifier les logs de `/api/bot/process-message`

### Stripe ne fonctionne pas
- Vérifier que le webhook Stripe est configuré
- Vérifier le Signing secret
- Vérifier les logs de `/api/stripe/webhook`

---

## 🎯 Checklist finale

- [ ] Application accessible
- [ ] Inscription fonctionne
- [ ] Onboarding fonctionne
- [ ] QR code WAHA s'affiche
- [ ] Bot répond aux messages
- [ ] Calendrier RDV fonctionne
- [ ] Stripe fonctionne
- [ ] Webhook Stripe configuré
- [ ] Analytics affiche des données
- [ ] Menu Manager fonctionne

---

## 🚀 Passer en production

### 1. Stripe
- Activer le mode production dans Stripe
- Créer de nouveaux produits en mode live
- Mettre à jour les clés API (sk_live_..., pk_live_...)
- Reconfigurer le webhook en mode live

### 2. Domaine personnalisé
- Acheter un domaine (ex: replyfast.ai)
- Configurer dans Render > Settings > Custom Domain
- Mettre à jour `NEXT_PUBLIC_APP_URL`

### 3. Monitoring
- Activer les alertes dans Render
- Configurer Sentry pour le monitoring d'erreurs
- Configurer Google Analytics

---

## 📊 Métriques de succès

Après 1 mois, vous devriez avoir:
- ✅ 100+ utilisateurs inscrits
- ✅ 50+ utilisateurs actifs
- ✅ 10+ abonnements payants
- ✅ 1000+ messages traités
- ✅ 200+ RDV pris automatiquement

---

## 💰 Estimation des coûts

### Gratuit (jusqu'à 100 utilisateurs)
- Render: Plan gratuit
- Supabase: Plan gratuit (500 MB)
- Stripe: Gratuit (commission 1.4% + 0.25€)
- OpenAI: ~50€/mois (usage modéré)

### Production (1000 utilisateurs)
- Render: 25€/mois (Starter)
- Supabase: 25€/mois (Pro)
- Stripe: Commission uniquement
- OpenAI: ~500€/mois
- **Total: ~550€/mois**

### Revenus estimés (1000 utilisateurs, 10% conversion)
- 100 abonnements × 19.99€ = **1 999€/mois**
- **Marge: ~1 450€/mois** 🚀

---

## 🎉 Félicitations !

Votre SaaS ReplyFast AI est maintenant en ligne !

**Prochaines étapes:**
1. Créer du contenu marketing
2. Lancer une campagne publicitaire
3. Contacter des commerçants locaux
4. Optimiser le SEO
5. Ajouter des fonctionnalités demandées

**Besoin d'aide ?** support@replyfast.ai
