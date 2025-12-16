import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { sectors } from '../lib/sectors'
import { ChevronRight, ChevronLeft, Check, Building2, Clock, Smartphone } from 'lucide-react'

export default function Onboarding({ session }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
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
    }
  }, [session])

  const handleNext = async () => {
    if (step === 3) {
      // Dernière étape - sauvegarder et rediriger
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
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          sector: formData.sector,
          company_name: formData.companyName,
          address: formData.address,
          phone: formData.phone,
          horaires: formData.horaires,
          profile_completed: true,
        })
        .eq('email', session.user.email)

      if (error) throw error

      router.push('/waha-setup')
    } catch (err) {
      console.error('Erreur sauvegarde:', err)
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  step >= s 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
            <span>Secteur</span>
            <span>Informations</span>
            <span>Horaires</span>
          </div>
        </div>

        {/* Contenu */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Étape 1: Secteur */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Quel est votre secteur d'activité ?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Cela nous permettra de personnaliser l'IA pour votre activité
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {sectors.map((sector) => (
                  <button
                    key={sector.id}
                    onClick={() => setFormData({ ...formData, sector: sector.id })}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      formData.sector === sector.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{sector.icon}</div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
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
                <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Informations de votre entreprise
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Ces informations seront utilisées par l'IA pour répondre à vos clients
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Mon Restaurant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="123 Rue de la Paix, 75001 Paris"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Horaires d'ouverture
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  L'IA informera vos clients de vos horaires
                </p>
              </div>

              <div className="space-y-3">
                {Object.keys(formData.horaires).map((jour) => (
                  <div key={jour} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="w-32">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.horaires[jour].ouvert}
                          onChange={(e) => updateHoraire(jour, 'ouvert', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
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
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                        <span className="text-gray-500">à</span>
                        <input
                          type="time"
                          value={formData.horaires[jour].fin}
                          onChange={(e) => updateHoraire(jour, 'fin', e.target.value)}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handlePrevious}
              disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
  )
}
