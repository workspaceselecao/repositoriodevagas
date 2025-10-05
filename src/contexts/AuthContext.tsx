import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthUser, LoginFormData } from '../types/database'
import { signIn, signOut, getCurrentUser } from '../lib/auth'
import { supabase, isDbLoadingBlocked } from '../lib/supabase'
import { initializeVersionSystem } from '../version'
import AuthErrorFallback from '../components/AuthErrorFallback'
import { cacheManager } from '../lib/cacheManager'

interface AuthContextType {
  user: AuthUser | null
  login: (credentials: LoginFormData) => Promise<boolean>
  logout: () => Promise<void>
  loading: boolean
  error: Error | null
  retry: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    // Inicializar sistema de versão em background
    initializeVersionSystem()

    // Verificação imediata de sessão - SEM timeout
    const checkUser = async () => {
      if (!isMounted) return
      
      try {
        // Verificar se o carregamento está bloqueado
        if (isDbLoadingBlocked()) {
          console.log('🚫 Carregamento bloqueado - permitindo acesso sem login')
          setUser(null)
          setLoading(false)
          return
        }
        
        // Verificação imediata de sessão
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn('⚠️ Erro ao verificar sessão:', error)
          if (isMounted) {
            setUser(null)
            setLoading(false)
          }
          return
        }

        if (session?.user && isMounted) {
          console.log('✅ Sessão encontrada, carregando dados do usuário...')
          try {
            const userData = await getCurrentUser()
            if (isMounted) {
              setUser(userData)
              setLoading(false)
              console.log('✅ Usuário autenticado automaticamente')
            }
          } catch (userError) {
            console.error('❌ Erro ao carregar dados do usuário:', userError)
            if (isMounted) {
              setUser(null)
              setLoading(false)
            }
          }
        } else if (isMounted) {
          console.log('❌ Nenhuma sessão encontrada')
          setUser(null)
          setLoading(false)
        }

      } catch (error) {
        console.error('❌ Erro na verificação de usuário:', error)
        if (isMounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    // Iniciar verificação imediatamente
    checkUser()

    // Cleanup
    return () => {
      isMounted = false
    }
  }, [])

  // Listener para mudanças de autenticação simplificado
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          console.log('✅ Usuário logado, carregando dados...')
          const userData = await getCurrentUser()
          setUser(userData)
          setError(null)
          setLoading(false)
        } catch (error) {
          console.error('❌ Erro ao carregar dados do usuário:', error)
          setError(error as Error)
          setLoading(false)
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 Usuário deslogado')
        setUser(null)
        setError(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (credentials: LoginFormData): Promise<boolean> => {
    try {
      setError(null)
      setLoading(true)
      
      const userData = await signIn(credentials)
      
      if (userData) {
        setUser(userData)
        setLoading(false)
        return true
      }
      
      setLoading(false)
      return false
    } catch (error) {
      console.error('❌ Erro no login:', error)
      setError(error as Error)
      setLoading(false)
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      console.log('[Auth] Logging out...')
      setError(null)
      
      // 1. Limpar cache antes de fazer logout
      try {
        if (cacheManager.isSupported()) {
          await cacheManager.clear()
          console.log('[Auth] Cache cleared successfully')
        }
      } catch (cacheError) {
        console.warn('[Auth] Error clearing cache:', cacheError)
        // Não falhar o logout por erro no cache
      }
      
      // 2. Logout do Supabase
      await signOut()
      
      // 3. Limpar estado local
      setUser(null)
      
      console.log('[Auth] Logout successful')
    } catch (error) {
      console.error('[Auth] Logout error:', error)
      setError(error as Error)
      
      // Mesmo com erro, limpar dados locais e cache
      try {
        if (cacheManager.isSupported()) {
          await cacheManager.clear()
        }
        setUser(null)
      } catch (cleanupError) {
        console.error('[Auth] Error during cleanup:', cleanupError)
      }
    }
  }

  const retry = () => {
    setError(null)
    setLoading(true)
    
    // Recarregar a página para tentar novamente
    window.location.reload()
  }

  const value = {
    user,
    login,
    logout,
    loading,
    error,
    retry
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