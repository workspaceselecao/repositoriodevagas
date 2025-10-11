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
      // CORREÇÃO CRÍTICA: Verificar se já estamos em processo de reload
      const reloadKey = 'refresh-button-reload'
      if (sessionStorage.getItem(reloadKey)) {
        console.warn('⚠️ Refresh já em andamento, evitando múltiplos reloads')
        return
      }
      
      sessionStorage.setItem(reloadKey, Date.now().toString())
      
      // Executar callback personalizado se fornecido
      if (onRefresh) {
        await onRefresh()
      } else {
        // CORREÇÃO CRÍTICA: Usar location.replace em vez de reload para evitar desaparecimento
        console.log('🔄 Executando location.replace seguro...')
        window.location.replace(window.location.href)
      }
    } catch (error) {
      console.error('Erro durante refresh:', error)
    } finally {
      // CORREÇÃO: Reset do estado mais rápido para melhor UX
      setTimeout(() => setIsRefreshing(false), 500)
      
      // CORREÇÃO: Limpar flag de reload após 5 segundos
      setTimeout(() => {
        sessionStorage.removeItem('refresh-button-reload')
      }, 5000)
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
