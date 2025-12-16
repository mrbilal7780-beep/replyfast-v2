import Link from 'next/link'
import { Bot, Zap, Calendar, MessageSquare, BarChart3, Clock, CheckCircle, ArrowRight, Star } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ReplyFast AI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium">
              Connexion
            </Link>
            <Link href="/signup" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
              Essai gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full mb-8">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-semibold">Automatisez vos réponses WhatsApp avec l'IA</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Votre assistant IA
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              disponible 24/7
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
            ReplyFast AI répond automatiquement à vos clients sur WhatsApp, prend des rendez-vous et booste votre chiffre d'affaires. Sans effort.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/signup" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all text-lg">
              Commencer gratuitement
              <ArrowRight className="inline-block ml-2 w-5 h-5" />
            </Link>
            <Link href="#demo" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-4 px-8 rounded-lg border-2 border-gray-200 dark:border-gray-700 transition-all text-lg">
              Voir la démo
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>30 jours gratuits</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Sans carte bancaire</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Annulation à tout moment</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Une solution complète pour automatiser votre relation client
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Bot}
              title="IA Ultra Intelligente"
              description="GPT-4o comprend vos clients et répond comme un humain, adapté à votre secteur d'activité."
              color="blue"
            />
            <FeatureCard
              icon={Calendar}
              title="Prise de RDV Automatique"
              description="L'IA détecte les demandes de rendez-vous et les planifie automatiquement dans votre calendrier."
              color="purple"
            />
            <FeatureCard
              icon={MessageSquare}
              title="WhatsApp Business"
              description="Connectez votre WhatsApp Business en 1 clic et laissez l'IA gérer vos conversations."
              color="green"
            />
            <FeatureCard
              icon={BarChart3}
              title="Analytics Avancés"
              description="Suivez vos performances en temps réel : taux de conversion, heures de pointe, services populaires."
              color="orange"
            />
            <FeatureCard
              icon={Clock}
              title="Disponible 24/7"
              description="Votre bot ne dort jamais. Répondez à vos clients même la nuit et le week-end."
              color="indigo"
            />
            <FeatureCard
              icon={Zap}
              title="Réponse Instantanée"
              description="Temps de réponse < 1 seconde. Vos clients n'attendent plus jamais."
              color="yellow"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              3 étapes simples pour automatiser votre business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <StepCard
              number="1"
              title="Créez votre compte"
              description="Inscrivez-vous en 2 minutes et configurez votre secteur d'activité."
            />
            <StepCard
              number="2"
              title="Connectez WhatsApp"
              description="Scannez un QR code avec votre WhatsApp Business. C'est tout !"
            />
            <StepCard
              number="3"
              title="Laissez l'IA travailler"
              description="Votre bot répond automatiquement et prend des rendez-vous 24/7."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Des milliers de commerçants utilisent déjà ReplyFast AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Marie D."
              role="Coiffeuse"
              text="J'ai gagné 15h par semaine ! Le bot prend mes RDV pendant que je travaille. Magique !"
              rating={5}
            />
            <TestimonialCard
              name="Thomas L."
              role="Restaurateur"
              text="Mes réservations ont augmenté de 40% depuis que j'utilise ReplyFast AI. Incroyable !"
              rating={5}
            />
            <TestimonialCard
              name="Sophie M."
              role="Coach sportif"
              text="Mes clients adorent la réactivité. Je ne perds plus jamais un client potentiel."
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Tarifs simples et transparents
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              30 jours d'essai gratuit • Sans engagement
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <PricingCard
              name="Mensuel"
              price="19.99"
              popular
              features={[
                'Messages illimités',
                'Rendez-vous illimités',
                'Bot IA GPT-4o-mini',
                'WhatsApp Business',
                'Calendrier RDV',
                'Analytics complets',
                'Menu Manager',
                'Support email'
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Prêt à automatiser votre business ?
          </h2>
          <p className="text-xl text-blue-100 mb-12">
            Rejoignez des milliers de commerçants qui ont déjà automatisé leurs réponses WhatsApp
          </p>
          <Link href="/signup" className="inline-block bg-white hover:bg-gray-100 text-blue-600 font-bold py-4 px-12 rounded-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all text-lg">
            Commencer gratuitement
            <ArrowRight className="inline-block ml-2 w-5 h-5" />
          </Link>
          <p className="text-blue-100 mt-6">
            ✓ 30 jours gratuits • ✓ Sans carte bancaire • ✓ Annulation à tout moment
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold">ReplyFast AI</span>
              </div>
              <p className="text-sm">
                Automatisez vos réponses WhatsApp avec l'intelligence artificielle.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features">Fonctionnalités</Link></li>
                <li><Link href="#pricing">Tarifs</Link></li>
                <li><Link href="/billing">Essai gratuit</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#">À propos</Link></li>
                <li><Link href="#">Blog</Link></li>
                <li><Link href="#">Carrières</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#">Centre d'aide</Link></li>
                <li><Link href="#">Contact</Link></li>
                <li><Link href="#">Statut</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>© 2025 ReplyFast AI. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    indigo: 'from-indigo-500 to-indigo-600',
    yellow: 'from-yellow-500 to-yellow-600',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all">
      <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${colorClasses[color]} rounded-xl mb-6`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  )
}

function StepCard({ number, title, description }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full text-white text-2xl font-bold mb-6">
        {number}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  )
}

function TestimonialCard({ name, role, text, rating }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
        "{text}"
      </p>
      <div>
        <p className="font-semibold text-gray-900 dark:text-white">{name}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{role}</p>
      </div>
    </div>
  )
}

function PricingCard({ name, price, features, popular }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg ${
      popular ? 'ring-2 ring-purple-500 transform scale-105' : ''
    }`}>
      {popular && (
        <div className="text-center mb-4">
          <span className="bg-purple-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
            ⭐ Populaire
          </span>
        </div>
      )}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {name}
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-bold text-gray-900 dark:text-white">
            {price}€
          </span>
          <span className="text-gray-600 dark:text-gray-400">/mois</span>
        </div>
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/signup"
        className={`block w-full text-center font-semibold py-3 px-6 rounded-lg transition-all ${
          popular
            ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
            : 'bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900'
        }`}
      >
        Commencer
      </Link>
    </div>
  )
}
