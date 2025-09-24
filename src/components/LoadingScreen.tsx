import { RefreshCw } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
  showSpinner?: boolean
}

export default function LoadingScreen({ 
  message = 'Carregando...', 
  showSpinner = true 
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex flex-col items-center space-y-4">
        {showSpinner && (
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
            <RefreshCw className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary animate-pulse" />
          </div>
        )}
        <div className="text-center">
          <p className="text-muted-foreground text-sm font-medium">{message}</p>
          <p className="text-muted-foreground text-xs mt-1">
            Aguarde enquanto carregamos os dados...
          </p>
        </div>
      </div>
    </div>
  )
}
