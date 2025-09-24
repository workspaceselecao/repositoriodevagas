import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Download, RefreshCw, X } from 'lucide-react'
import { APP_VERSION, checkForUpdates } from '../version'

interface UpdateModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export default function UpdateModal({ isOpen, onClose, onUpdate }: UpdateModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)

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
            <Download className="h-5 w-5 text-blue-600" />
            <span>Nova Versão Disponível!</span>
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <p>
              Uma nova versão da aplicação está disponível. Recomendamos atualizar 
              para obter as últimas funcionalidades e correções.
            </p>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Versão atual:</span>
                <span className="font-mono bg-white px-2 py-1 rounded text-xs">
                  v{APP_VERSION}
                </span>
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Nova versão:</span>
                <span className="font-mono bg-white px-2 py-1 rounded text-xs text-green-600">
                  Disponível
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              💡 <strong>Dica:</strong> A atualização é rápida e não afetará seus dados.
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex space-x-3 pt-4">
          <Button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex-1"
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
            className="px-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-xs text-center text-gray-400 pt-2">
          Você pode atualizar mais tarde usando o botão "Verificar Atualizações" no Dashboard
        </div>
      </DialogContent>
    </Dialog>
  )
}
