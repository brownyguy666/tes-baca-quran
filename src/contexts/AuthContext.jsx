import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Derive display name from session user_metadata
  useEffect(() => {
    if (session?.user) {
      const meta = session.user.user_metadata
      setProfile({
        id:    session.user.id,
        email: session.user.email,
        name:  meta?.full_name || meta?.name || session.user.email?.split('@')[0] || 'Guru',
      })
    } else {
      setProfile(null)
    }
  }, [session])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  /**
   * Update the logged-in user's display name.
   * Persists to Supabase user_metadata.full_name
   * and immediately reflects in the profile context.
   */
  const updateProfile = async ({ name }) => {
    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: name },
    })
    if (error) return { error }
    // Reflect change immediately without waiting for auth state change
    setProfile((prev) => ({ ...prev, name }))
    return { data }
  }

  const isLoading = session === undefined

  return (
    <AuthContext.Provider value={{ session, profile, isLoading, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
