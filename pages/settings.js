import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { sectors } from '../lib/sectors'
import DashboardLayout from '../components/DashboardLayout'
import { Save, Building2, Clock, User, CreditCard, Smartphone } from 'lucide-react'

export default function Settings({ session }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userName, setUserName] = useState('')
  const [activeTab, setActiveTab] = useState('profile') // profile, business, subscription

  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: ''
  })

  const [businessForm, setBusinessForm] = useState({
    company_name: '',
    sector: '',
    address: '',
    phone: '',
    horaires: {
      lundi: { ouvert: true, debut: '09:00', fin: '18:00' },
      mardi: { ouvert: true, debut: '09:00', fin: '18:00' },
      mercredi: { ouvert: true, debut: '09:00', fin: '18:00' },
      jeudi: { ouvert: true, debut: '09:00', fin: '18:00' },
      vendredi: { ouvert: true, debut: '09:00', fin: '18:00' },
      samedi: { ouvert: false, debut: '09:00', fin: '18:00' },
      dimanche: { ouvert: false, debut: '09:00', fin: '18:00' },
    }
  })

  const [subscriptionInfo, setSubscriptionInfo] = useState(null)

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }

    loadData()
  }, [session])

  const loadData = async () => {
    try {
      const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (error) throw error

      if (client) {
        setUserName(client.first_name || client.company_name || 'Utilisateur')
        
        setProfileForm({
          first_name: client.first_name || '',
          last_name: client.last_name || '',
          email: client.email || ''
        })

        setBusinessForm({
          company_name: client.company_name || '',
          sector: client.sector || '',
          address: client.address || '',
          phone: client.phone || '',
          horaires: client.horaires || businessForm.horaires
        })

        setSubscriptionInfo({
          status: client.subscription_status || 'trialing',
          trial_ends_at: client.trial_ends_at,
          subscription_ends_at: client.subscription_ends_at,
          whatsapp_connected: client.whatsapp_connected
        })
      }

      setLoading(false)
    } catch (error) {
      console.error('Erreur chargement:', error)
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          first_name: profileForm.first_name,
          last_name: profileForm.last_name
        })
        .eq('email', session.user.email)

      if (error) throw error

      alert('Profil mis à jour avec succès !')
      await loadData()
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBusiness = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          company_name: businessForm.company_name,
          sector: businessForm.sector,
          address: businessForm.address,
          phone: businessForm.phone,
          horaires: businessForm.horaires
        })
        .eq('email', session.user.email)

      if (error) throw error

      alert('Informations entreprise mises à jour avec succès !')
      await loadData()
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const updateHoraire = (jour, field, value) => {
    setBusinessForm({
      ...businessForm,
      horaires: {
        ...businessForm.horaires,
        [jour]: {
          ...businessForm.horaires[jour],
          [field]: value
        }
      }
    })
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
            Paramètres
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez votre compte et vos préférences
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'profile'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <User className="w-5 h-5 inline-block mr-2" />
            Profil
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'business'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-5 h-5 inline-block mr-2" />
            Entreprise
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'subscription'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-5 h-5 inline-block mr-2" />
            Abonnement
          </button>
        </div>

        {/* Contenu Profil */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Informations personnelles
            </h3>
            <div className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  L'email ne peut pas être modifié
                </p>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        )}

        {/* Contenu Entreprise */}
        {activeTab === 'business' && (
          <div className="space-y-6">
            {/* Informations générales */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Informations générales
              </h3>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    value={businessForm.company_name}
                    onChange={(e) => setBusinessForm({ ...businessForm, company_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Secteur d'activité
                  </label>
                  <select
                    value={businessForm.sector}
                    onChange={(e) => setBusinessForm({ ...businessForm, sector: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Sélectionnez un secteur</option>
                    {sectors.map(sector => (
                      <option key={sector.id} value={sector.id}>
                        {sector.icon} {sector.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={businessForm.address}
                    onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={businessForm.phone}
                    onChange={(e) => setBusinessForm({ ...businessForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Horaires */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Horaires d'ouverture
              </h3>
              <div className="space-y-3">
                {Object.keys(businessForm.horaires).map((jour) => (
                  <div key={jour} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="w-32">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={businessForm.horaires[jour].ouvert}
                          onChange={(e) => updateHoraire(jour, 'ouvert', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
                          {jour}
                        </span>
                      </label>
                    </div>

                    {businessForm.horaires[jour].ouvert && (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="time"
                          value={businessForm.horaires[jour].debut}
                          onChange={(e) => updateHoraire(jour, 'debut', e.target.value)}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                        <span className="text-gray-500">à</span>
                        <input
                          type="time"
                          value={businessForm.horaires[jour].fin}
                          onChange={(e) => updateHoraire(jour, 'fin', e.target.value)}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    )}

                    {!businessForm.horaires[jour].ouvert && (
                      <span className="text-gray-500 italic">Fermé</span>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveBusiness}
                disabled={saving}
                className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        )}

        {/* Contenu Abonnement */}
        {activeTab === 'subscription' && subscriptionInfo && (
          <div className="space-y-6">
            {/* Statut abonnement */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Statut de l'abonnement
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {subscriptionInfo.status === 'trialing' && 'Période d\'essai'}
                      {subscriptionInfo.status === 'active' && 'Abonnement actif'}
                      {subscriptionInfo.status === 'cancelled' && 'Abonnement annulé'}
                    </p>
                    {subscriptionInfo.trial_ends_at && subscriptionInfo.status === 'trialing' && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Se termine le {new Date(subscriptionInfo.trial_ends_at).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                    {subscriptionInfo.subscription_ends_at && subscriptionInfo.status === 'active' && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Prochaine facturation le {new Date(subscriptionInfo.subscription_ends_at).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    subscriptionInfo.status === 'active' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : subscriptionInfo.status === 'trialing'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    {subscriptionInfo.status === 'trialing' && 'Essai gratuit'}
                    {subscriptionInfo.status === 'active' && 'Actif'}
                    {subscriptionInfo.status === 'cancelled' && 'Annulé'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        WhatsApp Business
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {subscriptionInfo.whatsapp_connected ? 'Connecté' : 'Non connecté'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    subscriptionInfo.whatsapp_connected
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                  }`}>
                    {subscriptionInfo.whatsapp_connected ? '✓ Actif' : '✗ Inactif'}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => router.push('/billing')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                >
                  Gérer l'abonnement
                </button>
                {!subscriptionInfo.whatsapp_connected && (
                  <button
                    onClick={() => router.push('/waha-setup')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                  >
                    Connecter WhatsApp
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
