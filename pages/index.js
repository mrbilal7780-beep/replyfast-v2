import Link from 'next/link'
import { Bot, Zap, Calendar, MessageSquare, BarChart3, Clock, CheckCircle, ArrowRight, Star, Shield, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// Animation du logo style Banana Pro - Lettres qui tombent et s'écrivent
const FallingLettersLogo = () => {
  const text = "ReplyFast AI"
  const [letters, setLetters] = useState([])
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const chars = text.split('')
    let currentIndex = 0

    const interval = setInterval(() => {
      if (currentIndex < chars.length) {
        setLetters(prev => [...prev, {
          char: chars[currentIndex],
          index: currentIndex,
          delay: currentIndex * 0.1
        }])
        currentIndex++
      } else {
        clearInterval(interval)
        setTimeout(() => setIsComplete(true), 500)
      }
    }, 120)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-32 flex items-center justify-center overflow-visible">
      <div className="flex items-baseline">
        {letters.map((letter, i) => (
          <span
            key={i}
            className="inline-block text-5xl md:text-7xl font-black"
            style={{
              animation: `letterFall 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
              animationDelay: `${letter.delay}s`,
              opacity: 0,
              transform: 'translateY(-100px) rotateX(90deg)',
              background: letter.char === ' ' ? 'transparent' : 'linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #3b82f6 100%)',
              WebkitBackgroundClip: letter.char === ' ' ? 'unset' : 'text',
              WebkitTextFillColor: letter.char === ' ' ? 'transparent' : 'transparent',
              textShadow: isComplete ? '0 0 40px rgba(139, 92, 246, 0.5)' : 'none',
              filter: isComplete ? 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.3))' : 'none',
              transition: 'text-shadow 0.5s, filter 0.5s'
            }}
          >
            {letter.char === ' ' ? '\u00A0' : letter.char}
          </span>
        ))}
      </div>
      
      {/* Effet de particules autour du logo */}
      {isComplete && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${['#a855f7', '#6366f1', '#3b82f6'][i % 3]}, transparent)`,
                left: `${10 + (i * 7)}%`,
                top: `${20 + Math.sin(i) * 30}%`,
                animation: `sparkle 2s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Ligne de soulignement animée */}
      {isComplete && (
        <div 
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full"
          style={{
            animation: 'underlineGrow 0.8s ease-out forwards',
            width: '0%'
          }}
        />
      )}
    </div>
  )
}

// Composant Particules CSS amélioré et fonctionnel
const ParticlesBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Fond de base */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-indigo-900/30" />
      
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Grille */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Particules flottantes */}
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            background: ['#a855f7', '#6366f1', '#3b82f6', '#8b5cf6'][Math.floor(Math.random() * 4)],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.3 + Math.random() * 0.4,
            animation: `floatParticle ${8 + Math.random() * 12}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}
      
      {/* Étoiles scintillantes */}
      {[...Array(20)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  )
}

// Composant pour les animations au scroll
const AnimatedSection = ({ children, className = '', delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}
    >
      {children}
    </div>
  )
}

// Composant Image animée
const AnimatedImage = ({ src, alt, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`relative group cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute -inset-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl blur-2xl transition-all duration-500 ${isHovered ? 'opacity-60 scale-110' : 'opacity-30 scale-100'}`} />
      <div className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${isHovered ? 'scale-105' : 'scale-100'}`}>
        <img src={src} alt={alt} className="w-full h-auto" />
      </div>
    </div>
  )
}

// Feature Card
const FeatureCard = ({ icon: Icon, title, description, color }) => {
  const [isHovered, setIsHovered] = useState(false)
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    indigo: 'from-indigo-500 to-indigo-600',
    yellow: 'from-yellow-500 to-yellow-600'
  }

  return (
    <div
      className={`relative p-8 rounded-3xl bg-gray-900/50 backdrop-blur-xl border border-gray-800 transition-all duration-500 ${isHovered ? 'scale-105 border-purple-500/50' : 'scale-100'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute -inset-1 bg-gradient-to-r ${colors[color]} rounded-3xl blur-xl transition-opacity duration-500 ${isHovered ? 'opacity-30' : 'opacity-0'}`} />
      <div className="relative">
        <div className={`w-14 h-14 bg-gradient-to-br ${colors[color]} rounded-2xl flex items-center justify-center mb-6`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// Step Card
const StepCard = ({ number, title, description }) => (
  <div className="relative text-center">
    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-purple-500/30">
      {number}
    </div>
    <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
)

// Testimonial Card
const TestimonialCard = ({ name, role, text, rating }) => (
  <div className="p-8 rounded-3xl bg-gray-900/50 backdrop-blur-xl border border-gray-800 hover:border-purple-500/50 transition-all duration-500">
    <div className="flex gap-1 mb-4">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
      ))}
    </div>
    <p className="text-gray-300 mb-6 italic">&quot;{text}&quot;</p>
    <div>
      <p className="font-semibold text-white">{name}</p>
      <p className="text-gray-500 text-sm">{role}</p>
    </div>
  </div>
)

// Pricing Card
const PricingCard = ({ name, price, features, popular }) => (
  <div className={`relative p-8 rounded-3xl ${popular ? 'bg-gradient-to-br from-purple-900/80 to-indigo-900/80 border-2 border-purple-500' : 'bg-gray-900/50 border border-gray-800'}`}>
    {popular && (
      <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl blur-2xl opacity-30" />
    )}
    <div className="relative">
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold px-4 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-4 h-4" />
          Populaire
        </div>
      )}
      <h3 className="text-2xl font-bold text-white mb-2 mt-4">{name}</h3>
      <div className="mb-6">
        <span className="text-5xl font-bold text-white">{price}€</span>
        <span className="text-gray-400">/mois</span>
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3 text-gray-300">
            <CheckCircle className="w-5 h-5 text-green-400" />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href="/signup"
        className={`block w-full text-center py-4 rounded-xl font-semibold transition-all duration-300 ${popular ? 'bg-white text-purple-600 hover:bg-gray-100' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'}`}
      >
        Commencer l&apos;essai gratuit
      </Link>
    </div>
  </div>
)

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <ParticlesBackground />
      
      {/* Styles CSS pour les animations */}
      <style jsx global>{`
        @keyframes letterFall {
          0% {
            opacity: 0;
            transform: translateY(-100px) rotateX(90deg) scale(0.5);
          }
          60% {
            opacity: 1;
            transform: translateY(10px) rotateX(-10deg) scale(1.1);
          }
          80% {
            transform: translateY(-5px) rotateX(5deg) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) rotateX(0deg) scale(1);
          }
        }
        
        @keyframes underlineGrow {
          0% { width: 0%; left: 50%; }
          100% { width: 100%; left: 0%; }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes floatParticle {
          0% {
            transform: translateY(100vh) translateX(0) rotate(0deg);
          }
          100% {
            transform: translateY(-100vh) translateX(100px) rotate(720deg);
          }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-xl border-b border-gray-800/50 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              ReplyFast AI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/faq" className="hidden md:block text-gray-300 hover:text-white font-medium transition-colors">
              FAQ
            </Link>
            <Link href="/login" className="text-gray-300 hover:text-white font-medium transition-colors">
              Connexion
            </Link>
            <Link href="/signup" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transform hover:-translate-y-0.5 transition-all">
              Essai gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <AnimatedSection>
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 px-4 py-2 rounded-full mb-8">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold">Automatisez vos réponses WhatsApp avec l&apos;IA</span>
              </div>
            </AnimatedSection>
            
            {/* Logo animé style Banana Pro */}
            <div className="mb-8">
              <FallingLettersLogo />
            </div>
            
            <AnimatedSection delay={800}>
              <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
                Votre assistant IA répond automatiquement à vos clients sur WhatsApp, prend des rendez-vous et booste votre chiffre d&apos;affaires. <span className="text-purple-400 font-semibold">Sans effort.</span>
              </p>
            </AnimatedSection>

            <AnimatedSection delay={1000}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                <Link href="/signup" className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transform hover:-translate-y-1 transition-all text-lg flex items-center gap-2">
                  Commencer gratuitement
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="#features" className="bg-gray-800/50 hover:bg-gray-800 text-white font-semibold py-4 px-8 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all text-lg backdrop-blur-xl">
                  Découvrir
                </Link>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={1200}>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>30 jours gratuits</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span>Sans carte bancaire</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span>Setup en 2 minutes</span>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Tout ce dont vous avez <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">besoin</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Une solution complète pour automatiser votre relation client
            </p>
          </AnimatedSection>

          {/* Feature 1 */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <AnimatedSection>
              <AnimatedImage src="/feature-whatsapp.png" alt="WhatsApp Business" className="w-full max-w-md mx-auto" />
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold">WhatsApp Business</h3>
              </div>
              <p className="text-xl text-gray-400 mb-6 leading-relaxed">
                Connectez votre WhatsApp Business en <span className="text-green-400 font-semibold">1 clic</span> et laissez l&apos;IA gérer vos conversations.
              </p>
              <ul className="space-y-3">
                {['Connexion instantanée via QR code', 'Réponses automatiques 24/7', 'Personnalisation par secteur'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </AnimatedSection>
          </div>

          {/* Feature 2 */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <AnimatedSection delay={200} className="order-2 lg:order-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold">Prise de RDV Automatique</h3>
              </div>
              <p className="text-xl text-gray-400 mb-6 leading-relaxed">
                L&apos;IA détecte les demandes de rendez-vous et les planifie <span className="text-purple-400 font-semibold">automatiquement</span>.
              </p>
              <ul className="space-y-3">
                {['Détection intelligente', 'Gestion des créneaux', 'Rappels automatiques'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-purple-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </AnimatedSection>
            <AnimatedSection className="order-1 lg:order-2">
              <AnimatedImage src="/feature-calendar.png" alt="Calendrier RDV" className="w-full max-w-md mx-auto" />
            </AnimatedSection>
          </div>

          {/* Feature 3 */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <AnimatedImage src="/feature-analytics.png" alt="Analytics" className="w-full max-w-md mx-auto" />
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold">Analytics Avancés</h3>
              </div>
              <p className="text-xl text-gray-400 mb-6 leading-relaxed">
                Suivez vos performances en <span className="text-blue-400 font-semibold">temps réel</span>.
              </p>
              <ul className="space-y-3">
                {['Dashboard en temps réel', 'Rapports détaillés', 'Insights IA'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* More Features */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Et bien <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">plus encore</span>
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatedSection delay={0}><FeatureCard icon={Bot} title="IA Ultra Intelligente" description="GPT-4o comprend vos clients et répond comme un humain." color="blue" /></AnimatedSection>
            <AnimatedSection delay={100}><FeatureCard icon={Clock} title="Disponible 24/7" description="Votre bot ne dort jamais. Répondez même la nuit." color="indigo" /></AnimatedSection>
            <AnimatedSection delay={200}><FeatureCard icon={Zap} title="Réponse Instantanée" description="Temps de réponse inférieur à 1 seconde." color="yellow" /></AnimatedSection>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Comment ça <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">marche ?</span>
            </h2>
            <p className="text-xl text-gray-400">3 étapes simples</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <AnimatedSection delay={0}><StepCard number="1" title="Créez votre compte" description="Inscrivez-vous en 2 minutes." /></AnimatedSection>
            <AnimatedSection delay={200}><StepCard number="2" title="Connectez WhatsApp" description="Scannez un QR code." /></AnimatedSection>
            <AnimatedSection delay={400}><StepCard number="3" title="Laissez l'IA travailler" description="Réponses automatiques 24/7." /></AnimatedSection>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ils nous font <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">confiance</span>
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedSection delay={0}><TestimonialCard name="Marie D." role="Coiffeuse" text="J'ai gagné 15h par semaine ! Magique !" rating={5} /></AnimatedSection>
            <AnimatedSection delay={200}><TestimonialCard name="Thomas L." role="Restaurateur" text="Mes réservations ont augmenté de 40%." rating={5} /></AnimatedSection>
            <AnimatedSection delay={400}><TestimonialCard name="Sophie M." role="Coach sportif" text="Mes clients adorent la réactivité." rating={5} /></AnimatedSection>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Tarifs <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">simples</span>
            </h2>
            <p className="text-xl text-gray-400">30 jours d&apos;essai gratuit • Sans engagement</p>
          </AnimatedSection>

          <AnimatedSection className="max-w-md mx-auto">
            <PricingCard
              name="Mensuel"
              price="19.99"
              popular
              features={[
                'Messages illimités',
                'Rendez-vous illimités',
                'Bot IA GPT-4o-mini',
                'WhatsApp Business',
                'Calendrier RDV',
                'Analytics complets',
                'Menu Manager',
                'Support email'
              ]}
            />
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6 relative z-10">
        <AnimatedSection>
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-xl rounded-3xl p-12 border border-purple-500/30">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Prêt à automatiser votre <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">business ?</span>
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              Rejoignez des milliers de commerçants
            </p>
            <Link href="/signup" className="group inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-purple-600 font-bold py-4 px-12 rounded-xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transform hover:-translate-y-1 transition-all text-lg">
              Commencer gratuitement
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 relative z-10 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                ReplyFast AI
              </span>
            </div>
            <p className="text-gray-500 text-sm">© 2024 ReplyFast AI. Tous droits réservés.</p>
            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
              <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
              <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
