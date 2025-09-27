import React, { useState, useEffect } from 'react'
import { usePWA } from '@/hooks/usePWA'

export const PWADebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [isVisible, setIsVisible] = useState(false)
  const pwaState = usePWA()

  useEffect(() => {
    // Coletar informações de debug
    const info = {
      // Status do PWA
      isInstallable: pwaState.isInstallable,
      isInstalled: pwaState.isInstalled,
      isOffline: pwaState.isOffline,
      hasUpdate: pwaState.hasUpdate,
      
      // Service Worker
      hasServiceWorker: 'serviceWorker' in navigator,
      serviceWorkerController: navigator.serviceWorker?.controller,
      
        // Manifest
        manifest: null as any,
        
        // Installability
        canInstall: false,
        installPromptEvent: null as any,
      
      // Display mode
      displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
      
      // Platform
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      
      // HTTPS
      isSecureContext: window.isSecureContext,
      protocol: window.location.protocol,
      
      // Icons
      hasIcons: true // assumindo que temos ícones
    }

    // Tentar carregar o manifest
    fetch('/manifest.webmanifest')
      .then(res => res.json())
      .then(manifest => {
        info.manifest = manifest
        setDebugInfo(info)
      })
      .catch(() => {
        info.manifest = 'Erro ao carregar manifest'
        setDebugInfo(info)
      })

    // Verificar se pode instalar
    const checkInstallability = () => {
      // Verificar se o evento beforeinstallprompt foi disparado
      window.addEventListener('beforeinstallprompt', (e) => {
        info.canInstall = true
        info.installPromptEvent = e
        setDebugInfo({...info})
      })
    }

    checkInstallability()
    setDebugInfo(info)
  }, [pwaState])

  // Mostrar apenas em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-red-600 text-white px-3 py-1 rounded text-xs"
      >
        PWA Debug
      </button>
      
      {isVisible && (
        <div className="absolute bottom-8 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-w-md max-h-96 overflow-y-auto text-xs">
          <h3 className="font-bold mb-2">PWA Debug Info</h3>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
          <button
            onClick={() => setIsVisible(false)}
            className="mt-2 bg-gray-500 text-white px-2 py-1 rounded text-xs"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  )
}
