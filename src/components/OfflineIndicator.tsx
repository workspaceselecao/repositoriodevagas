import React from 'react'
import { WifiOff, Wifi } from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'

export const OfflineIndicator: React.FC = () => {
  const { isOffline } = usePWA()

  if (!isOffline) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-orange-100 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded-lg shadow-lg p-3 animate-in slide-in-from-top-2 duration-300">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Sem conexão
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Algumas funcionalidades podem estar limitadas
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
