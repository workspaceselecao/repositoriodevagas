import { useEffect, useState } from 'react'

// Tipos para o PWA
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWA() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [needRefresh, setNeedRefresh] = useState(false)

  // Função para atualizar service worker
  const updateServiceWorker = (reloadPage = true) => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' })
            if (reloadPage) {
              window.location.reload()
            }
          }
        })
      })
    }
  }

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Detectar se o app pode ser instalado
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  // Detectar atualizações do service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setNeedRefresh(true)
      })
    }
  }, [])

  // Instalar PWA
  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('PWA instalado com sucesso')
      } else {
        console.log('Instalação do PWA rejeitada')
      }
      
      setDeferredPrompt(null)
      setIsInstallable(false)
    }
  }

  // Atualizar service worker
  const updateSW = () => {
    updateServiceWorker(true)
  }

  return {
    isOnline,
    isInstallable,
    needRefresh,
    installPWA,
    updateSW,
    setNeedRefresh
  }
}
