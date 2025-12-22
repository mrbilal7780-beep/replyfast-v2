import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { sectors } from '../lib/sectors'
import DashboardLayout from '../components/DashboardLayout'
import { Save, Building2, Clock, User, CreditCard, Smartphone, Bell, Eye, Shield, Volume2, Moon, Sun, Globe, Trash2, Download, AlertTriangle } from 'lucide-react'

export default function Settings({ session }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userName, setUserName] = useState('')
  const [activeTab, setActiveTab] = useState('profile')

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

  const [preferencesForm, setPreferencesForm] = useState({
    theme: 'system',
    language: 'fr',
    notifications_email: true,
    notifications_push: true,
    notifications_sms: false,
    accessibility_voice: false,
    accessibility_high_contrast: false,
    accessibility_large_text: false,
    auto_reply_enabled: true,
    auto_reply_delay: 0,
    greeting_message: 'Bonjour ! Comment puis-je vous aider ?',
    away_message: 'Nous sommes actuellement fermés. Nous vous répondrons dès notre réouverture.',
    data_retention_days: 365
  })

  const [subscriptionInfo, setSubscriptionInfo] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

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

        setPreferencesForm({
          ...preferencesForm,
          ...client.preferences
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

  const handleSavePreferences = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          preferences: preferencesForm
        })
        .eq('email', session.user.email)

      if (error) throw error

      // Appliquer le thème
      if (preferencesForm.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else if (preferencesForm.theme === 'light') {
        document.documentElement.classList.remove('dark')
      }

      alert('Préférences mises à jour avec succès !')
      await loadData()
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleExportData = async () => {
    try {
      // Récupérer toutes les données de l'utilisateur
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_email', session.user.email)

      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('client_email', session.user.email)

      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('client_email', session.user.email)

      const exportData = {
        exported_at: new Date().toISOString(),
        conversations,
        messages,
        appointments
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `replyfast-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      alert('Données exportées avec succès !')
    } catch (error) {
      console.error('Erreur export:', error)
      alert('Erreur lors de l\'export')
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      return
    }

    try {
      // Supprimer toutes les données
      await supabase.from('messages').delete().eq('client_email', session.user.email)
      await supabase.from('conversations').delete().eq('client_email', session.user.email)
      await supabase.from('appointments').delete().eq('client_email', session.user.email)
      await supabase.from('clients').delete().eq('email', session.user.email)

      // Déconnexion
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('Erreur lors de la suppression du compte')
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

  const speakText = (text) => {
    if (preferencesForm.accessibility_voice && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'fr-FR'
      speechSynthesis.speak(utterance)
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
      <div className={`space-y-6 ${preferencesForm.accessibility_large_text ? 'text-lg' : ''} ${preferencesForm.accessibility_high_contrast ? 'contrast-more' : ''}`}>
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
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {[
            { id: 'profile', icon: User, label: 'Profil' },
            { id: 'business', icon: Building2, label: 'Entreprise' },
            { id: 'preferences', icon: Bell, label: 'Préférences' },
            { id: 'accessibility', icon: Eye, label: 'Accessibilité' },
            { id: 'subscription', icon: CreditCard, label: 'Abonnement' },
            { id: 'data', icon: Shield, label: 'Données' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                speakText(tab.label)
              }}
              className={`px-6 py-3 font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
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
                  L&apos;email ne peut pas être modifié
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
                    Nom de l&apos;entreprise
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
                    Secteur d&apos;activité
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
                Horaires d&apos;ouverture
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

        {/* Contenu Préférences */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            {/* Apparence */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Moon className="w-5 h-5" />
                Apparence
              </h3>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Thème
                  </label>
                  <select
                    value={preferencesForm.theme}
                    onChange={(e) => setPreferencesForm({ ...preferencesForm, theme: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="system">Système</option>
                    <option value="light">Clair</option>
                    <option value="dark">Sombre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Langue
                  </label>
                  <select
                    value={preferencesForm.language}
                    onChange={(e) => setPreferencesForm({ ...preferencesForm, language: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </h3>
              <div className="space-y-4 max-w-2xl">
                {[
                  { key: 'notifications_email', label: 'Notifications par email', desc: 'Recevoir les alertes par email' },
                  { key: 'notifications_push', label: 'Notifications push', desc: 'Recevoir les notifications dans le navigateur' },
                  { key: 'notifications_sms', label: 'Notifications SMS', desc: 'Recevoir les alertes urgentes par SMS' }
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferencesForm[item.key]}
                        onChange={(e) => setPreferencesForm({ ...preferencesForm, [item.key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Bot IA */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Configuration du Bot IA
              </h3>
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Réponses automatiques</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Activer les réponses automatiques du bot</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferencesForm.auto_reply_enabled}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, auto_reply_enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message d&apos;accueil
                  </label>
                  <textarea
                    value={preferencesForm.greeting_message}
                    onChange={(e) => setPreferencesForm({ ...preferencesForm, greeting_message: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Message envoyé automatiquement aux nouveaux contacts"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message d&apos;absence
                  </label>
                  <textarea
                    value={preferencesForm.away_message}
                    onChange={(e) => setPreferencesForm({ ...preferencesForm, away_message: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Message envoyé en dehors des heures d'ouverture"
                  />
                </div>
              </div>

              <button
                onClick={handleSavePreferences}
                disabled={saving}
                className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        )}

        {/* Contenu Accessibilité */}
        {activeTab === 'accessibility' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Options d&apos;accessibilité
            </h3>
            <div className="space-y-4 max-w-2xl">
              {[
                { key: 'accessibility_voice', icon: Volume2, label: 'Lecture vocale', desc: 'Activer la synthèse vocale pour lire les éléments de l\'interface' },
                { key: 'accessibility_high_contrast', icon: Eye, label: 'Contraste élevé', desc: 'Augmenter le contraste pour une meilleure lisibilité' },
                { key: 'accessibility_large_text', icon: Globe, label: 'Texte agrandi', desc: 'Augmenter la taille du texte dans l\'application' }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferencesForm[item.key]}
                      onChange={(e) => {
                        setPreferencesForm({ ...preferencesForm, [item.key]: e.target.checked })
                        if (item.key === 'accessibility_voice' && e.target.checked) {
                          speakText('Lecture vocale activée')
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Astuce :</strong> Vous pouvez également utiliser le bouton d&apos;accessibilité vocale en bas à droite de l&apos;écran sur la page d&apos;accueil pour activer la lecture vocale.
                </p>
              </div>
            </div>

            <button
              onClick={handleSavePreferences}
              disabled={saving}
              className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        )}

        {/* Contenu Abonnement */}
        {activeTab === 'subscription' && subscriptionInfo && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Statut de l&apos;abonnement
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
                      <p className="font-semibold text-gray-900 dark:text-white">WhatsApp Business</p>
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
                  Gérer l&apos;abonnement
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

        {/* Contenu Données */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            {/* Export */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Exporter mes données
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Téléchargez une copie de toutes vos données (conversations, messages, rendez-vous) au format JSON.
              </p>
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                <Download className="w-5 h-5" />
                Exporter mes données
              </button>
            </div>

            {/* Suppression */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-200 dark:border-red-800 p-6">
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-6 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Zone de danger
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                <Trash2 className="w-5 h-5" />
                Supprimer mon compte
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
