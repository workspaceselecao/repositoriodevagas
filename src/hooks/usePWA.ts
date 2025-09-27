import { useState, useEffect } from 'react'

interface PWAState {
  isInstallable: boolean
  isInstalled: boolean
  isOffline: boolean
  hasUpdate: boolean
}

export const usePWA = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOffline: false,
    hasUpdate: false
  })

  useEffect(() => {
    // Verificar se está instalado
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInApp = (window.navigator as any).standalone === true
      return isStandalone || isInApp
    }

    // Verificar status offline
    const checkOffline = () => {
      return !navigator.onLine
    }

    // Atualizar estado inicial
    setPwaState(prev => ({
      ...prev,
      isInstalled: checkInstalled(),
      isOffline: checkOffline()
    }))

    // Escutar eventos de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setPwaState(prev => ({ ...prev, isInstallable: true }))
    }

    const handleAppInstalled = () => {
      setPwaState(prev => ({ ...prev, isInstalled: true, isInstallable: false }))
    }

    // Escutar mudanças de conectividade
    const handleOnline = () => {
      setPwaState(prev => ({ ...prev, isOffline: false }))
    }

    const handleOffline = () => {
      setPwaState(prev => ({ ...prev, isOffline: true }))
    }

    // Escutar atualizações do service worker
    const handleUpdateFound = () => {
      setPwaState(prev => ({ ...prev, hasUpdate: true }))
    }

    // Registrar event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Escutar atualizações do service worker se disponível
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleUpdateFound)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleUpdateFound)
      }
    }
  }, [])

  return pwaState
}
