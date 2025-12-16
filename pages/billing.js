import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { loadStripe } from '@stripe/stripe-js'
import DashboardLayout from '../components/DashboardLayout'
import { CreditCard, Check, Zap, Crown, Star } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function Billing({ session }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [client, setClient] = useState(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }

    loadData()
  }, [session])

  const loadData = async () => {
    try {
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (clientData) {
        setClient(clientData)
        setUserName(clientData.first_name || clientData.company_name || 'Utilisateur')
      }

      setLoading(false)
    } catch (error) {
      console.error('Erreur chargement:', error)
      setLoading(false)
    }
  }

  const handleSubscribe = async (priceId) => {
    setProcessing(true)
    try {
      // Créer la session de checkout
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          priceId
        })
      })

      const { sessionId } = await response.json()

      // Rediriger vers Stripe Checkout
      const stripe = await stripePromise
      const { error } = await stripe.redirectToCheckout({ sessionId })

      if (error) {
        console.error('Erreur Stripe:', error)
        alert('Erreur lors de la redirection vers le paiement')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la création de la session de paiement')
    } finally {
      setProcessing(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      // Créer un portail de gestion Stripe
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: client.stripe_customer_id
        })
      })

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'accès au portail de gestion')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    )
  }

  const plans = [
    {
      name: 'Mensuel',
      price: '19.99',
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY,
      icon: Zap,
      color: 'blue',
      popular: true,
      features: [
        'Messages illimités',
        'Rendez-vous illimités',
        'Bot IA GPT-4o-mini',
        'WhatsApp Business',
        'Calendrier RDV',
        'Analytics complets',
        'Menu Manager',
        'Support email'
      ]
    }
  ]

  return (
    <DashboardLayout session={session} userName={userName}>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            30 jours d'essai gratuit • Sans engagement • Annulation à tout moment
          </p>
        </div>

        {/* Statut actuel */}
        {client && (client.subscription_status === 'trialing' || client.subscription_status === 'active') && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {client.subscription_status === 'trialing' ? 'Période d\'essai active' : 'Abonnement actif'}
                </h3>
                {client.trial_ends_at && client.subscription_status === 'trialing' && (
                  <p className="text-gray-600 dark:text-gray-400">
                    Votre essai gratuit se termine le {new Date(client.trial_ends_at).toLocaleDateString('fr-FR')}
                  </p>
                )}
                {client.subscription_ends_at && client.subscription_status === 'active' && (
                  <p className="text-gray-600 dark:text-gray-400">
                    Prochaine facturation le {new Date(client.subscription_ends_at).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
              {client.stripe_customer_id && (
                <button
                  onClick={handleManageSubscription}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                >
                  Gérer l'abonnement
                </button>
              )}
            </div>
          </div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon
            const colorClasses = {
              blue: 'from-blue-500 to-blue-600',
              purple: 'from-purple-500 to-purple-600',
              orange: 'from-orange-500 to-orange-600',
            }

            return (
              <div
                key={plan.name}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 p-8 relative ${
                  plan.popular
                    ? 'border-purple-500 transform scale-105'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                      ⭐ Le plus populaire
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${colorClasses[plan.color]} rounded-2xl mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">
                      {plan.price}€
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">/mois</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.priceId)}
                  disabled={processing || !plan.priceId}
                  className={`w-full font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
                      : 'bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900'
                  }`}
                >
                  {processing ? 'Chargement...' : 'Commencer l\'essai gratuit'}
                </button>
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            <FAQItem
              question="Comment fonctionne l'essai gratuit ?"
              answer="Vous bénéficiez de 30 jours d'essai gratuit sans carte bancaire requise. À la fin de l'essai, vous pourrez choisir votre plan."
            />
            <FAQItem
              question="Puis-je changer de plan à tout moment ?"
              answer="Oui, vous pouvez upgrader ou downgrader votre plan à tout moment depuis votre espace de gestion."
            />
            <FAQItem
              question="Comment annuler mon abonnement ?"
              answer="Vous pouvez annuler votre abonnement à tout moment depuis la page de gestion. Aucun frais ne sera facturé après l'annulation."
            />
            <FAQItem
              question="Quels moyens de paiement acceptez-vous ?"
              answer="Nous acceptons toutes les cartes bancaires (Visa, Mastercard, American Express) via Stripe."
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {question}
        </h3>
        <span className="text-2xl text-gray-500">
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          {answer}
        </p>
      )}
    </div>
  )
}
