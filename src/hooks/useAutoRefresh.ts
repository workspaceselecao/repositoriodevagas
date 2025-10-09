import { useEffect, useRef } from 'react'

interface UseAutoRefreshOptions {
  onRefresh: () => Promise<void> | void
  interval?: number // Intervalo em milissegundos (padrão: 5 minutos)
  enabled?: boolean // Se o auto-refresh está habilitado (padrão: true)
  onVisibilityChange?: boolean // Refresh quando a página volta a ficar visível (padrão: true)
}

/**
 * Hook para gerenciar recarregamento automático de dados
 * com suporte a debounce e controle de visibilidade
 */
export function useAutoRefresh({
  onRefresh,
  interval = 300000, // 5 minutos padrão
  enabled = true,
  onVisibilityChange = true
}: UseAutoRefreshOptions) {
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null)
  const lastRefreshRef = useRef<number>(Date.now())
  const isRefreshingRef = useRef(false)
  const minRefreshInterval = 10000 // Mínimo 10 segundos entre refreshes

  // Função de refresh com debounce
  const debouncedRefresh = async () => {
    const now = Date.now()
    const timeSinceLastRefresh = now - lastRefreshRef.current

    // Prevenir refresh se já está em andamento ou foi feito muito recentemente
    if (isRefreshingRef.current || timeSinceLastRefresh < minRefreshInterval) {
      console.log('[useAutoRefresh] Refresh ignorado (em andamento ou muito recente)')
      return
    }

    try {
      isRefreshingRef.current = true
      console.log('[useAutoRefresh] Iniciando refresh automático...')
      await onRefresh()
      lastRefreshRef.current = Date.now()
      console.log('[useAutoRefresh] ✅ Refresh automático concluído')
    } catch (error) {
      console.error('[useAutoRefresh] Erro durante refresh automático:', error)
    } finally {
      isRefreshingRef.current = false
    }
  }

  useEffect(() => {
    if (!enabled) {
      console.log('[useAutoRefresh] Auto-refresh desabilitado')
      return
    }

    console.log(`[useAutoRefresh] Configurando auto-refresh com intervalo de ${interval / 1000}s`)

    // Configurar interval para refresh periódico
    intervalIdRef.current = setInterval(() => {
      // Só fazer refresh se a página estiver visível
      if (document.visibilityState === 'visible') {
        debouncedRefresh()
      }
    }, interval)

    // Listener para quando a página volta a ficar visível
    const handleVisibilityChange = () => {
      if (onVisibilityChange && document.visibilityState === 'visible') {
        const timeSinceLastRefresh = Date.now() - lastRefreshRef.current
        
        // Se a página ficou invisível por mais de 1 minuto, fazer refresh
        if (timeSinceLastRefresh > 60000) {
          console.log('[useAutoRefresh] Página voltou a ficar visível após inatividade, fazendo refresh...')
          debouncedRefresh()
        }
      }
    }

    // Listener para F5 ou Ctrl+R
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
        console.log('[useAutoRefresh] Refresh manual detectado (F5/Ctrl+R)')
        // Limpar o estado para permitir o refresh nativo do navegador
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current)
        }
      }
    }

    // Adicionar listeners
    if (onVisibilityChange) {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }
    window.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      console.log('[useAutoRefresh] Limpando auto-refresh')
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, interval, onRefresh, onVisibilityChange])

  // Retornar função para refresh manual
  return {
    refresh: debouncedRefresh,
    isRefreshing: isRefreshingRef.current
  }
}

