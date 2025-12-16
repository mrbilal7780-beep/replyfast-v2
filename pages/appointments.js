import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import DashboardLayout from '../components/DashboardLayout'
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle, AlertCircle, Filter } from 'lucide-react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

moment.locale('fr')
const localizer = momentLocalizer(moment)

export default function Appointments({ session }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [filter, setFilter] = useState('all') // all, pending, confirmed, cancelled
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }

    loadData()
  }, [session])

  useEffect(() => {
    // Filtrer les rendez-vous
    if (filter === 'all') {
      setFilteredAppointments(appointments)
    } else {
      setFilteredAppointments(appointments.filter(apt => apt.status === filter))
    }
  }, [filter, appointments])

  const loadData = async () => {
    try {
      // Charger les infos utilisateur
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (client) {
        setUserName(client.first_name || client.company_name || 'Utilisateur')
      }

      // Charger les rendez-vous
      await loadAppointments()

      setLoading(false)
    } catch (error) {
      console.error('Erreur chargement:', error)
      setLoading(false)
    }
  }

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('client_email', session.user.email)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })

      if (error) throw error

      setAppointments(data || [])
    } catch (error) {
      console.error('Erreur chargement rendez-vous:', error)
    }
  }

  const updateAppointmentStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      // Recharger les rendez-vous
      await loadAppointments()
      setShowModal(false)
      setSelectedAppointment(null)
    } catch (error) {
      console.error('Erreur mise à jour:', error)
      alert('Erreur lors de la mise à jour du rendez-vous')
    }
  }

  const deleteAppointment = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)

      if (error) throw error

      await loadAppointments()
      setShowModal(false)
      setSelectedAppointment(null)
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('Erreur lors de la suppression du rendez-vous')
    }
  }

  // Convertir les rendez-vous pour le calendrier
  const calendarEvents = filteredAppointments.map(apt => {
    const startDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // +1 heure

    return {
      id: apt.id,
      title: apt.customer_name || apt.customer_phone,
      start: startDate,
      end: endDate,
      resource: apt
    }
  })

  const eventStyleGetter = (event) => {
    const apt = event.resource
    let backgroundColor = '#3b82f6' // blue par défaut

    if (apt.status === 'confirmed') {
      backgroundColor = '#10b981' // green
    } else if (apt.status === 'cancelled') {
      backgroundColor = '#ef4444' // red
    } else if (apt.status === 'pending') {
      backgroundColor = '#f59e0b' // orange
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  const handleSelectEvent = (event) => {
    setSelectedAppointment(event.resource)
    setShowModal(true)
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
              Rendez-vous
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez vos rendez-vous et visualisez votre planning
            </p>
          </div>

          {/* Filtres */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmés</option>
              <option value="cancelled">Annulés</option>
            </select>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatBox
            label="Total"
            value={appointments.length}
            icon={CalendarIcon}
            color="blue"
          />
          <StatBox
            label="En attente"
            value={appointments.filter(a => a.status === 'pending').length}
            icon={Clock}
            color="orange"
          />
          <StatBox
            label="Confirmés"
            value={appointments.filter(a => a.status === 'confirmed').length}
            icon={CheckCircle}
            color="green"
          />
          <StatBox
            label="Annulés"
            value={appointments.filter(a => a.status === 'cancelled').length}
            icon={XCircle}
            color="red"
          />
        </div>

        {/* Layout 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des rendez-vous (1/3) */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Liste des rendez-vous
              </h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => {
                        setSelectedAppointment(apt)
                        setShowModal(true)
                      }}
                      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {apt.customer_name || apt.customer_phone}
                        </p>
                        <StatusBadge status={apt.status} />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        📅 {new Date(apt.appointment_date).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        🕐 {apt.appointment_time}
                      </p>
                      {apt.service && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          💼 {apt.service}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Aucun rendez-vous
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Calendrier (2/3) */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Calendrier
              </h3>
              <div className="h-[600px]">
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  eventPropGetter={eventStyleGetter}
                  onSelectEvent={handleSelectEvent}
                  messages={{
                    next: 'Suivant',
                    previous: 'Précédent',
                    today: "Aujourd'hui",
                    month: 'Mois',
                    week: 'Semaine',
                    day: 'Jour',
                    agenda: 'Agenda',
                    date: 'Date',
                    time: 'Heure',
                    event: 'Événement',
                    noEventsInRange: 'Aucun rendez-vous dans cette période'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal détails rendez-vous */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Détails du rendez-vous
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Client</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedAppointment.customer_name || selectedAppointment.customer_phone}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Date</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(selectedAppointment.appointment_date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Heure</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedAppointment.appointment_time}
                </p>
              </div>

              {selectedAppointment.service && (
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Service</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedAppointment.service}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Statut</label>
                <div className="mt-1">
                  <StatusBadge status={selectedAppointment.status} />
                </div>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Notes</label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {selectedAppointment.status === 'pending' && (
                <button
                  onClick={() => updateAppointmentStatus(selectedAppointment.id, 'confirmed')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all"
                >
                  Confirmer
                </button>
              )}
              {selectedAppointment.status !== 'cancelled' && (
                <button
                  onClick={() => updateAppointmentStatus(selectedAppointment.id, 'cancelled')}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all"
                >
                  Annuler
                </button>
              )}
              <button
                onClick={() => deleteAppointment(selectedAppointment.id)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

function StatBox({ label, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    orange: 'from-orange-500 to-orange-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`w-10 h-10 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const statusConfig = {
    pending: { label: 'En attente', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
    confirmed: { label: 'Confirmé', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
    cancelled: { label: 'Annulé', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
    completed: { label: 'Terminé', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}
