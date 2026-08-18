import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

const DEMO_SESSION = {
  user: {
    id: 'demo-user-kemenag',
    email: 'demo@kemenag.go.id',
    user_metadata: {
      full_name: 'Pengawas Kemenag / Tamu',
      nip: '19850101 201001 1 001',
      role: 'demo',
    },
  },
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    // Check if demo mode was previously active
    if (localStorage.getItem('is_demo_mode') === 'true') {
      setSession(DEMO_SESSION)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (localStorage.getItem('is_demo_mode') === 'true') {
        setSession(DEMO_SESSION)
      } else {
        setSession(session)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Derive display name + NIP from session user_metadata
  useEffect(() => {
    if (session?.user) {
      const meta = session.user.user_metadata
      setProfile({
        id:     session.user.id,
        email:  session.user.email,
        name:   meta?.full_name || meta?.name || session.user.email?.split('@')[0] || 'Guru',
        nip:    meta?.nip || '',
        isDemo: meta?.role === 'demo' || session.user.id === 'demo-user-kemenag',
      })
    } else {
      setProfile(null)
    }
  }, [session])

  const signIn = async (email, password) => {
    // Demo credentials shortcut
    if (email.toLowerCase().startsWith('demo') && password === 'demo') {
      return loginAsDemo()
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const loginAsDemo = () => {
    localStorage.setItem('is_demo_mode', 'true')
    setSession(DEMO_SESSION)
    return { data: DEMO_SESSION, error: null }
  }

  const signOut = async () => {
    localStorage.removeItem('is_demo_mode')
    setSession(null)
    setProfile(null)
    try {
      await supabase.auth.signOut()
    } catch {
      // ignore
    }
  }

  /**
   * Update the logged-in user's display name and NIP.
   */
  const updateProfile = async ({ name, nip }) => {
    if (profile?.isDemo) {
      setProfile((prev) => ({ ...prev, name, nip: nip ?? '' }))
      return { data: { name, nip } }
    }
    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: name,
        nip: nip ?? '',
      },
    })
    if (error) return { error }
    setProfile((prev) => ({ ...prev, name, nip: nip ?? '' }))
    return { data }
  }

  const isLoading = session === undefined

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        isLoading,
        isDemo: profile?.isDemo || false,
        signIn,
        loginAsDemo,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
