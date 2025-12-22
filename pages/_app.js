import '../styles/globals.css'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

// Import supabase dynamically to avoid build-time errors
let supabase = null
if (typeof window !== 'undefined') {
  import('../lib/supabase').then((module) => {
    supabase = module.supabase
  })
}

function MyApp({ Component, pageProps }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [supabaseClient, setSupabaseClient] = useState(null)
  const router = useRouter()

  // Initialize supabase on client side
  useEffect(() => {
    const initSupabase = async () => {
      const { supabase: client } = await import('../lib/supabase')
      setSupabaseClient(client)
    }
    initSupabase()
  }, [])

  useEffect(() => {
    if (!supabaseClient) return

    // Get initial session
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabaseClient])

  // Redirect logic
  useEffect(() => {
    if (loading) return

    const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/cgu', '/privacy', '/faq']
    const isPublicRoute = publicRoutes.includes(router.pathname)

    if (!session && !isPublicRoute) {
      router.push('/login')
    }

    if (session && (router.pathname === '/login' || router.pathname === '/signup')) {
      router.push('/dashboard')
    }
  }, [session, loading, router.pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  return <Component {...pageProps} session={session} />
}

export default MyApp
