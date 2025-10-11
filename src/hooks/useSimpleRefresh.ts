import { useState, useCallback } from 'react'

interface UseSimpleRefreshOptions {
  onRefresh?: () => Promise<void> | void
  timeout?: number
}

export function useSimpleRefresh({ 
  onRefresh, 
  timeout = 5000 
}: UseSimpleRefreshOptions = {}) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const refresh = useCallback(async () => {
    if (isRefreshing) {
      console.log('[SimpleRefresh] ⚠️ Refresh já em andamento, ignorando...')
      return
    }

    setIsRefreshing(true)
    
    try {
      console.log('[SimpleRefresh] 🔄 Iniciando refresh simples...')
      
      // Feedback tátil se suportado
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50])
      }

      // Executar refresh customizado se fornecido
      if (onRefresh) {
        await onRefresh()
      }

      // CORREÇÃO: Refresh simples da página se não há callback - mais suave
      if (!onRefresh) {
        console.log('🔄 Executando refresh simples da página...')
        window.location.reload()
        return
      }

      setLastRefresh(new Date())
      console.log('[SimpleRefresh] ✅ Refresh concluído com sucesso')
      
      // Feedback tátil de sucesso
      if ('vibrate' in navigator) {
        navigator.vibrate([100])
      }
      
    } catch (error) {
      console.error('[SimpleRefresh] ❌ Erro no refresh:', error)
      
      // Feedback tátil de erro
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200])
      }
    } finally {
      // Delay mínimo para melhor UX
      setTimeout(() => {
        setIsRefreshing(false)
      }, 1000)
    }
  }, [isRefreshing, onRefresh])

  return {
    isRefreshing,
    lastRefresh,
    refresh
  }
}
