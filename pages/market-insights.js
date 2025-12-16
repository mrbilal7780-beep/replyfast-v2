import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import DashboardLayout from '../components/DashboardLayout'
import { Lightbulb, TrendingUp, Users, Target, Sparkles, AlertCircle } from 'lucide-react'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

export default function MarketInsights({ session }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [userName, setUserName] = useState('')
  const [client, setClient] = useState(null)
  const [insights, setInsights] = useState(null)

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

  const generateInsights = async () => {
    if (!client) return

    setGenerating(true)
    try {
      // Récupérer les données pour l'analyse
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_email', session.user.email)

      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('client_email', session.user.email)

      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('client_email', session.user.email)
        .eq('direction', 'received')
        .limit(100)

      // Construire le prompt pour l'IA
      const prompt = `Tu es un expert en analyse de marché et stratégie commerciale.

CONTEXTE ENTREPRISE:
- Secteur: ${client.sector}
- Nom: ${client.company_name}
- Localisation: ${client.address}

DONNÉES RÉCENTES:
- ${conversations.length} conversations
- ${appointments.length} rendez-vous
- ${messages.length} messages reçus

EXEMPLES DE MESSAGES CLIENTS:
${messages.slice(0, 20).map(m => `- "${m.message_text}"`).join('\n')}

MISSION:
Génère une analyse complète du marché et des recommandations stratégiques.

Réponds UNIQUEMENT avec ce JSON (sans markdown):
{
  "marketTrends": [
    {
      "title": "Titre de la tendance",
      "description": "Description détaillée",
      "impact": "high/medium/low"
    }
  ],
  "customerInsights": [
    {
      "title": "Insight client",
      "description": "Analyse comportementale",
      "actionable": "Action recommandée"
    }
  ],
  "opportunities": [
    {
      "title": "Opportunité identifiée",
      "description": "Description de l'opportunité",
      "potential": "Potentiel de CA estimé"
    }
  ],
  "recommendations": [
    {
      "title": "Recommandation stratégique",
      "description": "Explication détaillée",
      "priority": "high/medium/low"
    }
  ]
}`

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000
      })

      let result = response.choices[0].message.content.trim()
        .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

      const insightsData = JSON.parse(result)
      setInsights(insightsData)

    } catch (error) {
      console.error('Erreur génération insights:', error)
      alert('Erreur lors de la génération des insights')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    )
  }

  return (
    <DashboardLayout session={session} userName={userName}>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Market Insights
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Analyse IA de votre marché et recommandations stratégiques
            </p>
          </div>

          <button
            onClick={generateInsights}
            disabled={generating}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Sparkles className="w-5 h-5" />
            {generating ? 'Génération en cours...' : 'Générer les insights'}
          </button>
        </div>

        {!insights && !generating && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-8 text-center">
            <Lightbulb className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Découvrez vos opportunités de croissance
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Notre IA analyse vos données pour identifier les tendances du marché et vous proposer des recommandations personnalisées.
            </p>
            <button
              onClick={generateInsights}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all"
            >
              Lancer l'analyse
            </button>
          </div>
        )}

        {generating && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Analyse en cours...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Notre IA analyse vos données et génère des insights personnalisés
            </p>
          </div>
        )}

        {insights && (
          <div className="space-y-6">
            {/* Tendances du marché */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Tendances du marché
                </h3>
              </div>
              <div className="space-y-4">
                {insights.marketTrends.map((trend, index) => (
                  <InsightCard
                    key={index}
                    title={trend.title}
                    description={trend.description}
                    badge={trend.impact}
                    badgeColor={
                      trend.impact === 'high' ? 'red' :
                      trend.impact === 'medium' ? 'orange' : 'green'
                    }
                  />
                ))}
              </div>
            </div>

            {/* Insights clients */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Comportement clients
                </h3>
              </div>
              <div className="space-y-4">
                {insights.customerInsights.map((insight, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {insight.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {insight.description}
                    </p>
                    <div className="flex items-start gap-2 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                      <Target className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-purple-900 dark:text-purple-200">
                        <strong>Action:</strong> {insight.actionable}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunités */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Opportunités identifiées
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.opportunities.map((opp, index) => (
                  <div key={index} className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {opp.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {opp.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                        💰 Potentiel: {opp.potential}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommandations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recommandations stratégiques
                </h3>
              </div>
              <div className="space-y-4">
                {insights.recommendations.map((rec, index) => (
                  <InsightCard
                    key={index}
                    title={rec.title}
                    description={rec.description}
                    badge={rec.priority}
                    badgeColor={
                      rec.priority === 'high' ? 'red' :
                      rec.priority === 'medium' ? 'orange' : 'blue'
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function InsightCard({ title, description, badge, badgeColor }) {
  const badgeColors = {
    red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          {title}
        </h4>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${badgeColors[badgeColor]}`}>
          {badge}
        </span>
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  )
}
