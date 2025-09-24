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

    // Verificar sessão atual do Supabase com retry
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (isMounted) {
          setUser(currentUser)
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error)
        
        // Retry logic para evitar loop infinito
        if (retryCount < maxRetries && isMounted) {
          retryCount++
          console.log(`Tentativa ${retryCount} de verificar usuário...`)
          setTimeout(checkUser, 1000 * retryCount) // Delay progressivo
          return
        }
        
        // Se falhou todas as tentativas, limpar estado
        if (isMounted) {
          setUser(null)
          // Limpar cache do Supabase
          await supabase.auth.signOut()
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    checkUser()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return
        
        console.log('Auth state change:', event)
        
        if (event === 'SIGNED_IN' && session) {
          try {
            const currentUser = await getCurrentUser()
            setUser(currentUser)
          } catch (error) {
            console.error('Erro ao buscar usuário após login:', error)
            setUser(null)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          // Limpar cache local
          localStorage.removeItem('sb-' + import.meta.env.VITE_SUPABASE_PROJECT_ID + '-auth-token')
        } else if (event === 'TOKEN_REFRESHED') {
          // Token foi renovado, não precisa fazer nada
          console.log('Token renovado com sucesso')
        }
        
        if (isMounted) {
          setLoading(false)
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
