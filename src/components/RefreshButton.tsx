import { useState } from 'react'
import { Button } from './ui/button'
import { RefreshCw, RotateCcw } from 'lucide-react'

interface RefreshButtonProps {
  onRefresh?: () => void
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  showText?: boolean
  iconSize?: 'sm' | 'md' | 'lg'
}

export default function RefreshButton({ 
  onRefresh, 
  variant = 'outline', 
  size = 'default',
  className = '',
  showText = true,
  iconSize = 'md'
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
        // CORREÇÃO: Refresh padrão mais suave - usar reload suave
        console.log('🔄 Executando reload suave...')
        window.location.reload()
      }
    } catch (error) {
      console.error('Erro durante refresh:', error)
    } finally {
      // CORREÇÃO: Reset do estado mais rápido para melhor UX
      setTimeout(() => setIsRefreshing(false), 500) // Reduzido de 1000ms para 500ms
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
        <RefreshCw className={`animate-spin ${iconSize === 'sm' ? 'h-4 w-4' : iconSize === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />
      ) : (
        <RefreshCw className={`${iconSize === 'sm' ? 'h-4 w-4' : iconSize === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />
      )}
      {showText && (
        <span className="ml-3 text-sm font-medium">
          {isRefreshing ? 'Atualizando...' : 'Atualizar Dados'}
        </span>
      )}
    </Button>
  )
}
