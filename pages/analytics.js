import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import DashboardLayout from '../components/DashboardLayout'
import { TrendingUp, MessageSquare, Calendar, Users, Clock, CheckCircle, BarChart3 } from 'lucide-react'

export default function Analytics({ session }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [period, setPeriod] = useState('7') // 7, 30, 90 jours
  
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMessages: 0,
    totalAppointments: 0,
    confirmedAppointments: 0,
    cancelledAppointments: 0,
    responseRate: 0,
    avgResponseTime: '< 1 min',
    conversionRate: 0,
    peakHours: [],
    topServices: []
  })

  const [dailyStats, setDailyStats] = useState([])

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }

    loadData()
  }, [session, period])

  const loadData = async () => {
    try {
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (client) {
        setUserName(client.first_name || client.company_name || 'Utilisateur')
      }

      await loadAnalytics()
      setLoading(false)
    } catch (error) {
      console.error('Erreur chargement:', error)
      setLoading(false)
    }
  }

  const loadAnalytics = async () => {
    try {
      const daysAgo = parseInt(period)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysAgo)
      const startDateStr = startDate.toISOString()

      // Total conversations
      const { count: convCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('client_email', session.user.email)
        .gte('created_at', startDateStr)

      // Total messages
      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('client_email', session.user.email)
        .gte('created_at', startDateStr)

      // Total rendez-vous
      const { count: aptCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('client_email', session.user.email)
        .gte('created_at', startDateStr)

      // Rendez-vous confirmés
      const { count: confirmedCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('client_email', session.user.email)
        .eq('status', 'confirmed')
        .gte('created_at', startDateStr)

      // Rendez-vous annulés
      const { count: cancelledCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('client_email', session.user.email)
        .eq('status', 'cancelled')
        .gte('created_at', startDateStr)

      // Taux de conversion (conversations -> RDV)
      const conversionRate = convCount > 0 ? ((aptCount / convCount) * 100).toFixed(1) : 0

      // Messages reçus vs envoyés
      const { data: receivedMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('client_email', session.user.email)
        .eq('direction', 'received')
        .gte('created_at', startDateStr)

      const { data: sentMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('client_email', session.user.email)
        .eq('direction', 'sent')
        .gte('created_at', startDateStr)

      const responseRate = receivedMessages.length > 0
        ? ((sentMessages.length / receivedMessages.length) * 100).toFixed(1)
        : 0

      // Top services
      const { data: appointments } = await supabase
        .from('appointments')
        .select('service')
        .eq('client_email', session.user.email)
        .gte('created_at', startDateStr)

      const serviceCounts = {}
      appointments.forEach(apt => {
        if (apt.service) {
          serviceCounts[apt.service] = (serviceCounts[apt.service] || 0) + 1
        }
      })

      const topServices = Object.entries(serviceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([service, count]) => ({ service, count }))

      // Heures de pointe (analyse des messages reçus)
      const hourCounts = {}
      receivedMessages.forEach(msg => {
        const hour = new Date(msg.created_at).getHours()
        hourCounts[hour] = (hourCounts[hour] || 0) + 1
      })

      const peakHours = Object.entries(hourCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour, count]) => ({ hour: `${hour}h`, count }))

      // Statistiques quotidiennes pour le graphique
      const daily = []
      for (let i = daysAgo - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]

        const { count: dayConvCount } = await supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('client_email', session.user.email)
          .gte('created_at', `${dateStr}T00:00:00`)
          .lt('created_at', `${dateStr}T23:59:59`)

        const { count: dayAptCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('client_email', session.user.email)
          .gte('created_at', `${dateStr}T00:00:00`)
          .lt('created_at', `${dateStr}T23:59:59`)

        daily.push({
          date: new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          conversations: dayConvCount || 0,
          appointments: dayAptCount || 0
        })
      }

      setStats({
        totalConversations: convCount || 0,
        totalMessages: msgCount || 0,
        totalAppointments: aptCount || 0,
        confirmedAppointments: confirmedCount || 0,
        cancelledAppointments: cancelledCount || 0,
        responseRate,
        avgResponseTime: '< 1 min',
        conversionRate,
        peakHours,
        topServices
      })

      setDailyStats(daily)

    } catch (error) {
      console.error('Erreur chargement analytics:', error)
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
              Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Analysez les performances de votre bot
            </p>
          </div>

          {/* Sélecteur de période */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">90 derniers jours</option>
          </select>
        </div>

        {/* KPIs principaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Conversations"
            value={stats.totalConversations}
            icon={MessageSquare}
            color="blue"
          />
          <KPICard
            title="Messages"
            value={stats.totalMessages}
            icon={TrendingUp}
            color="green"
          />
          <KPICard
            title="Rendez-vous"
            value={stats.totalAppointments}
            icon={Calendar}
            color="purple"
          />
          <KPICard
            title="Taux de conversion"
            value={`${stats.conversionRate}%`}
            icon={BarChart3}
            color="orange"
          />
        </div>

        {/* Graphique simple (barres ASCII) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Évolution quotidienne
          </h3>
          <div className="space-y-3">
            {dailyStats.map((day, index) => {
              const maxConv = Math.max(...dailyStats.map(d => d.conversations), 1)
              const maxApt = Math.max(...dailyStats.map(d => d.appointments), 1)
              const convWidth = (day.conversations / maxConv) * 100
              const aptWidth = (day.appointments / maxApt) * 100

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 w-20">{day.date}</span>
                    <div className="flex-1 mx-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                          <div
                            className="bg-blue-600 h-4 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${convWidth}%` }}
                          >
                            {day.conversations > 0 && (
                              <span className="text-xs text-white font-semibold">{day.conversations}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-24">Conversations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                          <div
                            className="bg-purple-600 h-4 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${aptWidth}%` }}
                          >
                            {day.appointments > 0 && (
                              <span className="text-xs text-white font-semibold">{day.appointments}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-24">RDV</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Performance
            </h3>
            <div className="space-y-4">
              <StatRow label="Taux de réponse" value={`${stats.responseRate}%`} />
              <StatRow label="Temps de réponse moyen" value={stats.avgResponseTime} />
              <StatRow label="Taux de conversion" value={`${stats.conversionRate}%`} />
              <StatRow label="RDV confirmés" value={`${stats.confirmedAppointments}/${stats.totalAppointments}`} />
              <StatRow label="RDV annulés" value={stats.cancelledAppointments} />
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Insights
            </h3>
            
            {/* Heures de pointe */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Heures de pointe
              </h4>
              <div className="space-y-2">
                {stats.peakHours.map((peak, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{peak.hour}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {peak.count} messages
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top services */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Services les plus demandés
              </h4>
              <div className="space-y-2">
                {stats.topServices.length > 0 ? (
                  stats.topServices.map((service, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{service.service}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {service.count} RDV
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Aucune donnée</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function KPICard({ title, value, icon: Icon, color }) {
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

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
    </div>
  )
}
