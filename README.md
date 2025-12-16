# 🚀 ReplyFast AI - SaaS Bot WhatsApp

**Version 2.0 - Reconstruction complète**

Un SaaS professionnel permettant aux commerçants d'automatiser leurs réponses WhatsApp Business avec l'IA, de prendre des rendez-vous automatiquement et d'analyser leurs performances.

---

## ✨ Fonctionnalités

### 🤖 Bot IA Intelligent
- Réponses automatiques 24/7 avec GPT-4o-mini
- Détection automatique des demandes de RDV
- Extraction intelligente (date, heure, service, nom)
- Personnalisation par secteur d'activité (19 secteurs)
- Contexte de conversation (20 derniers messages)

### 📅 Gestion RDV
- Calendrier visuel avec react-big-calendar
- Vérification automatique des créneaux occupés
- Liste d'attente si créneau pris
- Statuts: pending, confirmed, cancelled, completed
- Modal détails avec actions rapides

### 💬 Conversations
- Chat en temps réel avec Supabase Realtime
- Renommage des clients
- Recherche conversations
- Compteur messages non lus
- Envoi manuel via WAHA

### 📊 Analytics
- Graphiques quotidiens (conversations + RDV)
- KPIs: taux de conversion, taux de réponse
- Heures de pointe
- Top services demandés
- Filtres par période (7, 30, 90 jours)

### 🍽️ Menu Manager
- Gestion produits/services (CRUD complet)
- Offres spéciales avec dates de validité
- Calcul automatique du % de réduction
- Catégories personnalisables

### 💡 Market Insights
- Analyse IA du marché avec GPT-4o-mini
- Tendances identifiées
- Comportement clients
- Opportunités de croissance
- Recommandations stratégiques

### 💳 Paiements Stripe
- 1 plan unique (Mensuel 19.99€)
- 30 jours d'essai gratuit automatique
- Checkout sécurisé
- Webhook pour événements (paiement, abonnement)
- Portail de gestion client

### 🔐 Authentification
- Inscription/Connexion avec Supabase Auth
- Récupération mot de passe
- Onboarding simplifié (3 étapes)
- Gestion profil et paramètres

### 📱 WhatsApp WAHA
- Connexion en 1 clic avec QR code
- Vérification automatique du statut
- Webhook pour recevoir messages
- Envoi messages automatique

---

## 🛠️ Stack Technique

### Frontend
- **Next.js 14** - Framework React
- **Tailwind CSS** - Styling moderne
- **Lucide React** - Icônes
- **react-big-calendar** - Calendrier
- **moment.js** - Gestion dates

### Backend
- **Supabase** - Base de données PostgreSQL + Auth + Realtime
- **WAHA** - API WhatsApp Business
- **OpenAI GPT-4o-mini** - Intelligence artificielle
- **Stripe** - Paiements et abonnements

### Déploiement
- **Render** - Hébergement application
- **Supabase Cloud** - Base de données
- **Stripe** - Paiements

---

## 📦 Installation

### 1. Cloner le projet

\`\`\`bash
git clone https://github.com/votre-repo/replyfast-v2.git
cd replyfast-v2
\`\`\`

### 2. Installer les dépendances

\`\`\`bash
pnpm install
\`\`\`

### 3. Configurer les variables d'environnement

Créer un fichier \`.env.local\` :

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_...

# WAHA
WAHA_API_URL=http://localhost:3000
WAHA_API_KEY=votre-api-key
NEXT_PUBLIC_WAHA_API_URL=http://localhost:3000
NEXT_PUBLIC_WAHA_API_KEY=votre-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3001
\`\`\`

### 4. Créer les tables Supabase

Exécuter le fichier \`database-schema.sql\` dans l'éditeur SQL de Supabase.

### 5. Lancer l'application

\`\`\`bash
pnpm dev
\`\`\`

L'application sera disponible sur http://localhost:3001

---

## 🚀 Déploiement sur Render

### 1. Créer un nouveau Web Service

- Connecter votre dépôt GitHub
- Build Command: \`pnpm install && pnpm build\`
- Start Command: \`pnpm start\`
- Environment: Node

### 2. Configurer les variables d'environnement

Ajouter toutes les variables du fichier \`.env.local\` dans Render.

### 3. Configurer le webhook Stripe

Une fois déployé, configurer le webhook Stripe :
- URL: \`https://votre-app.onrender.com/api/stripe/webhook\`
- Événements: \`checkout.session.completed\`, \`customer.subscription.*\`, \`invoice.payment_*\`

---

## 📊 Structure du projet

\`\`\`
replyfast-v2/
├── pages/
│   ├── api/
│   │   ├── bot/
│   │   │   └── process-message.js    # Bot IA
│   │   ├── stripe/
│   │   │   ├── create-checkout-session.js
│   │   │   ├── create-portal-session.js
│   │   │   └── webhook.js
│   │   └── waha/
│   │       ├── start-session.js
│   │       ├── get-qr.js
│   │       ├── check-status.js
│   │       └── webhook.js
│   ├── analytics.js              # Page Analytics
│   ├── appointments.js           # Page Rendez-vous
│   ├── billing.js                # Page Tarifs
│   ├── conversations.js          # Page Conversations
│   ├── dashboard.js              # Dashboard principal
│   ├── index.js                  # Landing page
│   ├── login.js                  # Connexion
│   ├── market-insights.js        # Market Insights
│   ├── menu.js                   # Menu Manager
│   ├── onboarding.js             # Onboarding
│   ├── settings.js               # Paramètres
│   ├── signup.js                 # Inscription
│   └── waha-setup.js             # Configuration WAHA
├── components/
│   └── DashboardLayout.js        # Layout dashboard
├── lib/
│   ├── supabase.js               # Client Supabase
│   └── sectors.js                # Secteurs d'activité
├── styles/
│   └── globals.css               # Styles globaux
├── database-schema.sql           # Schéma base de données
├── package.json
└── README.md
\`\`\`

---

## 🔑 Fonctionnalités clés

### Bot IA
Le bot utilise GPT-4o-mini pour :
1. Comprendre les messages clients
2. Détecter les demandes de RDV
3. Extraire date, heure, service, nom
4. Vérifier les créneaux disponibles
5. Créer automatiquement les RDV
6. Gérer la liste d'attente

### Calendrier RDV
- Vue mensuelle/hebdomadaire/quotidienne
- Couleurs par statut
- Clic sur événement = modal détails
- Actions: confirmer, annuler, supprimer

### Stripe
- Essai gratuit 30 jours automatique
- Webhook pour synchroniser les statuts
- Portail client pour gérer l'abonnement
- Historique paiements dans Supabase

---

## 🐛 Troubleshooting

### Le QR code WAHA ne s'affiche pas
- Vérifier que WAHA est bien lancé
- Vérifier l'URL et l'API key dans \`.env.local\`
- Vérifier les logs de l'API \`/api/waha/get-qr\`

### Le bot ne répond pas
- Vérifier que le webhook WAHA est bien configuré
- Vérifier la clé OpenAI
- Vérifier les logs de \`/api/waha/webhook\` et \`/api/bot/process-message\`

### Stripe ne fonctionne pas
- Vérifier les clés Stripe (test vs production)
- Vérifier que le webhook Stripe est configuré
- Vérifier le secret du webhook

---

## 📝 TODO

- [ ] Mode sombre complet
- [ ] Export données (CSV, PDF)
- [ ] Automatisations (rappels RDV, feedback)
- [ ] Système de tags pour conversations
- [ ] Multi-langue (FR/EN/ES)
- [ ] Intégration Google Calendar
- [ ] Réponses vocales WhatsApp
- [ ] Programme de fidélité

---

## 📄 Licence

Propriétaire - Tous droits réservés

---

## 👨‍💻 Auteur

Créé avec ❤️ par Manus AI

**Contact:** support@replyfast.ai
