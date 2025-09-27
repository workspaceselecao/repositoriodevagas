import React from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'

export const OfflineIndicator: React.FC = () => {
  const { isOffline } = usePWA()

  if (!isOffline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span>Você está offline. Algumas funcionalidades podem estar limitadas.</span>
      </div>
    </div>
  )
}
