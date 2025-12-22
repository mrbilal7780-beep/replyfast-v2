import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { Smartphone, QrCode, CheckCircle, AlertCircle, RefreshCw, Bot, ArrowRight } from 'lucide-react'

// Particules d'arrière-plan
const ParticlesBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-black" />
    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-indigo-900/30" />
    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-green-600/20 rounded-full blur-[120px] animate-pulse" />
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
          background: ['#22c55e', '#6366f1', '#3b82f6'][Math.floor(Math.random() * 3)],
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

export default function WahaSetup({ session }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState(null)
  const [status, setStatus] = useState('disconnected') // disconnected, connecting, connected
  const [error, setError] = useState('')
  const [sessionName, setSessionName] = useState('')
  const [checkInterval, setCheckInterval] = useState(null)

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }
    
    // Générer un nom de session unique basé sur l'email
    const uniqueSession = `waha_${session.user.email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`
    setSessionName(uniqueSession)

    // Cleanup
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval)
      }
    }
  }, [session])

  const startWahaSession = async () => {
    setLoading(true)
    setError('')

    try {
      // Démarrer la session WAHA
      const response = await fetch('/api/waha/start-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionName,
          email: session.user.email
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Erreur lors du démarrage de la session')
      }

      setStatus('connecting')
      
      // Récupérer le QR code après un court délai
      setTimeout(async () => {
        await fetchQRCode()
      }, 2000)
      
      // Vérifier le statut toutes les 3 secondes
      const interval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/waha/check-status?session=${sessionName}`)
          const statusData = await statusResponse.json()

          console.log('WAHA Status:', statusData)

          if (statusData.status === 'WORKING' || statusData.status === 'CONNECTED') {
            clearInterval(interval)
            setCheckInterval(null)
            setStatus('connected')
            
            // Sauvegarder dans Supabase
            const { error: updateError } = await supabase
              .from('clients')
              .update({
                whatsapp_connected: true,
                waha_session_name: sessionName,
                profile_completed: true,
                updated_at: new Date().toISOString()
              })
              .eq('email', session.user.email)

            if (updateError) {
              console.error('Error updating client:', updateError)
            }

            // Rediriger vers le dashboard après 2 secondes
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          } else if (statusData.status === 'FAILED' || statusData.status === 'STOPPED') {
            clearInterval(interval)
            setCheckInterval(null)
            setError('Échec de la connexion. Veuillez réessayer.')
            setStatus('disconnected')
          } else if (statusData.status === 'SCAN_QR_CODE' || statusData.status === 'STARTING') {
            // Rafraîchir le QR code si nécessaire
            if (!qrCode) {
              await fetchQRCode()
            }
          }
        } catch (err) {
          console.error('Error checking status:', err)
        }
      }, 3000)

      setCheckInterval(interval)

      // Arrêter la vérification après 5 minutes
      setTimeout(() => {
        if (interval) {
          clearInterval(interval)
          setCheckInterval(null)
        }
        if (status === 'connecting') {
          setError('Délai d\'attente dépassé. Veuillez réessayer.')
          setStatus('disconnected')
        }
      }, 300000)

    } catch (err) {
      console.error('Erreur WAHA:', err)
      setError(err.message || 'Erreur lors de la connexion à WAHA. Vérifiez que le serveur WAHA est accessible.')
      setStatus('disconnected')
    } finally {
      setLoading(false)
    }
  }

  const fetchQRCode = async () => {
    try {
      const response = await fetch(`/api/waha/get-qr?session=${sessionName}`)
      const data = await response.json()

      if (data.qr) {
        setQrCode(data.qr)
      } else if (data.error) {
        console.log('QR not ready yet:', data.error)
        // Réessayer après 2 secondes
        setTimeout(fetchQRCode, 2000)
      }
    } catch (err) {
      console.error('Erreur récupération QR:', err)
    }
  }

  const skipForNow = async () => {
    setLoading(true)
    try {
      // Marquer comme complété mais sans WhatsApp
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          profile_completed: true,
          whatsapp_connected: false,
          updated_at: new Date().toISOString()
        })
        .eq('email', session.user.email)

      if (updateError) {
        console.error('Error updating client:', updateError)
      }

      router.push('/dashboard')
    } catch (err) {
      console.error('Error skipping:', err)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const cancelConnection = () => {
    if (checkInterval) {
      clearInterval(checkInterval)
      setCheckInterval(null)
    }
    setStatus('disconnected')
    setQrCode(null)
    setError('')
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
        <div className="max-w-2xl mx-auto">
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

          <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-800 p-8 shadow-2xl">
            {/* En-tête */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4 shadow-lg shadow-green-500/30">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Connecter WhatsApp Business
              </h1>
              <p className="text-gray-400">
                Scannez le QR code avec votre application WhatsApp Business
              </p>
            </div>

            {/* Erreur */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-300">{error}</p>
                  <p className="text-xs text-red-400 mt-1">
                    Assurez-vous que le serveur WAHA est démarré et accessible.
                  </p>
                </div>
              </div>
            )}

            {/* État déconnecté */}
            {status === 'disconnected' && (
              <div className="text-center space-y-6">
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <h3 className="font-semibold text-white mb-3 flex items-center justify-center gap-2">
                    <Smartphone className="w-5 h-5 text-green-400" />
                    Instructions
                  </h3>
                  <ol className="text-left text-sm text-gray-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 font-bold">1.</span>
                      Ouvrez WhatsApp Business sur votre téléphone
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 font-bold">2.</span>
                      Allez dans Paramètres → Appareils connectés
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 font-bold">3.</span>
                      Appuyez sur &quot;Connecter un appareil&quot;
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 font-bold">4.</span>
                      Scannez le QR code qui apparaîtra ci-dessous
                    </li>
                  </ol>
                </div>

                <button
                  onClick={startWahaSession}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Préparation...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <QrCode className="w-5 h-5" />
                      Générer le QR Code
                    </span>
                  )}
                </button>

                <button
                  onClick={skipForNow}
                  disabled={loading}
                  className="w-full text-gray-400 hover:text-white font-medium py-2 transition-colors flex items-center justify-center gap-2"
                >
                  Passer cette étape (configurer plus tard)
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* État en connexion */}
            {status === 'connecting' && (
              <div className="text-center space-y-6">
                {qrCode ? (
                  <div className="bg-white p-6 rounded-2xl inline-block shadow-2xl shadow-green-500/20">
                    <img 
                      src={qrCode} 
                      alt="QR Code WhatsApp" 
                      className="w-64 h-64 mx-auto"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <RefreshCw className="w-12 h-12 text-green-400 animate-spin mx-auto mb-4" />
                      <p className="text-gray-400">
                        Génération du QR code...
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-xl p-4">
                  <p className="text-sm text-yellow-300 font-medium flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    En attente de scan... Scannez le QR code avec WhatsApp Business
                  </p>
                </div>

                <button
                  onClick={cancelConnection}
                  className="text-gray-400 hover:text-white font-medium transition-colors"
                >
                  Annuler
                </button>
              </div>
            )}

            {/* État connecté */}
            {status === 'connected' && (
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-900/30 rounded-full mb-4">
                  <CheckCircle className="w-12 h-12 text-green-400" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    WhatsApp connecté avec succès ! 🎉
                  </h3>
                  <p className="text-gray-400">
                    Votre bot est maintenant prêt à répondre automatiquement à vos clients
                  </p>
                </div>

                <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-4">
                  <p className="text-sm text-green-300 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Redirection vers le tableau de bord...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Info supplémentaire */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              🔒 Votre connexion est sécurisée et chiffrée de bout en bout
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
