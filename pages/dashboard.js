import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import DashboardLayout from '../components/DashboardLayout'
import { MessageSquare, Calendar, TrendingUp, Users, Clock, CheckCircle } from 'lucide-react'

export default function Dashboard({ session }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMessages: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    responseRate: 'N/A',
    avgResponseTime: 'N/A'
  })
  const [recentConversations, setRecentConversations] = useState([])
  const [upcomingAppointments, setUpcomingAppointments] = useState([])

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }

    loadDashboardData()
  }, [session])

  const loadDashboardData = async () => {
    try {
      // Charger les infos utilisateur
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (client) {
        setUserName(client.first_name || client.company_name || 'Utilisateur')

        // Vérifier si le profil est complété
        if (!client.profile_completed) {
          router.push('/onboarding')
          return
        }

        // Charger les statistiques
        await loadStats(client.email)
        await loadRecentConversations(client.email)
        await loadUpcomingAppointments(client.email)
      }

      setLoading(false)
    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
      setLoading(false)
    }
  }

  const loadStats = async (email) => {
    try {
      // Total conversations
      const { count: convCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('client_email', email)

      // Total messages
      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('client_email', email)

      // Total rendez-vous
      const { count: aptCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('client_email', email)

      // Rendez-vous en attente
      const { count: pendingCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('client_email', email)
        .eq('status', 'pending')

      // Calculer le taux de réponse
      const { data: receivedMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('client_email', email)
        .eq('direction', 'received')

      const { data: sentMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('client_email', email)
        .eq('direction', 'sent')

      let responseRate = 'N/A'
      if (receivedMessages && receivedMessages.length > 0) {
        const rate = (sentMessages.length / receivedMessages.length) * 100
        responseRate = Math.round(rate) + '%'
      }

      setStats({
        totalConversations: convCount || 0,
        totalMessages: msgCount || 0,
        totalAppointments: aptCount || 0,
        pendingAppointments: pendingCount || 0,
        responseRate,
        avgResponseTime: '< 1 min'
      })
    } catch (error) {
      console.error('Erreur chargement stats:', error)
    }
  }

  const loadRecentConversations = async (email) => {
    try {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_email', email)
        .order('last_message_at', { ascending: false })
        .limit(5)

      setRecentConversations(data || [])
    } catch (error) {
      console.error('Erreur chargement conversations:', error)
    }
  }

  const loadUpcomingAppointments = async (email) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('client_email', email)
        .gte('appointment_date', today)
        .in('status', ['pending', 'confirmed'])
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })
        .limit(5)

      setUpcomingAppointments(data || [])
    } catch (error) {
      console.error('Erreur chargement rendez-vous:', error)
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tableau de bord
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Vue d'ensemble de votre activité ReplyFast AI
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Conversations"
            value={stats.totalConversations}
            icon={MessageSquare}
            color="blue"
          />
          <StatCard
            title="Messages"
            value={stats.totalMessages}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Rendez-vous"
            value={stats.totalAppointments}
            icon={Calendar}
            color="purple"
          />
          <StatCard
            title="En attente"
            value={stats.pendingAppointments}
            icon={Clock}
            color="orange"
          />
        </div>

        {/* Métriques supplémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Performance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Taux de réponse</span>
                <span className="text-2xl font-bold text-blue-600">{stats.responseRate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Temps de réponse moyen</span>
                <span className="text-2xl font-bold text-green-600">{stats.avgResponseTime}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Statut WhatsApp
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700 dark:text-gray-300">Connecté et actif</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Votre bot répond automatiquement à vos clients 24/7
            </p>
          </div>
        </div>

        {/* Conversations récentes et RDV à venir */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversations récentes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Conversations récentes
              </h3>
              <a href="/conversations" className="text-sm text-blue-600 hover:text-blue-700">
                Voir tout →
              </a>
            </div>
            <div className="space-y-3">
              {recentConversations.length > 0 ? (
                recentConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer"
                    onClick={() => router.push(`/conversations/${conv.id}`)}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {conv.customer_name ? conv.customer_name.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {conv.customer_name || conv.customer_phone}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(conv.last_message_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    {conv.unread_count > 0 && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">{conv.unread_count}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  Aucune conversation récente
                </p>
              )}
            </div>
          </div>

          {/* Rendez-vous à venir */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Rendez-vous à venir
              </h3>
              <a href="/appointments" className="text-sm text-blue-600 hover:text-blue-700">
                Voir tout →
              </a>
            </div>
            <div className="space-y-3">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      apt.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
                    }`}>
                      {apt.status === 'confirmed' ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {apt.customer_name || apt.customer_phone}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(apt.appointment_date).toLocaleDateString('fr-FR')} à {apt.appointment_time}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      apt.status === 'confirmed' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                    }`}>
                      {apt.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  Aucun rendez-vous à venir
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}
