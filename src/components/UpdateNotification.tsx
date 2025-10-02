import { useState } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Download, X, Bell } from 'lucide-react'
import { cn } from '../lib/utils'

interface UpdateNotificationProps {
  hasUpdate: boolean
  isChecking: boolean
  onUpdate: () => void
  onCheckUpdate: () => void
  className?: string
}

export default function UpdateNotification({ 
  hasUpdate, 
  isChecking, 
  onUpdate, 
  onCheckUpdate,
  className 
}: UpdateNotificationProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  // Não mostrar se foi dispensado ou se não há atualização
  if (isDismissed || !hasUpdate) {
    return null
  }

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 max-w-sm",
      "bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700",
      "rounded-lg shadow-lg p-4 animate-in slide-in-from-top-2",
      className
    )}>
      <div className="flex items-start space-x-3">
        {/* Ícone de notificação */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Bell className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Conteúdo da notificação */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Atualização Disponível
            </h4>
            <Badge variant="default" className="bg-blue-500 text-white text-xs">
              Nova versão
            </Badge>
          </div>
          
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Uma nova versão está disponível com melhorias e correções.
          </p>

          {/* Botões de ação */}
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={onUpdate}
              disabled={isChecking}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs h-7"
            >
              <Download className="h-3 w-3 mr-1" />
              Atualizar
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={onCheckUpdate}
              disabled={isChecking}
              className="text-xs h-7 px-2"
            >
              Verificar
            </Button>
          </div>
        </div>

        {/* Botão de fechar */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsDismissed(true)}
          className="flex-shrink-0 h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
