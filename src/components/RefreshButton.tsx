import { useState } from 'react'
import { Button } from './ui/button'
import { RefreshCw, RotateCcw } from 'lucide-react'

interface RefreshButtonProps {
  onRefresh?: () => void
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export default function RefreshButton({ 
  onRefresh, 
  variant = 'outline', 
  size = 'default',
  className = '' 
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (isRefreshing) return
    
    setIsRefreshing(true)
    
    try {
      // Executar callback personalizado se fornecido
      if (onRefresh) {
        await onRefresh()
      } else {
        // Refresh padrão - apenas recarregar a página
        window.location.reload()
      }
    } catch (error) {
      console.error('Erro durante refresh:', error)
    } finally {
      // Reset do estado após um pequeno delay
      setTimeout(() => setIsRefreshing(false), 1000)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`transition-all duration-200 ${className}`}
      title={isRefreshing ? 'Atualizando...' : 'Atualizar dados'}
    >
      {isRefreshing ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      <span className="ml-2">
        {isRefreshing ? 'Atualizando...' : 'Atualizar Dados'}
      </span>
    </Button>
  )
}
