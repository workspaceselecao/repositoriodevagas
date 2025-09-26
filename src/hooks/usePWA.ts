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
        let hasWaiting = false
        
        registrations.forEach((registration) => {
          if (registration.waiting) {
            hasWaiting = true
            console.log('🔄 Atualizando service worker...')
            
            // Enviar mensagem para o service worker esperando
            registration.waiting.postMessage({ type: 'SKIP_WAITING' })
            
            // Aguardar um pouco antes de recarregar
            setTimeout(() => {
              if (reloadPage) {
                console.log('🔄 Recarregando página...')
                window.location.reload()
              }
            }, 100)
          }
        })
        
        if (!hasWaiting) {
          console.log('⚠️ Nenhum service worker esperando para atualizar')
          // Forçar recarregamento se não há service worker esperando
          if (reloadPage) {
            window.location.reload()
          }
        }
      }).catch((error) => {
        console.error('❌ Erro ao atualizar service worker:', error)
        // Fallback: recarregar página
        if (reloadPage) {
          window.location.reload()
        }
      })
    } else {
      console.log('⚠️ Service Worker não suportado')
      // Fallback: recarregar página
      if (reloadPage) {
        window.location.reload()
      }
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
      // Verificar se há service worker esperando
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          if (registration.waiting) {
            setNeedRefresh(true)
          }
        })
      })

      // Escutar mudanças no controller
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setNeedRefresh(true)
      })

      // Escutar mensagens do service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
          setNeedRefresh(true)
        }
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
    console.log('🔄 Iniciando atualização do service worker...')
    setNeedRefresh(false) // Resetar estado imediatamente
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
