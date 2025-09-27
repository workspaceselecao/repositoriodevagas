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
    console.log('🚀 Iniciando instalação forçada do PWA...')
    
    if (deferredPrompt) {
      console.log('📱 Usando prompt nativo do navegador')
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('✅ PWA instalado com sucesso via prompt nativo')
        setDeferredPrompt(null)
        setIsInstallable(false)
        return { success: true, reason: 'Instalado via prompt nativo' }
      } else {
        console.log('❌ Instalação do PWA rejeitada via prompt nativo')
        return { success: false, reason: 'Instalação rejeitada' }
      }
    } else {
      console.log('🔧 Tentando instalação alternativa...')
      
      try {
        // Registrar service worker personalizado se não estiver registrado
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/sw.js')
          console.log('✅ Service Worker registrado:', registration)
          
          // Aguardar o service worker estar ativo
          await navigator.serviceWorker.ready
          console.log('✅ Service Worker ativo')
        }

        // Tentar forçar o prompt de instalação
        const result = await forceInstallPrompt()
        
        if (result.success) {
          console.log('✅ Instalação iniciada com sucesso')
          return { success: true, reason: 'Instalação iniciada' }
        } else {
          console.log('⚠️ Instalação não disponível:', result.reason)
          return { success: false, reason: result.reason }
        }
        
      } catch (error) {
        console.error('❌ Erro na instalação:', error)
        return { success: false, reason: 'Erro na instalação' }
      }
    }
  }

  // Função para forçar prompt de instalação
  const forceInstallPrompt = async () => {
    try {
      // Verificar se já está instalado
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return { success: false, reason: 'Já instalado' }
      }

      // Aguardar um pouco para garantir que o service worker está ativo
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Tentar diferentes métodos de instalação
      const installMethods = [
        // Método 1: Tentar usar o prompt nativo se disponível
        async () => {
          if (deferredPrompt) {
            console.log('🚀 Usando prompt nativo do navegador')
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            return { success: outcome === 'accepted', reason: outcome }
          }
          return { success: false, reason: 'Prompt nativo não disponível' }
        },
        
        // Método 2: Tentar abrir em nova janela para forçar prompt
        () => {
          console.log('🚀 Tentando abrir nova janela para forçar prompt')
          const newWindow = window.open(window.location.href, '_blank')
          if (newWindow) {
            newWindow.focus()
            setTimeout(() => {
              newWindow.close()
            }, 3000)
            return { success: true, reason: 'Nova janela aberta' }
          }
          return { success: false, reason: 'Não foi possível abrir nova janela' }
        },
        
        // Método 3: Tentar instalar via menu do navegador
        () => {
          console.log('🚀 Instruindo usuário a usar menu do navegador')
          return { success: false, reason: 'Usar menu do navegador' }
        }
      ]

      // Tentar cada método
      for (const method of installMethods) {
        try {
          const result = await method()
          if (result.success) {
            return result
          }
        } catch (error) {
          console.warn('Método de instalação falhou:', error)
        }
      }

      return { success: false, reason: 'Nenhum método funcionou' }
      
    } catch (error) {
      console.error('Erro ao forçar prompt:', error)
      return { success: false, reason: error instanceof Error ? error.message : 'Erro desconhecido' }
    }
  }

  // Função para mostrar instruções de instalação
  const showInstallInstructions = () => {
    const isChrome = navigator.userAgent.includes('Chrome')
    const isEdge = navigator.userAgent.includes('Edg')
    const isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')
    const isFirefox = navigator.userAgent.includes('Firefox')

    let instructions = ''
    
    if (isChrome || isEdge) {
      instructions = `🚀 INSTALAR APLICATIVO NO SEU COMPUTADOR

Para instalar este app no Chrome/Edge:

MÉTODO 1 - Menu do Navegador:
1. Clique nos 3 pontos (⋮) no canto superior direito
2. Procure por "Instalar Repositório de Vagas" ou "Instalar aplicativo"
3. Clique em "Instalar"

MÉTODO 2 - Barra de Endereços:
1. Procure pelo ícone de instalação na barra de endereços
2. Clique no ícone (parece um download ou +)
3. Confirme a instalação

MÉTODO 3 - DevTools:
1. Pressione F12 ou Ctrl+Shift+I
2. Vá na aba "Application"
3. Clique em "Manifest"
4. Clique em "Install"

O app será instalado como um aplicativo nativo no seu computador!`
    } else if (isSafari) {
      instructions = `🚀 INSTALAR APLICATIVO NO SEU COMPUTADOR

Para instalar no Safari:

1. Clique no botão de compartilhar (📤) na barra de ferramentas
2. Role para baixo e clique em "Adicionar à Tela de Início"
3. Clique em "Adicionar"

O app será instalado como um ícone na tela inicial!`
    } else if (isFirefox) {
      instructions = `🚀 INSTALAR APLICATIVO NO SEU COMPUTADOR

Para instalar no Firefox:

1. Clique no ícone de instalação na barra de endereços
2. Ou vá ao menu > "Instalar"
3. Confirme a instalação

O app será instalado como um aplicativo nativo!`
    } else {
      instructions = `🚀 INSTALAR APLICATIVO NO SEU COMPUTADOR

Para instalar este app:

1. Procure pelo ícone de instalação na barra de endereços
2. Ou vá ao menu do navegador e procure por "Instalar"
3. Confirme a instalação

O app será instalado como um aplicativo nativo no seu computador!`
    }

    alert(instructions)
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
    isStandalone,
    showInstallInstructions
  }
}
