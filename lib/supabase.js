import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create supabase client only if env vars are available
let supabase = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
}

export { supabase }

// Helper functions
export const getCurrentUser = async () => {
  if (!supabase) return null
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const signIn = async (email, password) => {
  if (!supabase) throw new Error('Supabase not initialized')
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export const signUp = async (email, password, metadata = {}) => {
  if (!supabase) throw new Error('Supabase not initialized')
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })
  if (error) throw error
  return data
}

export const signOut = async () => {
  if (!supabase) throw new Error('Supabase not initialized')
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const resetPassword = async (email) => {
  if (!supabase) throw new Error('Supabase not initialized')
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  })
  if (error) throw error
  return data
}

export const updatePassword = async (newPassword) => {
  if (!supabase) throw new Error('Supabase not initialized')
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  })
  if (error) throw error
  return data
}
