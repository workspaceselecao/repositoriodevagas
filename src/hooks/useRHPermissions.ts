import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { isRHEditEnabled, isRHDeleteEnabled } from '../lib/systemConfig'

export function useRHPermissions() {
  const { user } = useAuth()
  const [canEdit, setCanEdit] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkPermissions = async () => {
      if (!user) {
        setCanEdit(false)
        setCanDelete(false)
        setLoading(false)
        return
      }

      if (user.role === 'ADMIN') {
        // Administradores sempre têm acesso completo
        setCanEdit(true)
        setCanDelete(true)
        setLoading(false)
        return
      }

      if (user.role === 'RH') {
        try {
          const [editEnabled, deleteEnabled] = await Promise.all([
            isRHEditEnabled(),
            isRHDeleteEnabled()
          ])
          setCanEdit(editEnabled)
          setCanDelete(deleteEnabled)
        } catch (error) {
          console.error('Erro ao verificar permissões RH:', error)
          setCanEdit(false)
          setCanDelete(false)
        }
      }

      setLoading(false)
    }

    checkPermissions()
  }, [user])

  return {
    canEdit,
    canDelete,
    loading,
    isAdmin: user?.role === 'ADMIN',
    isRH: user?.role === 'RH'
  }
}
