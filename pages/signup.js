import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { signUp, supabase } from '../lib/supabase'
import { UserPlus, Mail, Lock, User, Building2, AlertCircle, CheckCircle, Bot, X, Loader2 } from 'lucide-react'

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

// Popup de confirmation email multilingue
const EmailConfirmationPopup = ({ email, onClose }) => {
  const [userLanguage, setUserLanguage] = useState('fr')

  useEffect(() => {
    // Détecter la langue du navigateur
    const browserLang = navigator.language.split('-')[0]
    if (['fr', 'en', 'es', 'de', 'it', 'pt', 'ar', 'zh'].includes(browserLang)) {
      setUserLanguage(browserLang)
    }
  }, [])

  const translations = {
    fr: { title: 'Confirmez votre email', subtitle: 'Un email de confirmation a été envoyé à', action: 'Vérifiez votre boîte de réception' },
    en: { title: 'Confirm your email', subtitle: 'A confirmation email has been sent to', action: 'Check your inbox' },
    es: { title: 'Confirma tu correo', subtitle: 'Se ha enviado un correo de confirmación a', action: 'Revisa tu bandeja de entrada' },
    de: { title: 'E-Mail bestätigen', subtitle: 'Eine Bestätigungs-E-Mail wurde gesendet an', action: 'Überprüfen Sie Ihren Posteingang' },
    it: { title: 'Conferma la tua email', subtitle: 'Un\'email di conferma è stata inviata a', action: 'Controlla la tua casella di posta' },
    pt: { title: 'Confirme seu email', subtitle: 'Um email de confirmação foi enviado para', action: 'Verifique sua caixa de entrada' },
    ar: { title: 'تأكيد بريدك الإلكتروني', subtitle: 'تم إرسال رسالة تأكيد إلى', action: 'تحقق من صندوق الوارد' },
    zh: { title: '确认您的邮箱', subtitle: '确认邮件已发送至', action: '请检查您的收件箱' }
  }

  const primaryLang = translations[userLanguage] || translations.en
  const otherLanguages = Object.entries(translations).filter(([lang]) => lang !== userLanguage)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-gray-900 border border-purple-500/30 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl shadow-purple-500/20">
        {/* Glow effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl blur-2xl opacity-20" />
        
        <div className="relative">
          {/* Icône animée */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Texte principal dans la langue de l'utilisateur */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">{primaryLang.title}</h2>
            <p className="text-gray-400">{primaryLang.subtitle}</p>
            <p className="text-purple-400 font-semibold mt-2">{email}</p>
            <p className="text-gray-300 mt-4">{primaryLang.action}</p>
          </div>

          {/* Séparateur */}
          <div className="border-t border-gray-700 my-6" />

          {/* Autres langues */}
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {otherLanguages.map(([lang, text]) => (
              <div key={lang} className="text-center text-sm">
                <span className="text-gray-500">{text.title}</span>
                <span className="text-gray-600 mx-2">•</span>
                <span className="text-gray-500">{text.action}</span>
              </div>
            ))}
          </div>

          {/* Loader */}
          <div className="flex items-center justify-center gap-2 mt-6 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">En attente de confirmation...</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Signup() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false)

  // Écouter la confirmation d'email
  useEffect(() => {
    if (!showConfirmationPopup) return

    const checkEmailConfirmation = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Email confirmé, rediriger vers onboarding
        router.push('/onboarding')
      }
    }

    // Vérifier toutes les 3 secondes
    const interval = setInterval(checkEmailConfirmation, 3000)

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/onboarding')
      }
    })

    return () => {
      clearInterval(interval)
      subscription?.unsubscribe()
    }
  }, [showConfirmationPopup, router])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)

    try {
      // Créer le compte avec confirmation email
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
          emailRedirectTo: `${window.location.origin}/onboarding`
        }
      })

      if (signUpError) throw signUpError

      // Créer l'entrée dans la table clients
      const { error: clientError } = await supabase
        .from('clients')
        .insert([{
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          company_name: formData.companyName,
          subscription_status: 'trialing',
          trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          profile_completed: false,
        }])

      if (clientError && !clientError.message.includes('duplicate')) {
        throw clientError
      }

      // Afficher le popup de confirmation
      setShowConfirmationPopup(true)

    } catch (err) {
      console.error('Erreur inscription:', err)
      if (err.message.includes('duplicate') || err.message.includes('already registered')) {
        setError('Cette adresse email est déjà utilisée. Essayez de vous connecter.')
      } else {
        setError(err.message || 'Erreur lors de la création du compte')
      }
    } finally {
      setLoading(false)
    }
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

      {/* Popup de confirmation email */}
      {showConfirmationPopup && (
        <EmailConfirmationPopup 
          email={formData.email} 
          onClose={() => setShowConfirmationPopup(false)} 
        />
      )}

      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
        <div className="max-w-2xl w-full">
          {/* Logo et titre */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                ReplyFast AI
              </span>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">
              Créer un compte
            </h1>
            <p className="text-gray-400">
              Commencez votre essai gratuit de 30 jours
            </p>
          </div>

          {/* Formulaire */}
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-800 p-8 shadow-2xl">
            {error && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Avantages */}
            <div className="mb-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
              <div className="flex items-start gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-purple-200 font-medium">
                  30 jours d&apos;essai gratuit - Aucune carte bancaire requise
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-purple-200 font-medium">
                  Accès complet à toutes les fonctionnalités
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nom et Prénom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                    Prénom
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                      placeholder="Jean"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                    Nom
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                      placeholder="Dupont"
                    />
                  </div>
                </div>
              </div>

              {/* Nom de l'entreprise */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-2">
                  Nom de l&apos;entreprise
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                    placeholder="Mon Restaurant"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                    placeholder="vous@exemple.com"
                  />
                </div>
              </div>

              {/* Mots de passe */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Bouton d'inscription */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-4 px-4 rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Création du compte...
                  </span>
                ) : (
                  'Créer mon compte gratuitement'
                )}
              </button>
            </form>

            {/* Lien connexion */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Vous avez déjà un compte ?{' '}
                <Link 
                  href="/login"
                  className="text-purple-400 hover:text-purple-300 font-semibold"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </div>

          {/* Retour accueil */}
          <div className="mt-6 text-center">
            <Link 
              href="/"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
