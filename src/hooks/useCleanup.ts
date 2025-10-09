import { useEffect } from 'react'

/**
 * Hook para gerenciar limpeza de cache e recursos quando a aplicação é fechada
 */
export function useCleanup() {
  useEffect(() => {
    console.log('[useCleanup] Sistema de limpeza ativo')

    // Função para limpar cache e sessões
    const cleanupResources = () => {
      console.log('[useCleanup] Limpando recursos...')
      
      try {
        // Limpar sessionStorage (mas manter alguns dados críticos)
        const itemsToKeep = [
          'supabase.auth.token',
          'sb-mywaoaofatgwbbtyqfpd-auth-token'
        ]
        
        const sessionKeys = Object.keys(sessionStorage)
        sessionKeys.forEach(key => {
          if (!itemsToKeep.some(item => key.includes(item))) {
            sessionStorage.removeItem(key)
          }
        })

        // Limpar cache específico da aplicação no localStorage
        const cacheKeys = [
          'vagas-cache',
          'clientes-cache',
          'reports-cache',
          'dashboard-cache',
          'last-fetch',
          'cache-timestamp'
        ]
        
        cacheKeys.forEach(key => {
          localStorage.removeItem(key)
        })

        console.log('[useCleanup] ✅ Cache limpo com sucesso')
      } catch (error) {
        console.error('[useCleanup] Erro ao limpar cache:', error)
      }
    }

    // Detectar quando a aplicação está sendo fechada
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Limpar recursos imediatamente
      cleanupResources()
      
      // Não mostrar confirmação para o usuário
      // delete event.returnValue;
    }

    // Detectar visibilidade da página
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('[useCleanup] Página ficou invisível, preparando limpeza...')
        // Limpar após 1 minuto de inatividade
        setTimeout(() => {
          if (document.visibilityState === 'hidden') {
            cleanupResources()
          }
        }, 60000)
      } else {
        console.log('[useCleanup] Página voltou a ficar visível')
      }
    }

    // Detectar quando o usuário sai da página
    const handlePageHide = () => {
      console.log('[useCleanup] Página sendo ocultada, limpando recursos...')
      cleanupResources()
    }

    // Adicionar listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', handlePageHide)

    // Limpeza ao desmontar o componente
    return () => {
      console.log('[useCleanup] Desmontando hook de limpeza')
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [])

  // Retornar função de limpeza manual se necessário
  return {
    cleanupCache: () => {
      const cacheKeys = [
        'vagas-cache',
        'clientes-cache',
        'reports-cache',
        'dashboard-cache',
        'last-fetch',
        'cache-timestamp'
      ]
      
      cacheKeys.forEach(key => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })
      
      console.log('[useCleanup] Cache limpo manualmente')
    }
  }
}
