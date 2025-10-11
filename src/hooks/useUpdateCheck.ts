import { useState, useEffect, useCallback, useRef } from 'react'
import { checkForUpdates, forceReload, getCurrentStoredVersion, setCurrentStoredVersion } from '../version'

interface UseUpdateCheckOptions {
  checkOnMount?: boolean
  checkInterval?: number // em milissegundos
  showModalDelay?: number // delay antes de mostrar o modal
  autoCheckOnFocus?: boolean // verificar quando a janela ganha foco
}

export function useUpdateCheck(options: UseUpdateCheckOptions = {}) {
  const {
    checkOnMount = false, // SOLUÇÃO DEFINITIVA: Desabilitado por padrão
    checkInterval = 0, // 0 = não verificar automaticamente
    showModalDelay = 2000, // 2 segundos de delay
    autoCheckOnFocus = false // SOLUÇÃO DEFINITIVA: Desabilitado por padrão
  } = options

  const [hasUpdate, setHasUpdate] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [serverVersion, setServerVersion] = useState<string | null>(null)
  
  // Ref para evitar múltiplas verificações simultâneas
  const isCheckingRef = useRef(false)

  const checkForUpdatesNow = useCallback(async (forceShowModal = false) => {
    // Evitar múltiplas verificações simultâneas
    if (isCheckingRef.current) {
      console.log('⏳ Verificação já em andamento, aguardando...')
      return false
    }

    isCheckingRef.current = true
    setIsChecking(true)
    
    try {
      console.log('🔍 Iniciando verificação de atualizações...')
      const hasNewVersion = await checkForUpdates()
      
      setHasUpdate(hasNewVersion)
      setLastChecked(new Date())
      
      // Se há atualização, mostrar modal
      if (hasNewVersion && (forceShowModal || !showModal)) {
        console.log('🆕 Nova versão encontrada, mostrando modal em', showModalDelay, 'ms')
        setTimeout(() => {
          setShowModal(true)
        }, showModalDelay)
      }
      
      console.log('✅ Verificação concluída. Nova versão:', hasNewVersion ? 'SIM' : 'NÃO')
      return hasNewVersion
    } catch (error) {
      console.error('❌ Erro ao verificar atualizações:', error)
      return false
    } finally {
      setIsChecking(false)
      isCheckingRef.current = false
    }
  }, [showModal, showModalDelay])

  const handleUpdate = useCallback(() => {
    console.log('🚀 Iniciando atualização da aplicação...')
    forceReload()
  }, [])

  const handleCloseModal = useCallback(() => {
    console.log('❌ Modal de atualização fechado pelo usuário')
    setShowModal(false)
  }, [])

  // Verificar atualizações na montagem do componente
  useEffect(() => {
    if (checkOnMount) {
      // Pequeno delay para garantir que a aplicação esteja carregada
      const timer = setTimeout(() => {
        checkForUpdatesNow()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [checkOnMount, checkForUpdatesNow])

  // Verificar atualizações em intervalos regulares (se configurado)
  useEffect(() => {
    if (checkInterval > 0) {
      console.log(`⏰ Configurando verificação automática a cada ${checkInterval}ms`)
      const interval = setInterval(() => {
        checkForUpdatesNow()
      }, checkInterval)
      return () => {
        console.log('🛑 Parando verificação automática')
        clearInterval(interval)
      }
    }
  }, [checkInterval, checkForUpdatesNow])

  // DESABILITADO: Verificar atualizações quando a janela ganha foco
  // Isso estava causando logout automático quando a aplicação perdia o foco
  useEffect(() => {
    // Completamente desabilitado para evitar problemas de logout automático
    console.log('🚫 Verificações automáticas de atualização DESABILITADAS para evitar logout automático')
  }, [])

  return {
    hasUpdate,
    isChecking,
    showModal,
    lastChecked,
    serverVersion,
    checkForUpdates: checkForUpdatesNow,
    handleUpdate,
    handleCloseModal
  }
}
