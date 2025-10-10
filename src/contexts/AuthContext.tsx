import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthUser, LoginFormData } from '../types/database'
import { signIn, signOut, getCurrentUser } from '../lib/auth'
import { supabase, isDbLoadingBlocked } from '../lib/supabase'
import { initializeVersionSystem } from '../version'
import AuthErrorFallback from '../components/AuthErrorFallback'

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

        // SOLUÇÃO ULTRA RADICAL: SEMPRE definir loading=false IMEDIATAMENTE
    console.log('[AuthContext] 🚀 ULTRA RADICAL: definindo loading=false IMEDIATAMENTE')
    setLoading(false)
    setUser(null)
    
    // Verificação em background (não bloqueia UI)
    const checkUser = async () => {
      if (!isMounted) return
      
      try {
        console.log('[AuthContext] 🔄 Verificando sessão em background...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn('⚠️ Erro ao verificar sessão em background:', error)
          return
        }

        if (session?.user && isMounted) {
          console.log('✅ Sessão encontrada em background, carregando dados...')
          try {
            const userData = await getCurrentUser()
            if (isMounted) {
              setUser(userData)
              console.log('✅ Usuário carregado em background')
            }
          } catch (userError) {
            console.warn('⚠️ Erro ao carregar dados em background:', userError)
          }
        }
      } catch (error) {
        console.warn('⚠️ Erro na verificação em background:', error)
      }
    }

    // Verificar em background (não bloqueia UI)
    checkUser()

        // Cleanup
        return () => {
          isMounted = false
        }
  }, [])

  // Listener simplificado para evitar loops
  useEffect(() => {
    let isMounted = true
    let lastEventTime = 0
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const now = Date.now()
      
      // Prevenir eventos duplicados em menos de 1 segundo
      if (now - lastEventTime < 1000) {
        console.log('🚫 Evento de auth duplicado ignorado:', event)
        return
      }
      lastEventTime = now
      
      console.log('Auth state change:', event, session?.user?.email)
      
      if (!isMounted) return
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('[AuthContext] ✅ Usuário logado via listener - carregando dados reais')
        if (isMounted) {
          try {
            // Buscar dados reais do usuário em vez de usar role padrão
            const userData = await getCurrentUser()
            if (isMounted && userData) {
              setUser(userData)
              setError(null)
              setLoading(false)
              console.log('[AuthContext] ✅ Dados reais do usuário carregados via listener:', userData.email)
            } else if (isMounted) {
              console.log('[AuthContext] ⚠️ getCurrentUser retornou null, mantendo estado atual')
            }
          } catch (error) {
            console.error('[AuthContext] ❌ Erro ao carregar dados do usuário via listener:', error)
            if (isMounted) {
              // Não limpar o usuário se já está logado via login direto
              // Apenas garantir que loading está false
              setLoading(false)
            }
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 Usuário deslogado via listener')
        if (isMounted) {
          setUser(null)
          setError(null)
          setLoading(false)
        }
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = async (credentials: LoginFormData): Promise<boolean> => {
    try {
      setError(null)
      setLoading(true)
      
      console.log('[AuthContext] 🔐 Iniciando processo de login...')
      const userData = await signIn(credentials)
      
      if (userData) {
        console.log('[AuthContext] ✅ Login bem-sucedido, definindo usuário:', userData.email)
        setUser(userData)
        setLoading(false)
        return true
      }
      
      console.log('[AuthContext] ❌ Login falhou - usuário não encontrado')
      setLoading(false)
      return false
    } catch (error) {
      console.error('[AuthContext] ❌ Erro no login:', error)
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
        // Cache removido - dados sempre carregados do banco
        console.log('[Auth] Dados locais limpos')
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
        // Cache removido - dados sempre carregados do banco
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