import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, X } from 'lucide-react'

interface UpdatePromptProps {
  onUpdate: () => void
}

export const PWAUpdatePrompt: React.FC<UpdatePromptProps> = ({ onUpdate }) => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setShowUpdatePrompt(true)
      })
    }
  }, [])

  const handleUpdate = () => {
    onUpdate()
    setShowUpdatePrompt(false)
    // Recarregar a página para aplicar a atualização
    window.location.reload()
  }

  const handleDismiss = () => {
    setShowUpdatePrompt(false)
  }

  if (!showUpdatePrompt) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-blue-600 text-white rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <RefreshCw className="w-5 h-5 mt-0.5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium">
              Atualização Disponível
            </h3>
            <p className="text-sm text-blue-100 mt-1">
              Uma nova versão do app está disponível. Atualize para ter acesso às últimas funcionalidades.
            </p>
            
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleUpdate}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Atualizar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                className="text-white border-white hover:bg-white hover:text-blue-600"
              >
                Agora não
              </Button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-blue-200 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
