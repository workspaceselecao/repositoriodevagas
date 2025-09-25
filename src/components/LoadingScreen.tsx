import { RefreshCw, Loader2 } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

interface LoadingScreenProps {
  message?: string
  showSpinner?: boolean
  variant?: 'default' | 'minimal' | 'skeleton'
}

export default function LoadingScreen({ 
  message = 'Carregando...', 
  showSpinner = true,
  variant = 'default'
}: LoadingScreenProps) {
  const { config } = useTheme()

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">{message}</span>
        </div>
      </div>
    )
  }

  if (variant === 'skeleton') {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
            <div className="h-3 bg-muted rounded w-24 animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40 animate-pulse"></div>
      
      {/* Círculos flutuantes */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-secondary/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      
      <div className="flex flex-col items-center space-y-6 relative z-10">
        {showSpinner && (
          <div className="relative">
            {/* Spinner principal */}
            <div className={`animate-spin rounded-full h-20 w-20 border-4 ${
              config.effects.gradients 
                ? 'border-gradient-to-r from-primary to-primary/70' 
                : 'border-primary'
            } border-t-transparent shadow-2xl`}></div>
            
            {/* Ícone central */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <RefreshCw className={`h-8 w-8 ${
                config.effects.gradients 
                  ? 'text-primary animate-pulse' 
                  : 'text-primary animate-pulse'
              }`} />
            </div>
            
            {/* Círculos orbitais */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary/50 rounded-full"></div>
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary/30 rounded-full"></div>
            </div>
          </div>
        )}
        
        <div className="text-center space-y-3">
          <h2 className={`text-xl font-bold ${
            config.effects.gradients 
              ? 'bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent' 
              : 'text-primary'
          }`}>
            {message}
          </h2>
          <p className="text-muted-foreground text-sm max-w-md">
            Aguarde enquanto carregamos os dados do sistema...
          </p>
          
          {/* Barra de progresso animada */}
          <div className="w-64 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
