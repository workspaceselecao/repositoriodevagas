import React from 'react'
import { Button } from './ui/button'
import { RefreshCw, AlertTriangle, Home } from 'lucide-react'

interface ErrorFallbackProps {
  error?: Error
  onRetry?: () => void | Promise<void>
  onGoHome?: () => void
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  onRetry, 
  onGoHome 
}) => {
  const handleRetry = async () => {
    if (onRetry) {
      await onRetry()
    } else {
      // Fallback: recarregar a página
      window.location.reload()
    }
  }

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome()
    } else {
      // Fallback: ir para a página inicial
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="text-center space-y-6">
          {/* Ícone de erro */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Erro ao Carregar
            </h1>
            <p className="text-muted-foreground">
              Ocorreu um problema ao inicializar a aplicação. Isso pode ser temporário.
            </p>
          </div>

          {/* Detalhes do erro (apenas em desenvolvimento) */}
          {error && import.meta.env.DEV && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 text-left">
              <h3 className="font-medium text-destructive mb-2">Detalhes do Erro:</h3>
              <code className="text-sm text-destructive break-all">
                {error.message}
              </code>
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleRetry} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </Button>
            
            <Button 
              onClick={handleGoHome} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Página Inicial
            </Button>
          </div>

          {/* Informações adicionais */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Se o problema persistir, verifique sua conexão com a internet.</p>
            <p>Versão da aplicação: 1.0.4</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorFallback
