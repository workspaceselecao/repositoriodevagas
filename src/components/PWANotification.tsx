import { useState, useEffect } from 'react'
import { usePWA } from '../hooks/usePWA'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Download, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  X,
  Smartphone
} from 'lucide-react'

export default function PWANotification() {
  const { 
    isOnline, 
    isInstallable, 
    needRefresh, 
    installPWA, 
    updateSW, 
    setNeedRefresh 
  } = usePWA()
  
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [showUpdateBanner, setShowUpdateBanner] = useState(false)

  // Mostrar banner de instalação após 3 segundos
  useEffect(() => {
    if (isInstallable) {
      const timer = setTimeout(() => {
        setShowInstallBanner(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isInstallable])

  // Mostrar banner de atualização
  useEffect(() => {
    if (needRefresh) {
      setShowUpdateBanner(true)
    }
  }, [needRefresh])

  if (!showInstallBanner && !showUpdateBanner && isOnline) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {/* Status de conexão */}
      {!isOnline && (
        <div className="bg-orange-500 text-white p-3 rounded-lg shadow-lg flex items-center gap-2">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm">Modo offline ativo</span>
        </div>
      )}

      {/* Banner de instalação */}
      {showInstallBanner && isInstallable && (
        <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <div>
                <p className="font-medium text-sm">Instalar App</p>
                <p className="text-xs opacity-90">Acesse mais rápido</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={installPWA}
                className="h-8 px-3 text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Instalar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowInstallBanner(false)}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Banner de atualização */}
      {showUpdateBanner && needRefresh && (
        <div className="bg-green-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              <div>
                <p className="font-medium text-sm">Nova versão disponível</p>
                <p className="text-xs opacity-90">Atualize para melhorias</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={updateSW}
                className="h-8 px-3 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Atualizar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowUpdateBanner(false)
                  setNeedRefresh(false)
                }}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
