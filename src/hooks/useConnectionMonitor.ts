import { useEffect, useRef, useCallback } from 'react'

interface UseConnectionMonitorOptions {
  onConnectionLost?: () => void
  onConnectionRestored?: () => void
  checkInterval?: number
  maxRetries?: number
}

export function useConnectionMonitor({
  onConnectionLost,
  onConnectionRestored,
  checkInterval = 30000, // 30 segundos
  maxRetries = 3
}: UseConnectionMonitorOptions = {}) {
  const retryCount = useRef(0)
  const isConnected = useRef(true)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const checkConnection = useCallback(async () => {
    try {
      // Verificação simples de conectividade
      const response = await fetch(window.location.origin, { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000) // 5 segundos timeout
      })
      
      if (response.ok) {
        if (!isConnected.current) {
          console.log('[ConnectionMonitor] ✅ Conexão restaurada')
          isConnected.current = true
          retryCount.current = 0
          onConnectionRestored?.()
        }
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.warn('[ConnectionMonitor] ⚠️ Conexão perdida:', error)
      
      if (isConnected.current) {
        isConnected.current = false
        retryCount.current++
        
        if (retryCount.current >= maxRetries) {
          console.log('[ConnectionMonitor] ❌ Máximo de tentativas atingido, executando callback')
          onConnectionLost?.()
          retryCount.current = 0
        }
      }
    }
  }, [onConnectionLost, onConnectionRestored, maxRetries])

  useEffect(() => {
    console.log('[ConnectionMonitor] 🔍 Iniciando monitoramento de conexão')
    
    // Verificação inicial
    checkConnection()
    
    // Verificação periódica
    checkIntervalRef.current = setInterval(checkConnection, checkInterval)
    
    // CORREÇÃO: Sistema de visibilidade simplificado
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('[ConnectionMonitor] 👁️ Página voltou ao foco, verificando conexão...')
        checkConnection()
      }
    }
    
    // Verificação quando a conexão volta
    const handleOnline = () => {
      console.log('[ConnectionMonitor] 🌐 Conexão online detectada')
      checkConnection()
    }
    
    const handleOffline = () => {
      console.log('[ConnectionMonitor] 📴 Conexão offline detectada')
      isConnected.current = false
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      console.log('[ConnectionMonitor] 🛑 Monitoramento de conexão interrompido')
    }
  }, [checkConnection, checkInterval])

  return {
    isConnected: isConnected.current,
    retryCount: retryCount.current,
    checkConnection
  }
}
