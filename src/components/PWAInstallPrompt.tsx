import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download, Smartphone } from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, installPWA } = usePWA()
  const [showPrompt, setShowPrompt] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Verificar se o prompt foi dispensado anteriormente
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      setIsDismissed(true)
    }
  }, [])

  useEffect(() => {
    console.log('[PWA Install Prompt] Estado atual:', {
      isInstallable,
      isInstalled,
      isDismissed,
      shouldShow: isInstallable && !isInstalled && !isDismissed
    })

    // Mostrar prompt se for instalável, não estiver instalado e não foi dispensado
    if (isInstallable && !isInstalled && !isDismissed) {
      // Delay para melhor UX
      const timer = setTimeout(() => {
        setShowPrompt(true)
        console.log('[PWA Install Prompt] Exibindo prompt de instalação')
      }, 3000)

      return () => clearTimeout(timer)
    } else {
      // Se já estiver instalado, ocultar imediatamente
      if (isInstalled) {
        console.log('[PWA Install Prompt] App já instalado - ocultando prompt')
        setShowPrompt(false)
      }
    }
  }, [isInstallable, isInstalled, isDismissed])

  const handleInstall = async () => {
    console.log('[PWA Install Prompt] Usuário clicou em instalar')
    const success = await installPWA()
    if (success) {
      setShowPrompt(false)
      console.log('[PWA Install Prompt] Instalação bem-sucedida - ocultando prompt')
    }
  }

  const handleDismiss = () => {
    console.log('[PWA Install Prompt] Usuário dispensou o prompt')
    setShowPrompt(false)
    setIsDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Não mostrar se não deve ser exibido
  if (!showPrompt || isInstalled) {
    if (isInstalled) {
      console.log('[PWA Install Prompt] Não renderizando - app já instalado')
    }
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 animate-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Instalar App
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Instale o Repositório de Vagas para acesso rápido e experiência otimizada.
            </p>
            
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleInstall}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Instalar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
              >
                Agora não
              </Button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
