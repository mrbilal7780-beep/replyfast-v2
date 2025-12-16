import '../styles/globals.css'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

function MyApp({ Component, pageProps }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Redirect logic
  useEffect(() => {
    if (loading) return

    const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password']
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
