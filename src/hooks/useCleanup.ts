import { useEffect } from 'react'

/**
 * Hook para gerenciar limpeza de cache e recursos quando a aplicação é fechada
 */
export function useCleanup() {
  useEffect(() => {
    console.log('[useCleanup] Sistema de limpeza ativo')

    // Função para limpar cache e sessões (versão mais conservadora)
    const cleanupResources = () => {
      console.log('[useCleanup] Limpando recursos...')
      
      try {
        // CORREÇÃO: Não limpar sessionStorage automaticamente
        // Manter todos os tokens de autenticação e dados de sessão
        console.log('[useCleanup] Mantendo dados de sessão intactos')

        // CORREÇÃO: Limpar apenas caches temporários, não dados persistentes
        const temporaryCacheKeys = [
          'temp-cache',
          'background-fetch',
          'loading-state'
        ]
        
        // Limpar apenas caches temporários
        temporaryCacheKeys.forEach(key => {
          if (localStorage.getItem(key)) {
            localStorage.removeItem(key)
          }
          if (sessionStorage.getItem(key)) {
            sessionStorage.removeItem(key)
          }
        })

        // CORREÇÃO: NÃO limpar caches principais que podem ser necessários
        // para restaurar o estado da aplicação após reabrir
        console.log('[useCleanup] ✅ Limpeza conservadora concluída (mantendo dados importantes)')
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

    // CORREÇÃO: Sistema de visibilidade simplificado e funcional
    let cleanupTimeout: NodeJS.Timeout | null = null
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('[useCleanup] Página ficou invisível - aguardando...')
        // CORREÇÃO CRÍTICA: Não fazer limpeza automática por invisibilidade
        // Isso estava causando o problema de invisibilidade
        console.log('[useCleanup] Limpeza automática por invisibilidade DESABILITADA para evitar problemas')
      } else {
        console.log('[useCleanup] Página voltou a ficar visível')
        // Cancelar qualquer limpeza pendente
        if (cleanupTimeout) {
          clearTimeout(cleanupTimeout)
          cleanupTimeout = null
        }
      }
    }

    // CORREÇÃO CRÍTICA: Desabilitar limpeza automática no pagehide
    const handlePageHide = () => {
      console.log('[useCleanup] Página sendo ocultada - limpeza automática DESABILITADA')
      // CORREÇÃO: Não fazer limpeza automática no pagehide para evitar invisibilidade
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
      
      // Limpar timeout se existir
      if (cleanupTimeout) {
        clearTimeout(cleanupTimeout)
        cleanupTimeout = null
      }
    }
  }, [])

  // Retornar função de limpeza manual se necessário
  return {
    cleanupCache: () => {
      // CORREÇÃO: Função de limpeza manual mais conservadora
      const temporaryCacheKeys = [
        'temp-cache',
        'background-fetch',
        'loading-state'
      ]
      
      temporaryCacheKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key)
        }
        if (sessionStorage.getItem(key)) {
          sessionStorage.removeItem(key)
        }
      })
      
      console.log('[useCleanup] Cache temporário limpo manualmente (mantendo dados importantes)')
    }
  }
}
