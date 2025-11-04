import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthUser, LoginFormData } from '../types/database'
import { signIn, signOut, getCurrentUser } from '../lib/auth'
import { supabase, isDbLoadingBlocked } from '../lib/supabase'
import AuthErrorFallback from '../components/AuthErrorFallback'

interface AuthContextType {
  user: AuthUser | null
  login: (credentials: LoginFormData) => Promise<boolean>
  logout: () => Promise<void>
  loading: boolean
  error: Error | null
  retry: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    // SOLUÇÃO DEFINITIVA: Aguardar verificação de sessão antes de definir loading=false
    console.log('[AuthContext] 🚀 Inicializando: verificando sessão primeiro...')
    
    const checkUser = async () => {
      if (!isMounted) return
      
      try {
        console.log('[AuthContext] 🔄 Verificando sessão existente...')
        
        // Adicionar timeout para evitar espera infinita
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout ao verificar sessão. Verifique sua conexão com a internet.')), 10000)
        })
        
        const sessionPromise = supabase.auth.getSession()
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any
        
        if (error) {
          console.error('[AuthContext] ❌ Erro ao verificar sessão:', error)
          
          // Verificar se é erro crítico (rede, conexão, etc)
          const isCriticalError = error.message?.includes('network') || 
                                  error.message?.includes('fetch') ||
                                  error.message?.includes('timeout') ||
                                  error.message?.includes('Failed to fetch') ||
                                  error.status === 0 // Erro de rede
          
          if (isMounted) {
            if (isCriticalError) {
              // Erro crítico - definir como erro fatal
              setError(new Error(`Erro de conexão: ${error.message || 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.'}`))
              setLoading(false)
              setUser(null)
              return
            } else {
              // Erro não crítico - continuar normalmente
              setLoading(false)
              setUser(null)
            }
          }
          return
        }

        if (session?.user && isMounted) {
          console.log('[AuthContext] ✅ Sessão encontrada, carregando dados do usuário...')
          try {
            // Adicionar timeout para getCurrentUser também
            const userDataPromise = getCurrentUser()
            const userDataTimeoutPromise = new Promise<null>((resolve) => {
              setTimeout(() => resolve(null), 5000) // 5 segundos de timeout
            })
            
            const userData = await Promise.race([userDataPromise, userDataTimeoutPromise])
            
            if (isMounted && userData) {
              setUser(userData)
              setLoading(false)
              setError(null) // Limpar qualquer erro anterior
              console.log('[AuthContext] ✅ Usuário carregado automaticamente')
            } else if (isMounted) {
              // getCurrentUser retornou null ou timeout - tentar usar dados básicos do Auth
              console.warn('[AuthContext] ⚠️ getCurrentUser retornou null, usando dados básicos do Auth')
              
              // Usar dados básicos da sessão como fallback
              const basicUser = {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
                role: session.user.user_metadata?.role || 'RH'
              }
              
              setUser(basicUser)
              setLoading(false)
              setError(null)
              console.log('[AuthContext] ✅ Usuário básico carregado como fallback')
            }
          } catch (userError: any) {
            console.error('[AuthContext] ❌ Erro ao carregar dados do usuário:', userError)
            
            // Verificar se é erro crítico
            const isCriticalError = userError.message?.includes('network') || 
                                    userError.message?.includes('fetch') ||
                                    userError.message?.includes('timeout') ||
                                    userError.message?.includes('Failed to fetch') ||
                                    userError.message?.includes('Timeout')
            
            if (isMounted) {
              if (isCriticalError) {
                setError(new Error(`Erro ao carregar dados do usuário: ${userError.message || 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.'}`))
              } else {
                // Erro não crítico - tentar usar dados básicos da sessão
                console.warn('[AuthContext] ⚠️ Erro não crítico, tentando usar dados básicos da sessão')
                try {
                  const basicUser = {
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
                    role: session.user.user_metadata?.role || 'RH'
                  }
                  setUser(basicUser)
                  setError(null)
                  console.log('[AuthContext] ✅ Usuário básico carregado após erro não crítico')
                } catch (fallbackError) {
                  console.error('[AuthContext] ❌ Erro no fallback:', fallbackError)
                  setError(new Error('Erro ao carregar dados do usuário. Tente fazer login novamente.'))
                }
              }
              setLoading(false)
            }
          }
        } else {
          // Sem sessão, definir loading=false
          if (isMounted) {
            setLoading(false)
            setUser(null)
            setError(null) // Limpar qualquer erro anterior
            console.log('[AuthContext] ❌ Nenhuma sessão encontrada')
          }
        }
      } catch (error: any) {
        console.error('[AuthContext] ❌ Erro na verificação de sessão:', error)
        
        // Verificar se é timeout ou erro crítico
        const isCriticalError = error.message?.includes('Timeout') ||
                                error.message?.includes('network') ||
                                error.message?.includes('fetch') ||
                                error.message?.includes('Failed to fetch')
        
        if (isMounted) {
          if (isCriticalError) {
            setError(new Error(error.message || 'Erro ao inicializar aplicação. Verifique sua conexão com a internet.'))
          } else {
            setError(new Error('Erro ao inicializar aplicação. Tente novamente.'))
          }
          setLoading(false)
          setUser(null)
        }
      }
    }

    // Verificar sessão existente ANTES de mostrar a UI
    checkUser()

    return () => {
      isMounted = false
    }
  }, [])

  // SOLUÇÃO RADICAL: Remover listener automático para evitar loops
  // O listener estava causando loops infinitos, especialmente após períodos de inatividade
  // Agora usamos apenas verificação manual quando necessário
  useEffect(() => {
    console.log('[AuthContext] 🔧 Listener automático desabilitado para evitar loops')
    
    // Função para verificação manual de sessão (chamada apenas quando necessário)
    const manualSessionCheck = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn('[AuthContext] ⚠️ Erro na verificação manual de sessão:', error)
          return
        }

        if (session?.user && !user) {
          console.log('[AuthContext] ✅ Sessão encontrada na verificação manual, carregando dados...')
          const userData = await getCurrentUser()
          if (userData) {
            setUser(userData)
            setLoading(false)
            console.log('[AuthContext] ✅ Usuário carregado via verificação manual:', userData.email)
          }
        }
      } catch (error) {
        console.error('[AuthContext] ❌ Erro na verificação manual:', error)
      }
    }

    // Expor função para uso externo
    ;(window as any).__manualSessionCheck = manualSessionCheck

    return () => {
      delete (window as any).__manualSessionCheck
    }
  }, [user])

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
        setError(null) // Garantir que não há erro
        return true
      }
      
      console.log('[AuthContext] ❌ Login falhou - usuário não encontrado')
      setLoading(false)
      // Não definir erro aqui - o signIn já deve ter lançado uma exceção ou retornado null
      return false
    } catch (error: any) {
      console.error('[AuthContext] ❌ Erro no login:', error)
      
      // Verificar se é erro crítico
      const errorMessage = error?.message || 'Erro ao fazer login. Tente novamente.'
      const isCriticalError = errorMessage.includes('network') || 
                              errorMessage.includes('fetch') ||
                              errorMessage.includes('timeout') ||
                              errorMessage.includes('Failed to fetch') ||
                              error?.status === 0
      
      if (isCriticalError) {
        setError(new Error(`Erro de conexão: ${errorMessage}`))
      } else {
        setError(new Error(errorMessage))
      }
      
      setLoading(false)
      setUser(null)
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

  const retry = async () => {
    setError(null)
    setLoading(true)
    
    try {
      console.log('[AuthContext] 🔄 Tentando novamente a inicialização...')
      
      // Tentar verificar sessão novamente
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        // Verificar se é erro crítico
        const isCriticalError = error.message?.includes('network') || 
                                error.message?.includes('fetch') ||
                                error.message?.includes('timeout') ||
                                error.message?.includes('Failed to fetch') ||
                                error.status === 0
        
        if (isCriticalError) {
          setError(new Error(`Erro de conexão: ${error.message || 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.'}`))
          setLoading(false)
          return
        }
      }

      if (session?.user) {
        try {
          const userData = await getCurrentUser()
          if (userData) {
            setUser(userData)
            setLoading(false)
            setError(null)
            console.log('[AuthContext] ✅ Retry bem-sucedido - usuário carregado')
            return
          }
        } catch (userError: any) {
          console.error('[AuthContext] ❌ Erro ao carregar dados do usuário no retry:', userError)
          setError(new Error(`Erro ao carregar dados: ${userError.message || 'Tente novamente.'}`))
          setLoading(false)
          return
        }
      }

      // Sem sessão - continuar normalmente
      setLoading(false)
      setUser(null)
      setError(null)
      console.log('[AuthContext] ✅ Retry concluído - sem sessão ativa')
    } catch (error: any) {
      console.error('[AuthContext] ❌ Erro no retry:', error)
      setError(new Error(error.message || 'Erro ao tentar novamente. Tente recarregar a página.'))
      setLoading(false)
    }
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