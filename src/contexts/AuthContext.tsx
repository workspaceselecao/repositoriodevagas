import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthUser, LoginFormData } from '../types/database'
import { signIn, signOut, getCurrentUser } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { useUpdateCheck } from '../hooks/useUpdateCheck'
import UpdateModal from '../components/UpdateModal'

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
  const [isInitializing, setIsInitializing] = useState(false)
  
  // Hook para verificar atualizações quando usuário faz login
  const {
    showModal,
    handleUpdate,
    handleCloseModal,
    checkForUpdates
  } = useUpdateCheck({
    checkOnMount: false, // Não verificar na montagem
    showModalDelay: 3000 // 3 segundos após login
  })

  useEffect(() => {
    let isMounted = true
    let hasInitialized = false
    let timeoutId: NodeJS.Timeout | null = null

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
    }, 5000) // 5 segundos máximo

    // Verificar sessão atual do Supabase de forma rápida
    const checkUser = async () => {
      if (hasInitialized || isInitializing) return
      
      setIsInitializing(true)
      
      try {
        // Verificar sessão com timeout curto
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Session timeout')), 2000)
        })

        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any
        
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        
        if (session?.user && isMounted) {
          // Usar dados do Auth diretamente para ser mais rápido
          const authUser = session.user
          const currentUser = {
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuário',
            role: authUser.user_metadata?.role || 'RH'
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
        
        // Em caso de erro, limpar estado imediatamente
        if (isMounted) {
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

    // Escutar mudanças de autenticação (simplificado)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (!isMounted) return
        
        console.log('Auth state change:', event)
        
        if (event === 'SIGNED_IN' && session) {
          // Usar dados do Auth diretamente para ser mais rápido
          const authUser = session.user
          const currentUser = {
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuário',
            role: authUser.user_metadata?.role || 'RH'
          }
          
          if (isMounted) {
            setUser(currentUser)
            setLoading(false)
            setInitialized(true)
            
            // Verificar atualizações após login bem-sucedido
            setTimeout(() => {
              checkForUpdates()
            }, 1000) // Aguardar 1 segundo após login
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
      
      {/* Modal de atualização */}
      <UpdateModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onUpdate={handleUpdate}
      />
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
