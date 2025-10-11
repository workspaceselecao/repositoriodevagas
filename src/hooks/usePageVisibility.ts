import { useEffect, useRef, useCallback } from 'react'

interface UsePageVisibilityOptions {
  onVisible?: () => void
  onHidden?: () => void
  onVisibilityChange?: (isVisible: boolean) => void
}

/**
 * Hook centralizado para gerenciar eventos de visibilidade da página
 * Evita conflitos entre múltiplos hooks que escutam visibilitychange
 */
export function usePageVisibility({
  onVisible,
  onHidden,
  onVisibilityChange
}: UsePageVisibilityOptions = {}) {
  const isVisibleRef = useRef(document.visibilityState === 'visible')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleVisibilityChange = useCallback(() => {
    const isVisible = document.visibilityState === 'visible'
    const wasVisible = isVisibleRef.current
    isVisibleRef.current = isVisible

    // Limpar timeout anterior se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    console.log(`[usePageVisibility] Estado mudou: ${wasVisible ? 'visível' : 'invisível'} → ${isVisible ? 'visível' : 'invisível'}`)

    if (isVisible && !wasVisible) {
      console.log('[usePageVisibility] Página ficou visível')
      onVisible?.()
    } else if (!isVisible && wasVisible) {
      console.log('[usePageVisibility] Página ficou invisível')
      onHidden?.()
    }

    onVisibilityChange?.(isVisible)
  }, [onVisible, onHidden, onVisibilityChange])

  useEffect(() => {
    console.log('[usePageVisibility] Configurando listener de visibilidade')
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      console.log('[usePageVisibility] Removendo listener de visibilidade')
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [handleVisibilityChange])

  return {
    isVisible: isVisibleRef.current,
    visibilityState: document.visibilityState
  }
}
