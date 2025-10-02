import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isRHNovaVagaEnabled } from '../lib/systemConfig'
import LoadingScreen from './LoadingScreen'

interface RHProtectedRouteProps {
  children: React.ReactNode
}

export default function RHProtectedRoute({ children }: RHProtectedRouteProps) {
  const { user, loading } = useAuth()
  const [rhAccessEnabled, setRhAccessEnabled] = useState<boolean | null>(null)
  const [checkingAccess, setCheckingAccess] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      if (user?.role === 'ADMIN') {
        // Admins sempre têm acesso
        setRhAccessEnabled(true)
        setCheckingAccess(false)
        return
      }

      if (user?.role === 'RH') {
        try {
          const enabled = await isRHNovaVagaEnabled()
          setRhAccessEnabled(enabled)
        } catch (error) {
          console.error('Erro ao verificar acesso RH:', error)
          setRhAccessEnabled(false)
        }
      } else {
        setRhAccessEnabled(false)
      }
      
      setCheckingAccess(false)
    }

    if (!loading && user) {
      checkAccess()
    }
  }, [user, loading])

  if (loading || checkingAccess) {
    return <LoadingScreen message="Verificando permissões..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role === 'ADMIN') {
    return <>{children}</>
  }

  if (user.role === 'RH' && rhAccessEnabled === true) {
    return <>{children}</>
  }

  // RH sem acesso ou outros casos
  return <Navigate to="/dashboard" replace />
}
