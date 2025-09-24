import { useState } from 'react'
import { Button } from './ui/button'
import { RefreshCw, AlertTriangle } from 'lucide-react'

interface EmergencyRefreshProps {
  onRefresh: () => void
}

export default function EmergencyRefresh({ onRefresh }: EmergencyRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleEmergencyRefresh = async () => {
    setIsRefreshing(true)
    
    try {
      // Limpar todos os caches
      localStorage.clear()
      sessionStorage.clear()
      
      // Limpar cache do Supabase
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        )
      }
      
      // Forçar reload da página
      window.location.reload()
    } catch (error) {
      console.error('Erro no refresh de emergência:', error)
      setIsRefreshing(false)
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        onClick={handleEmergencyRefresh}
        disabled={isRefreshing}
        variant="destructive"
        size="sm"
        className="flex items-center space-x-2"
      >
        {isRefreshing ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <AlertTriangle className="h-4 w-4" />
        )}
        <span>{isRefreshing ? 'Refreshing...' : 'Emergency Refresh'}</span>
      </Button>
    </div>
  )
}
