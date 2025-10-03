import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useRealtimeReports, useAdminLoginDetection } from '../hooks/useRealtimeReports'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Bell, AlertTriangle, Wifi, WifiOff, CheckCircle } from 'lucide-react'

export default function AdminNotifications() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { reports, loading, newReportCount, isConnected, clearNewReportCount } = useRealtimeReports(user?.id || null)
  const { adminLoggedIn, loggedInAdmin } = useAdminLoginDetection()

  // Não mostrar para usuários não-admin
  if (!user || user.role !== 'ADMIN') {
    return null
  }

  const handleViewReports = () => {
    clearNewReportCount()
    navigate('/dashboard/reports')
  }

  return (
    <div className="flex items-center gap-2">
      {/* Indicador de conexão */}
      <div className="flex items-center gap-1">
        {isConnected ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
      </div>

      {/* Botão de notificações */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewReports}
          className="relative p-2 hover:bg-primary/10"
          title="Ver reports pendentes"
        >
          <Bell className="h-5 w-5" />
          {newReportCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {newReportCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Indicador de status do admin */}
      {adminLoggedIn && (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <AlertTriangle className="h-3 w-3" />
          <span>Admin Online</span>
        </div>
      )}
    </div>
  )
}