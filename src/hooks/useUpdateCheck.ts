import { useState, useEffect, useCallback } from 'react'
import { checkForUpdates, forceReload } from '../version'

interface UseUpdateCheckOptions {
  checkOnMount?: boolean
  checkInterval?: number // em milissegundos
  showModalDelay?: number // delay antes de mostrar o modal
}

export function useUpdateCheck(options: UseUpdateCheckOptions = {}) {
  const {
    checkOnMount = true,
    checkInterval = 0, // 0 = não verificar automaticamente
    showModalDelay = 2000 // 2 segundos de delay
  } = options

  const [hasUpdate, setHasUpdate] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkForUpdatesNow = useCallback(async () => {
    if (isChecking) return false

    setIsChecking(true)
    try {
      const hasNewVersion = await checkForUpdates()
      setHasUpdate(hasNewVersion)
      setLastChecked(new Date())
      
      // Se há atualização e ainda não mostrou o modal, mostrar após delay
      if (hasNewVersion && !showModal) {
        setTimeout(() => {
          setShowModal(true)
        }, showModalDelay)
      }
      
      return hasNewVersion
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error)
      return false
    } finally {
      setIsChecking(false)
    }
  }, [isChecking, showModal, showModalDelay])

  const handleUpdate = useCallback(() => {
    forceReload()
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
  }, [])

  // Verificar atualizações na montagem do componente
  useEffect(() => {
    if (checkOnMount) {
      checkForUpdatesNow()
    }
  }, [checkOnMount, checkForUpdatesNow])

  // Verificar atualizações em intervalos regulares (se configurado)
  useEffect(() => {
    if (checkInterval > 0) {
      const interval = setInterval(checkForUpdatesNow, checkInterval)
      return () => clearInterval(interval)
    }
  }, [checkInterval, checkForUpdatesNow])

  return {
    hasUpdate,
    isChecking,
    showModal,
    lastChecked,
    checkForUpdates: checkForUpdatesNow,
    handleUpdate,
    handleCloseModal
  }
}
