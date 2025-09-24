import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthUser, LoginFormData } from '../types/database'
import { signIn, signOut, getCurrentUser } from '../lib/auth'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: AuthUser | null
  login: (credentials: LoginFormData) => Promise<boolean>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let isMounted = true
    let retryCount = 0
    const maxRetries = 3
    let hasInitialized = false

    // Verificar sessão atual do Supabase com retry
    const checkUser = async () => {
      if (hasInitialized) return // Evitar múltiplas inicializações
      
      try {
        // Primeiro, verificar se já existe uma sessão ativa
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user && isMounted) {
          // Se há sessão, buscar dados do usuário
          const currentUser = await getCurrentUser()
          if (isMounted) {
            setUser(currentUser)
            hasInitialized = true
            setLoading(false)
            setInitialized(true)
            return
          }
        }
        
        // Se não há sessão, limpar estado
        if (isMounted) {
          setUser(null)
          hasInitialized = true
          setLoading(false)
          setInitialized(true)
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error)
        
        // Retry logic para evitar loop infinito
        if (retryCount < maxRetries && isMounted && !hasInitialized) {
          retryCount++
          console.log(`Tentativa ${retryCount} de verificar usuário...`)
          setTimeout(checkUser, 1000 * retryCount) // Delay progressivo
          return
        }
        
        // Se falhou todas as tentativas, limpar estado
        if (isMounted) {
          setUser(null)
          hasInitialized = true
          setLoading(false)
          setInitialized(true)
          // Limpar cache do Supabase apenas se necessário
          try {
            await supabase.auth.signOut()
          } catch (signOutError) {
            console.log('Erro ao fazer signOut:', signOutError)
          }
        }
      }
    }

    checkUser()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted || hasInitialized) return
        
        console.log('Auth state change:', event)
        
        if (event === 'SIGNED_IN' && session) {
          try {
            const currentUser = await getCurrentUser()
            if (isMounted) {
              setUser(currentUser)
              setLoading(false)
            }
          } catch (error) {
            console.error('Erro ao buscar usuário após login:', error)
            if (isMounted) {
              setUser(null)
              setLoading(false)
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setUser(null)
            setLoading(false)
            // Limpar cache local
            const supabaseProjectId = import.meta.env.VITE_SUPABASE_PROJECT_ID
            if (supabaseProjectId) {
              localStorage.removeItem(`sb-${supabaseProjectId}-auth-token`)
              localStorage.removeItem(`sb-${supabaseProjectId}-auth-token-code-verifier`)
            }
          }
        } else if (event === 'TOKEN_REFRESHED') {
          // Token foi renovado, não precisa fazer nada
          console.log('Token renovado com sucesso')
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = async (credentials: LoginFormData): Promise<boolean> => {
    try {
      setLoading(true)
      const userData = await signIn(credentials)
      
      if (userData) {
        setUser(userData)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Erro no login:', error)
      // Não precisamos fazer nada aqui, o erro será tratado no componente
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      
      // Fazer logout do Supabase
      await signOut()
      
      // Limpar estado local
      setUser(null)
      
      // Limpar cache do localStorage
      const supabaseProjectId = import.meta.env.VITE_SUPABASE_PROJECT_ID
      if (supabaseProjectId) {
        localStorage.removeItem(`sb-${supabaseProjectId}-auth-token`)
        localStorage.removeItem(`sb-${supabaseProjectId}-auth-token-code-verifier`)
      }
      
      // Limpar cache do sistema de vagas
      localStorage.removeItem('repositoriodevagas_cache')
      
      // Limpar cache do sessionStorage
      sessionStorage.clear()
      
      // Limpar cache do IndexedDB (se existir)
      if ('indexedDB' in window) {
        try {
          const deleteReq = indexedDB.deleteDatabase('supabase')
          deleteReq.onsuccess = () => console.log('Cache IndexedDB limpo')
        } catch (e) {
          console.log('Não foi possível limpar IndexedDB:', e)
        }
      }
      
      console.log('Logout realizado com sucesso - cache limpo')
      
    } catch (error) {
      console.error('Erro no logout:', error)
      // Mesmo com erro, limpar estado local
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
