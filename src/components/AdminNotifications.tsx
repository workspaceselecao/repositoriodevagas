import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { AlertCircle, Bell, X, CheckCircle } from 'lucide-react'
import { useRealtimeNotifications } from '../hooks/useRealtimeReports'
import { useAuth } from '../contexts/AuthContext'

export default function AdminNotifications() {
  const { user } = useAuth()
  const { notifications, removeNotification, clearAllNotifications } = useRealtimeNotifications()
  const [isExpanded, setIsExpanded] = useState(false)

  // Só mostrar para admins
  if (user?.role !== 'ADMIN') {
    return null
  }

  const hasNotifications = notifications.length > 0

  return (
    <div className="relative">
      {/* Botão de notificação */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative h-8 w-8 p-0 hover:bg-orange-100 hover:text-orange-600 transition-all duration-200"
        title="Notificações"
      >
        <Bell className="h-4 w-4" />
        {hasNotifications && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {notifications.length}
          </Badge>
        )}
      </Button>

      {/* Dropdown de notificações */}
      {isExpanded && (
        <Card className="absolute right-0 top-10 w-80 z-50 shadow-lg border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificações
              </CardTitle>
              <div className="flex items-center gap-1">
                {hasNotifications && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllNotifications}
                    className="h-6 w-6 p-0 text-xs"
                    title="Limpar todas"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="h-6 w-6 p-0"
                  title="Fechar"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {hasNotifications ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-3 p-2 rounded-md bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
                  >
                    <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        {notification.message}
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                        {notification.timestamp.toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNotification(notification.id)}
                      className="h-6 w-6 p-0 flex-shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Nenhuma notificação</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Overlay para fechar ao clicar fora */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  )
}
