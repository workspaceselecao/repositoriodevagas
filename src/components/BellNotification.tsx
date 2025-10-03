import { useState, useEffect } from 'react'
import { Bell, BellRing } from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { useAuth } from '../contexts/AuthContext'
import { getPendingReportsForAdmin } from '../lib/reports'

interface BellNotificationProps {
  className?: string
}

export default function BellNotification({ className = '' }: BellNotificationProps) {
  const { user } = useAuth()
  const [pendingReports, setPendingReports] = useState(0)
  const [isRinging, setIsRinging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Verificar se o usuário é admin
  const isAdmin = user?.role === 'ADMIN'

  // Carregar reports pendentes
  const loadPendingReports = async () => {
    if (!isAdmin || !user?.id) return

    try {
      setIsLoading(true)
      const reports = await getPendingReportsForAdmin(user.id)
      const newCount = reports.length
      
      // Se há novos reports, animar o sino
      if (newCount > pendingReports && pendingReports > 0) {
        triggerBellAnimation()
      }
      
      setPendingReports(newCount)
    } catch (error) {
      console.error('Erro ao carregar reports pendentes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Animação do sino tocando
  const triggerBellAnimation = () => {
    setIsRinging(true)
    // Parar a animação após 3 segundos
    setTimeout(() => {
      setIsRinging(false)
    }, 3000)
  }

  // Carregar reports pendentes na montagem e quando o usuário mudar
  useEffect(() => {
    loadPendingReports()
  }, [user?.id, isAdmin])

  // Verificar novos reports a cada 30 segundos
  useEffect(() => {
    if (!isAdmin) return

    const interval = setInterval(() => {
      loadPendingReports()
    }, 30000) // 30 segundos

    return () => clearInterval(interval)
  }, [isAdmin, user?.id])

  // Não mostrar para usuários não-admin
  if (!isAdmin) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`relative h-8 w-8 p-0 hover:bg-orange-100 hover:text-orange-600 transition-all duration-200 ${className}`}
            onClick={loadPendingReports}
            disabled={isLoading}
          >
            {/* Ícone do sino com animação */}
            <div className={`relative ${isRinging ? 'animate-bounce' : ''}`}>
              {isRinging ? (
                <BellRing 
                  className={`h-4 w-4 text-orange-500 ${isRinging ? 'animate-pulse' : ''}`}
                />
              ) : (
                <Bell className="h-4 w-4" />
              )}
            </div>

            {/* Badge com contador */}
            {pendingReports > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold animate-pulse"
              >
                {pendingReports > 99 ? '99+' : pendingReports}
              </Badge>
            )}

            {/* Indicador de carregamento */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-3 w-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="text-center">
            <p className="font-semibold">
              {pendingReports === 0 
                ? 'Nenhum report pendente' 
                : `${pendingReports} report${pendingReports > 1 ? 's' : ''} pendente${pendingReports > 1 ? 's' : ''}`
              }
            </p>
            {pendingReports > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Clique para atualizar
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
