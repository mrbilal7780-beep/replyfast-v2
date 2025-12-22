import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { sectors } from '../lib/sectors'
import { ChevronRight, ChevronLeft, Check, Building2, Clock, Bot } from 'lucide-react'

// Particules d'arrière-plan
const ParticlesBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-black" />
    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-indigo-900/30" />
    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
    <div 
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }}
    />
    {[...Array(30)].map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full"
        style={{
          width: `${2 + Math.random() * 3}px`,
          height: `${2 + Math.random() * 3}px`,
          background: ['#a855f7', '#6366f1', '#3b82f6'][Math.floor(Math.random() * 3)],
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          opacity: 0.3 + Math.random() * 0.4,
          animation: `floatParticle ${8 + Math.random() * 12}s linear infinite`,
          animationDelay: `${Math.random() * 5}s`
        }}
      />
    ))}
  </div>
)

export default function Onboarding({ session }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    sector: '',
    companyName: '',
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
    },
  })

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }

    // Charger les données existantes du client
    loadClientData()
  }, [session])

  const loadClientData = async () => {
    try {
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (client) {
        setFormData(prev => ({
          ...prev,
          companyName: client.company_name || '',
          sector: client.sector || '',
          address: client.address || '',
          phone: client.phone || '',
          horaires: client.horaires || prev.horaires
        }))
      }
    } catch (err) {
      console.error('Erreur chargement client:', err)
    }
  }

  const handleNext = async () => {
    setError('')
    if (step === 3) {
      await saveOnboarding()
    } else {
      setStep(step + 1)
    }
  }

  const handlePrevious = () => {
    setStep(step - 1)
  }

  const saveOnboarding = async () => {
    setLoading(true)
    setError('')
    
    try {
      console.log('Saving onboarding data for:', session.user.email)
      console.log('Data:', formData)

      // Vérifier d'abord si le client existe
      const { data: existingClient, error: checkError } = await supabase
        .from('clients')
        .select('id')
        .eq('email', session.user.email)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking client:', checkError)
        throw checkError
      }

      let result
      if (existingClient) {
        // Update existing client
        result = await supabase
          .from('clients')
          .update({
            sector: formData.sector,
            company_name: formData.companyName,
            address: formData.address,
            phone: formData.phone,
            horaires: formData.horaires,
            profile_completed: false, // Sera true après waha-setup
            updated_at: new Date().toISOString()
          })
          .eq('email', session.user.email)
      } else {
        // Insert new client
        result = await supabase
          .from('clients')
          .insert([{
            email: session.user.email,
            sector: formData.sector,
            company_name: formData.companyName,
            address: formData.address,
            phone: formData.phone,
            horaires: formData.horaires,
            subscription_status: 'trialing',
            trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            profile_completed: false,
          }])
      }

      if (result.error) {
        console.error('Supabase error:', result.error)
        throw result.error
      }

      console.log('Onboarding saved successfully')
      router.push('/waha-setup')
      
    } catch (err) {
      console.error('Erreur sauvegarde onboarding:', err)
      setError(`Erreur lors de la sauvegarde: ${err.message || 'Veuillez réessayer.'}`)
    } finally {
      setLoading(false)
    }
  }

  const updateHoraire = (jour, field, value) => {
    setFormData({
      ...formData,
      horaires: {
        ...formData.horaires,
        [jour]: {
          ...formData.horaires[jour],
          [field]: value
        }
      }
    })
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <ParticlesBackground />
      
      {/* Styles CSS */}
      <style jsx global>{`
        @keyframes floatParticle {
          0% { transform: translateY(100vh) translateX(0) rotate(0deg); }
          100% { transform: translateY(-100vh) translateX(100px) rotate(720deg); }
        }
      `}</style>

      <div className="min-h-screen py-12 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                ReplyFast AI
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                    step >= s 
                      ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30' 
                      : 'bg-gray-800 text-gray-500 border border-gray-700'
                  }`}>
                    {step > s ? <Check className="w-5 h-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                      step > s ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gray-800'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm font-medium text-gray-400">
              <span>Secteur</span>
              <span>Informations</span>
              <span>Horaires</span>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Contenu */}
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-800 p-8 shadow-2xl">
            {/* Étape 1: Secteur */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Quel est votre secteur d&apos;activité ?
                  </h2>
                  <p className="text-gray-400">
                    Cela nous permettra de personnaliser l&apos;IA pour votre activité
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {sectors.map((sector) => (
                    <button
                      key={sector.id}
                      onClick={() => setFormData({ ...formData, sector: sector.id })}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        formData.sector === sector.id
                          ? 'border-purple-500 bg-purple-900/30 shadow-lg shadow-purple-500/20'
                          : 'border-gray-700 bg-gray-800/50 hover:border-purple-500/50 hover:bg-gray-800'
                      }`}
                    >
                      <div className="text-3xl mb-2">{sector.icon}</div>
                      <div className="font-semibold text-white text-sm">
                        {sector.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Étape 2: Informations */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Informations de votre entreprise
                  </h2>
                  <p className="text-gray-400">
                    Ces informations seront utilisées par l&apos;IA pour répondre à vos clients
                  </p>
                </div>

                <div className="space-y-4 max-w-xl mx-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom de l&apos;entreprise
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                      placeholder="Mon Restaurant"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                      placeholder="123 Rue de la Paix, 75001 Paris"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3: Horaires */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Horaires d&apos;ouverture
                  </h2>
                  <p className="text-gray-400">
                    L&apos;IA informera vos clients de vos horaires
                  </p>
                </div>

                <div className="space-y-3 max-w-2xl mx-auto">
                  {Object.keys(formData.horaires).map((jour) => (
                    <div key={jour} className="flex items-center gap-4 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                      <div className="w-32">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.horaires[jour].ouvert}
                            onChange={(e) => updateHoraire(jour, 'ouvert', e.target.checked)}
                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                          />
                          <span className="font-medium text-white capitalize">
                            {jour}
                          </span>
                        </label>
                      </div>

                      {formData.horaires[jour].ouvert && (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={formData.horaires[jour].debut}
                            onChange={(e) => updateHoraire(jour, 'debut', e.target.value)}
                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                          />
                          <span className="text-gray-400">à</span>
                          <input
                            type="time"
                            value={formData.horaires[jour].fin}
                            onChange={(e) => updateHoraire(jour, 'fin', e.target.value)}
                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                          />
                        </div>
                      )}

                      {!formData.horaires[jour].ouvert && (
                        <span className="text-gray-500 italic">Fermé</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Boutons navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-800">
              <button
                onClick={handlePrevious}
                disabled={step === 1}
                className="flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
                Précédent
              </button>

              <button
                onClick={handleNext}
                disabled={
                  (step === 1 && !formData.sector) ||
                  (step === 2 && (!formData.companyName || !formData.address || !formData.phone)) ||
                  loading
                }
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Enregistrement...
                  </>
                ) : step === 3 ? (
                  <>
                    Terminer
                    <Check className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Suivant
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
