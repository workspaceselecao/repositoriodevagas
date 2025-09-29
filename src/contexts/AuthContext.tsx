import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthUser, LoginFormData } from '../types/database'
import { signIn, signOut, getCurrentUser } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { initializeVersionSystem } from '../version'
import AuthErrorFallback from '../components/AuthErrorFallback'
import ErrorFallback from '../components/ErrorFallback'

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
  const [initialized, setInitialized] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    let isMounted = true
    let hasInitialized = false
    let timeoutId: NodeJS.Timeout | null = null

    // Inicializar sistema de versão
    initializeVersionSystem()

    // Timeout de segurança para evitar travamento
    const safetyTimeout = setTimeout(() => {
      if (isMounted && !hasInitialized) {
        console.warn('⚠️ Timeout de segurança - forçando inicialização')
        setUser(null)
        setLoading(false)
        setInitialized(true)
        setIsInitializing(false)
        hasInitialized = true
      }
    }, 15000) // Aumentado para 15 segundos

    // Verificar sessão atual do Supabase de forma rápida
    const checkUser = async (retryCount = 0) => {
      if (hasInitialized || isInitializing) return
      
      setIsInitializing(true)
      
      // Verificar conectividade antes de tentar autenticação
      if (!navigator.onLine) {
        console.warn('⚠️ Sem conexão com a internet - aguardando reconexão')
        setTimeout(() => checkUser(retryCount), 2000)
        return
      }
      
      try {
        // Verificar sessão com timeout mais generoso e melhor tratamento
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Session timeout - operação demorou mais que 15 segundos')), 15000) // Aumentado para 15 segundos
        })

        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any
        
        // Verificar se há erro na resposta do Supabase
        if (error) {
          console.warn('Erro ao obter sessão:', error.message)
          throw new Error(`Erro de autenticação: ${error.message}`)
        }
        
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        
        if (session?.user && isMounted) {
          // Verificar se estamos na página de reset de senha
          const isPasswordRecovery = window.location.pathname === '/reset-password'
          
          if (isPasswordRecovery) {
            // Para sessões de recuperação, manter user como null mas permitir acesso à página
            console.log('Sessão de recuperação detectada na inicialização - permitindo acesso à página de reset')
            if (isMounted) {
              setUser(null)
              hasInitialized = true
              setLoading(false)
              setInitialized(true)
              setIsInitializing(false)
              clearTimeout(safetyTimeout)
              return
            }
          } else {
            // Buscar dados completos do usuário na tabela users
            const authUser = session.user
            let currentUser = {
              id: authUser.id,
              email: authUser.email || '',
              name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuário',
              role: authUser.user_metadata?.role || 'RH'
            }

            // Tentar buscar dados completos da tabela users
            try {
              const { data: userData, error: userError } = await supabase
                .from('users')
                .select('name, role')
                .eq('id', authUser.id)
                .single()

              if (!userError && userData) {
                currentUser = {
                  id: authUser.id,
                  email: authUser.email || '',
                  name: userData.name || currentUser.name,
                  role: userData.role || currentUser.role
                }
              }
            } catch (error) {
              console.log('Erro ao buscar dados do usuário na tabela:', error)
            }
            
            if (isMounted) {
              setUser(currentUser)
              hasInitialized = true
              setLoading(false)
              setInitialized(true)
              setIsInitializing(false)
              clearTimeout(safetyTimeout)
              return
            }
          }
        }
        
        // Se não há sessão, limpar estado
        if (isMounted) {
          setUser(null)
          hasInitialized = true
          setLoading(false)
          setInitialized(true)
          setIsInitializing(false)
          clearTimeout(safetyTimeout)
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error)
        
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        
        // Em caso de erro, tentar uma abordagem mais robusta
        if (isMounted) {
          const errorMessage = (error as Error)?.message || 'Erro desconhecido'
          
          // Se for timeout, tentar verificar sessão local
          if (errorMessage.includes('timeout')) {
            console.warn('⚠️ Timeout na verificação de sessão - tentando verificação local')
            try {
              const localSession = localStorage.getItem('sb-mywaoaofatgwbbtyqfpd-auth-token')
              if (localSession) {
                console.log('Sessão local encontrada, tentando restaurar...')
                // Tentar restaurar sessão local
                const sessionData = JSON.parse(localSession)
                if (sessionData?.access_token) {
                  setUser(sessionData.user)
                  hasInitialized = true
                  setLoading(false)
                  setInitialized(true)
                  setIsInitializing(false)
                  clearTimeout(safetyTimeout)
                  return
                }
              }
            } catch (localError) {
              console.warn('Erro ao verificar sessão local:', localError)
            }
          }
          
          // Tentar retry se for erro de rede e ainda temos tentativas
          if (errorMessage.includes('timeout') && retryCount < 2) {
            console.warn(`⚠️ Tentativa ${retryCount + 1} falhou - tentando novamente em 3 segundos...`)
            setTimeout(() => {
              if (isMounted) {
                setIsInitializing(false)
                checkUser(retryCount + 1)
              }
            }, 3000)
            return
          }
          
          console.warn('⚠️ Erro na verificação de sessão - permitindo acesso sem autenticação')
          setError(new Error(`Erro de autenticação: ${errorMessage}`))
          setUser(null)
          hasInitialized = true
          setLoading(false)
          setInitialized(true)
          setIsInitializing(false)
          clearTimeout(safetyTimeout)
        }
      }
    }

    checkUser()

    // Escutar mudanças de conectividade
    const handleOnline = () => {
      console.log('🌐 Conexão restaurada - verificando autenticação...')
      setIsOnline(true)
      if (!hasInitialized && !isInitializing) {
        setTimeout(() => checkUser(), 1000)
      }
    }

    const handleOffline = () => {
      console.warn('🌐 Conexão perdida - pausando verificações de autenticação')
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Escutar mudanças de autenticação (simplificado)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (!isMounted) return
        
        console.log('Auth state change:', event)
        
        if (event === 'SIGNED_IN' && session) {
          // Verificar se é uma sessão de recuperação de senha
          const isPasswordRecovery = window.location.pathname === '/reset-password'
          
          if (isPasswordRecovery) {
            // Para sessões de recuperação, manter user como null mas não redirecionar
            console.log('Sessão de recuperação de senha detectada - permitindo acesso à página de reset')
            if (isMounted) {
              setUser(null)
              setLoading(false)
              setInitialized(true)
            }
          } else {
            // Sessão normal de login
            const authUser = session.user
            let currentUser = {
              id: authUser.id,
              email: authUser.email || '',
              name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuário',
              role: authUser.user_metadata?.role || 'RH'
            }

            // Tentar buscar dados completos da tabela users
            try {
              const { data: userData, error: userError } = await supabase
                .from('users')
                .select('name, role')
                .eq('id', authUser.id)
                .single()

              if (!userError && userData) {
                currentUser = {
                  id: authUser.id,
                  email: authUser.email || '',
                  name: userData.name || currentUser.name,
                  role: userData.role || currentUser.role
                }
              }
            } catch (error) {
              console.log('Erro ao buscar dados do usuário na tabela:', error)
            }
            
            if (isMounted) {
              setUser(currentUser)
              setLoading(false)
              setInitialized(true)
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setUser(null)
            setLoading(false)
            setInitialized(true)
            // Limpar cache local
            const supabaseProjectId = import.meta.env.VITE_SUPABASE_PROJECT_ID
            if (supabaseProjectId) {
              localStorage.removeItem(`sb-${supabaseProjectId}-auth-token`)
              localStorage.removeItem(`sb-${supabaseProjectId}-auth-token-code-verifier`)
            }
          }
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token renovado com sucesso')
        }
      }
    )

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
      if (safetyTimeout) clearTimeout(safetyTimeout)
      subscription.unsubscribe()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
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

  const retry = () => {
    setError(null)
    setLoading(true)
    setInitialized(false)
    setIsInitializing(false)
    // Tentar verificar autenticação novamente
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const goHome = () => {
    window.location.href = '/'
  }

  const value = {
    user,
    login,
    logout,
    loading,
    error,
    retry
  }

  // Se há erro e não está carregando, mostrar fallback
  if (error && !loading && !isInitializing) {
    return (
      <AuthContext.Provider value={value}>
        <AuthErrorFallback 
          error={error}
          onRetry={retry}
          onGoHome={goHome}
          isOnline={isOnline}
        />
      </AuthContext.Provider>
    )
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
