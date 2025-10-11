import { useEffect } from 'react'
import { usePageVisibility } from './usePageVisibility'

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

    // CORREÇÃO: Usar hook centralizado para gerenciar visibilidade
    let cleanupTimeout: NodeJS.Timeout | null = null
    
    const handleVisibilityChange = (isVisible: boolean) => {
      if (!isVisible) {
        console.log('[useCleanup] Página ficou invisível, preparando limpeza...')
        // Limpar timeout anterior se existir
        if (cleanupTimeout) {
          clearTimeout(cleanupTimeout)
        }
        // CORREÇÃO: Limpar apenas após 15 minutos de inatividade
        cleanupTimeout = setTimeout(() => {
          if (document.visibilityState === 'hidden') {
            console.log('[useCleanup] Página invisível há mais de 15 minutos, limpando recursos...')
            cleanupResources()
          }
        }, 900000) // 15 minutos
      } else {
        console.log('[useCleanup] Página voltou a ficar visível - cancelando limpeza')
        // Cancelar limpeza se a página voltou a ficar visível
        if (cleanupTimeout) {
          clearTimeout(cleanupTimeout)
          cleanupTimeout = null
        }
      }
    }

    // Detectar quando o usuário sai da página
    const handlePageHide = () => {
      console.log('[useCleanup] Página sendo ocultada, limpando recursos...')
      cleanupResources()
    }

    // Usar hook centralizado para visibilidade
    const { visibilityState } = usePageVisibility({
      onVisibilityChange: handleVisibilityChange
    })

    // Adicionar listeners para outros eventos
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handlePageHide)

    // Limpeza ao desmontar o componente
    return () => {
      console.log('[useCleanup] Desmontando hook de limpeza')
      window.removeEventListener('beforeunload', handleBeforeUnload)
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
