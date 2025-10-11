import { useState, useCallback } from 'react'
import { useConnectionMonitor } from '../hooks/useConnectionMonitor'
import { useSimpleRefresh } from '../hooks/useSimpleRefresh'
import { Button } from './ui/button'
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'

interface IntelligentRefreshProps {
  onRefresh?: () => Promise<void> | void
  className?: string
}

export default function IntelligentRefresh({ onRefresh, className = '' }: IntelligentRefreshProps) {
  const [showConnectionStatus, setShowConnectionStatus] = useState(false)
  const { isRefreshing, refresh } = useSimpleRefresh({ onRefresh })
  
  const { isConnected, checkConnection } = useConnectionMonitor({
    onConnectionLost: () => {
      console.log('[IntelligentRefresh] 🔌 Conexão perdida detectada')
      setShowConnectionStatus(true)
    },
    onConnectionRestored: () => {
      console.log('[IntelligentRefresh] ✅ Conexão restaurada')
      setShowConnectionStatus(false)
    }
  })

  const handleIntelligentRefresh = useCallback(async () => {
    console.log('[IntelligentRefresh] 🧠 Iniciando refresh inteligente...')
    
    // Verificar conexão antes do refresh
    await checkConnection()
    
    // Executar refresh
    await refresh()
    
    // Ocultar status de conexão após refresh bem-sucedido
    if (isConnected) {
      setShowConnectionStatus(false)
    }
  }, [refresh, checkConnection, isConnected])

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Status de conexão */}
      {showConnectionStatus && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs">
          {isConnected ? (
            <>
              <Wifi className="h-3 w-3" />
              <span>Conectado</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              <span>Desconectado</span>
            </>
          )}
        </div>
      )}
      
      {/* Botão de refresh */}
      <Button
        onClick={handleIntelligentRefresh}
        variant="outline"
        size="sm"
        disabled={isRefreshing}
        className="transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md"
        title={isConnected ? "Atualizar dados" : "Verificar conexão e atualizar"}
      >
        <RefreshCw className={`h-4 w-4 mr-2 transition-transform duration-500 ${
          isRefreshing ? 'animate-spin' : 'hover:rotate-180'
        }`} />
        {isRefreshing ? 'Atualizando...' : 'Atualizar'}
      </Button>
    </div>
  )
}
