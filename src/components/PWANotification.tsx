import { useState, useEffect } from 'react'
import { usePWA } from '../hooks/usePWA'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import InstallInstructionsModal from './InstallInstructionsModal'
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
    setNeedRefresh,
    isStandalone,
    showInstallInstructions
  } = usePWA()
  
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [showUpdateBanner, setShowUpdateBanner] = useState(false)
  const [showInstallModal, setShowInstallModal] = useState(false)

  // Mostrar banner de instalação imediatamente se instalável e não standalone
  useEffect(() => {
    if (isInstallable && !isStandalone) {
      // Mostrar imediatamente ao invés de aguardar 3 segundos
      setShowInstallBanner(true)
    } else {
      setShowInstallBanner(false)
    }
  }, [isInstallable, isStandalone])

  // Mostrar banner de atualização
  useEffect(() => {
    if (needRefresh) {
      console.log('🔄 Mostrando banner de atualização')
      setShowUpdateBanner(true)
    } else {
      setShowUpdateBanner(false)
    }
  }, [needRefresh])

  if (!showInstallBanner && !showUpdateBanner && isOnline) {
    return null
  }

  return (
    <>
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {/* Status de conexão */}
      {!isOnline && (
        <div className="bg-orange-500 text-white p-3 rounded-lg shadow-lg flex items-center gap-2">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm">Modo offline ativo</span>
        </div>
      )}

      {/* Banner de instalação */}
      {showInstallBanner && isInstallable && !isStandalone && (
        <div className="bg-green-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <div>
                <p className="font-medium text-sm">🚀 INSTALAR APP AGORA</p>
                <p className="text-xs opacity-90">Clique para instalar instantaneamente!</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  const result = await installPWA()
                  if (!result || !result.success) {
                    setShowInstallModal(true)
                  }
                }}
                className="h-8 px-3 text-xs bg-white text-green-600 hover:bg-gray-100 font-bold"
              >
                <Download className="h-3 w-3 mr-1" />
                INSTALAR
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
                onClick={() => {
                  console.log('🔄 Botão de atualização clicado')
                  updateSW()
                }}
                className="h-8 px-3 text-xs hover:bg-white/20 transition-colors duration-200"
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

    {/* Modal de Instruções de Instalação */}
    <InstallInstructionsModal 
      isOpen={showInstallModal}
      onClose={() => setShowInstallModal(false)}
    />
  </>
  )
}
