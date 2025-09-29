import React from 'react'
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

interface AuthErrorFallbackProps {
  error: Error
  onRetry: () => void
  onGoHome: () => void
  isOnline: boolean
}

export default function AuthErrorFallback({ error, onRetry, onGoHome, isOnline }: AuthErrorFallbackProps) {
  const isTimeoutError = error.message.includes('timeout')
  const isNetworkError = !isOnline || error.message.includes('network') || error.message.includes('fetch')

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {isNetworkError ? (
              <WifiOff className="h-16 w-16 text-red-500" />
            ) : (
              <AlertTriangle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Erro ao Carregar
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isNetworkError 
              ? 'Problema de conectividade detectado.'
              : 'Ocorreu um problema ao inicializar a aplicação.'
            } {isTimeoutError && 'A operação demorou mais que o esperado.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isNetworkError && (
            <div className="flex items-center justify-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <WifiOff className="h-5 w-5 text-yellow-600" />
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                Verifique sua conexão com a internet
              </span>
            </div>
          )}
          
          {isTimeoutError && (
            <div className="flex items-center justify-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Tentando reconectar automaticamente...
              </span>
            </div>
          )}
          
          <div className="space-y-3">
            <Button 
              onClick={onRetry}
              className="w-full"
              disabled={isNetworkError && !isOnline}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onGoHome}
              className="w-full"
            >
              Página Inicial
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Se o problema persistir, verifique sua conexão com a internet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Versão da aplicação: {import.meta.env.VITE_APP_VERSION || '1.0.4'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
