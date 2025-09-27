import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar se o app já está instalado
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInApp = (window.navigator as any).standalone === true
      setIsInstalled(isStandalone || isInApp)
    }

    checkInstalled()

    // Escutar o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Mostrar o prompt imediatamente se não foi rejeitado
      if (!isInstalled && !localStorage.getItem('pwa-install-dismissed')) {
        setShowInstallPrompt(true)
      }
    }

    // Escutar quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      localStorage.removeItem('pwa-install-dismissed')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('PWA instalado com sucesso')
    } else {
      console.log('PWA não foi instalado')
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  const handleManualInstall = () => {
    // Instruções para instalação manual
    const instructions = `
Para instalar este aplicativo:

Chrome/Edge:
1. Clique no ícone de instalação na barra de endereços
2. Ou vá em Menu ⋮ → "Instalar Repositório de Vagas"

Firefox:
1. Menu ⋮ → "Instalar"

Mobile:
- Android: Use o menu do navegador
- iOS: Safari → Compartilhar → "Adicionar à Tela Inicial"

Se não aparecer o ícone, tente:
- Atualizar a página (Ctrl+F5)
- Limpar cache do navegador
- Interagir mais com o site
    `
    
    alert(instructions)
  }

  // Mostrar sempre se não estiver instalado (mesmo sem prompt automático)
  if (isInstalled) {
    return null
  }

  // Se não há prompt automático, mostrar botão manual
  if (!showInstallPrompt && !deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
        <div className="bg-blue-600 text-white rounded-lg shadow-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium">
                Instalar App
              </h3>
              <p className="text-sm text-blue-100 mt-1">
                Instale o Repositório de Vagas para acesso rápido.
              </p>
              
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleManualInstall}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Como Instalar
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

  if (!showInstallPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
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
                onClick={handleInstallClick}
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
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
