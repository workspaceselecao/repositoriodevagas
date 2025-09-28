import { useState, useEffect, useCallback } from 'react'

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

interface PWAState {
  isInstallable: boolean
  isInstalled: boolean
  isOffline: boolean
  hasUpdate: boolean
  installPrompt: BeforeInstallPromptEvent | null
}

export const usePWA = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOffline: !navigator.onLine,
    hasUpdate: false,
    installPrompt: null
  })

  // Verificar se está instalado
  const checkInstalled = useCallback(() => {
    // Verificar display-mode standalone (padrão para PWAs)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    
    // Verificar iOS Safari standalone
    const isInApp = (window.navigator as any).standalone === true
    
    // Verificar se está sendo executado como PWA através de outras formas
    const isPWA = window.matchMedia('(display-mode: minimal-ui)').matches ||
                  window.matchMedia('(display-mode: fullscreen)').matches ||
                  (window.navigator as any).standalone === true ||
                  window.location.search.includes('source=pwa') ||
                  document.referrer.includes('android-app://')
    
    const installed = isStandalone || isInApp || isPWA
    
    console.log('[PWA] Verificação de instalação:', {
      isStandalone,
      isInApp,
      isPWA,
      installed,
      userAgent: navigator.userAgent,
      displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'
    })
    
    return installed
  }, [])

  // Instalar PWA
  const installPWA = useCallback(async () => {
    if (!pwaState.installPrompt) {
      console.warn('[PWA] Nenhum prompt de instalação disponível')
      return false
    }

    try {
      await pwaState.installPrompt.prompt()
      const { outcome } = await pwaState.installPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('[PWA] Instalação aceita pelo usuário')
        setPwaState(prev => ({ ...prev, isInstalled: true, isInstallable: false, installPrompt: null }))
        return true
      } else {
        console.log('[PWA] Instalação rejeitada pelo usuário')
        return false
      }
    } catch (error) {
      console.error('[PWA] Erro durante instalação:', error)
      return false
    }
  }, [pwaState.installPrompt])

  // Verificar atualizações do service worker
  const checkForUpdates = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          await registration.update()
        }
      } catch (error) {
        console.error('[PWA] Erro ao verificar atualizações:', error)
      }
    }
  }, [])

  useEffect(() => {
    // Verificar estado inicial
    setPwaState(prev => ({
      ...prev,
      isInstalled: checkInstalled()
    }))

    // Event listener para beforeinstallprompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('[PWA] Evento beforeinstallprompt disparado')
      e.preventDefault()
      setPwaState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: e
      }))
    }

    // Event listener para appinstalled
    const handleAppInstalled = () => {
      console.log('[PWA] App instalado com sucesso')
      setPwaState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null
      }))
    }

    // Event listeners para conectividade
    const handleOnline = () => {
      setPwaState(prev => ({ ...prev, isOffline: false }))
    }

    const handleOffline = () => {
      setPwaState(prev => ({ ...prev, isOffline: true }))
    }

    // Event listener para atualizações do service worker
    const handleControllerChange = () => {
      console.log('[PWA] Nova versão do service worker disponível')
      setPwaState(prev => ({ ...prev, hasUpdate: true }))
    }

    // Registrar event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
      }
    }
  }, [checkInstalled])

  return {
    ...pwaState,
    installPWA,
    checkForUpdates
  }
}
