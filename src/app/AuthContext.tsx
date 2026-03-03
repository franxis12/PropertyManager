import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  role: 'owner' | 'tenant'
}

type AuthContextValue = {
  user: User | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

type Props = {
  children: ReactNode
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(currentUser: User | null) {
    if (!currentUser) {
      setProfile(null)
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, phone, role')
      .eq('id', currentUser.id)
      .maybeSingle()

    if (error) {
      console.error('Error loading profile', error.message)
      setProfile(null)
      return
    }

    if (!data) {
      setProfile(null)
      return
    }

    setProfile(data as Profile)
  }

  async function refreshProfile() {
    const { data } = await supabase.auth.getUser()
    await loadProfile(data.user ?? null)
  }

  useEffect(() => {
    async function init() {
      setLoading(true)

      const { data } = await supabase.auth.getUser()
      const currentUser = data.user ?? null
      setUser(currentUser)
      await loadProfile(currentUser)

      setLoading(false)
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      await loadProfile(currentUser)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
