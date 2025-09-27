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
  const [isStandalone, setIsStandalone] = useState(false)

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
    // Verificar se já está instalado (standalone mode)
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true ||
                        document.referrer.includes('android-app://')
      setIsStandalone(standalone)
    }

    // Verificar se é instalável imediatamente
    const checkInstallability = () => {
      // Para PWAs, sempre considerar instalável se não estiver standalone
      const isNotStandalone = !window.matchMedia('(display-mode: standalone)').matches &&
                             (window.navigator as any).standalone !== true &&
                             !document.referrer.includes('android-app://')
      
      // Verificar se tem service worker ativo
      const hasServiceWorker = 'serviceWorker' in navigator
      
      // Verificar se está em HTTPS ou localhost
      const isSecure = location.protocol === 'https:' || location.hostname === 'localhost'
      
      if (isNotStandalone && hasServiceWorker && isSecure) {
        setIsInstallable(true)
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    // Verificações iniciais
    checkStandalone()
    checkInstallability()

    // Listener para o evento padrão
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    // Listener para mudanças no display mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    mediaQuery.addEventListener('change', checkStandalone)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      mediaQuery.removeEventListener('change', checkStandalone)
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
      // Usar o prompt nativo se disponível
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('PWA instalado com sucesso')
      } else {
        console.log('Instalação do PWA rejeitada')
      }
      
      setDeferredPrompt(null)
      setIsInstallable(false)
    } else {
      // Instalação alternativa para browsers que suportam
      try {
        // Para Chrome/Edge - mostrar instruções de instalação manual
        if (navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Edg')) {
          const installInstructions = `
Para instalar este app:

1. Clique no ícone de instalação na barra de endereços
2. Ou vá ao menu do navegador (⋮) > "Instalar aplicativo"
3. Ou pressione Ctrl+Shift+I > Application > Manifest > "Install"

O app será instalado como um aplicativo nativo!
          `
          alert(installInstructions)
        }
        // Para Safari
        else if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
          const safariInstructions = `
Para instalar no Safari:

1. Toque no botão de compartilhar (📤)
2. Role para baixo e toque em "Adicionar à Tela de Início"
3. Toque em "Adicionar"

O app será instalado como um ícone na tela inicial!
          `
          alert(safariInstructions)
        }
        // Para Firefox
        else if (navigator.userAgent.includes('Firefox')) {
          const firefoxInstructions = `
Para instalar no Firefox:

1. Clique no ícone de instalação na barra de endereços
2. Ou vá ao menu > "Instalar"
3. Confirme a instalação

O app será instalado como um aplicativo!
          `
          alert(firefoxInstructions)
        }
        // Instruções genéricas
        else {
          const genericInstructions = `
Para instalar este app:

Procure pelo ícone de instalação na barra de endereços do seu navegador ou no menu do navegador. 
O app pode ser instalado como um aplicativo nativo no seu dispositivo.
          `
          alert(genericInstructions)
        }
      } catch (error) {
        console.error('Erro ao tentar instalar PWA:', error)
        alert('Erro ao tentar instalar. Tente usar o menu do navegador para instalar o app.')
      }
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
    setNeedRefresh,
    isStandalone
  }
}
