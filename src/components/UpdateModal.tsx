import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Download, RefreshCw, X, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { APP_VERSION, fetchServerVersion, getCurrentStoredVersion } from '../version'

interface UpdateModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export default function UpdateModal({ isOpen, onClose, onUpdate }: UpdateModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [serverVersionInfo, setServerVersionInfo] = useState<{version: string, buildDate?: string} | null>(null)
  const [currentVersion, setCurrentVersion] = useState<string>(APP_VERSION)

  // Buscar informações da versão do servidor quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      fetchServerVersion().then(versionInfo => {
        if (versionInfo) {
          setServerVersionInfo(versionInfo)
        }
      })
      
      // Obter versão atual armazenada
      const storedVersion = getCurrentStoredVersion()
      if (storedVersion) {
        setCurrentVersion(storedVersion)
      }
    }
  }, [isOpen])

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      await onUpdate()
    } finally {
      setIsUpdating(false)
    }
  }

  const handleClose = () => {
    if (!isUpdating) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <span>Nova Versão Disponível!</span>
          </DialogTitle>
          <DialogDescription className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Download className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Uma nova versão da aplicação está disponível. Recomendamos atualizar 
                  para obter as últimas funcionalidades, correções de bugs e melhorias de segurança.
                </p>
              </div>
            </div>
            
            {/* Comparação de versões */}
            <div className="space-y-3">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Versão atual
                  </span>
                  <Badge variant="outline" className="font-mono">
                    v{currentVersion}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Versão que você está usando atualmente
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-800 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Nova versão disponível
                  </span>
                  <Badge variant="default" className="font-mono bg-green-600">
                    {serverVersionInfo ? `v${serverVersionInfo.version}` : 'Carregando...'}
                  </Badge>
                </div>
                <div className="text-xs text-green-700">
                  {serverVersionInfo?.buildDate 
                    ? `Build: ${new Date(serverVersionInfo.buildDate).toLocaleDateString('pt-BR')}`
                    : 'Versão mais recente disponível'
                  }
                </div>
              </div>
            </div>

            {/* Informações importantes */}
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Importante:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• A atualização é rápida e automática</li>
                    <li>• Seus dados não serão afetados</li>
                    <li>• Você será redirecionado para a nova versão</li>
                  </ul>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex space-x-3 pt-4">
          <Button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {isUpdating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Atualizando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Atualizar Agora
              </>
            )}
          </Button>
          
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={isUpdating}
            className="px-6 hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-xs text-center text-muted-foreground pt-2 bg-muted/30 p-2 rounded">
          💡 Você pode verificar atualizações manualmente usando o botão "Verificar Atualizações" no menu "Sobre"
        </div>
      </DialogContent>
    </Dialog>
  )
}
