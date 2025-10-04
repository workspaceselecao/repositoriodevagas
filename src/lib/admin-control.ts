// Sistema de controle administrativo para bloquear/liberar carregamento de dados

export interface AdminControlState {
  isBlocked: boolean
  lastUpdated: number
  updatedBy: string
}

// Chaves para localStorage
const ADMIN_CONTROL_KEY = 'admin_db_control'
const BLOCK_DB_LOADING_KEY = 'VITE_BLOCK_DB_LOADING'

// Função para obter o estado atual do controle
export function getAdminControlState(): AdminControlState {
  try {
    const stored = localStorage.getItem(ADMIN_CONTROL_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        isBlocked: parsed.isBlocked || false,
        lastUpdated: parsed.lastUpdated || Date.now(),
        updatedBy: parsed.updatedBy || 'system'
      }
    }
  } catch (error) {
    console.warn('Erro ao carregar estado do controle administrativo:', error)
  }

  // Estado padrão
  return {
    isBlocked: false,
    lastUpdated: Date.now(),
    updatedBy: 'system'
  }
}

// Função para definir o estado do controle
export function setAdminControlState(isBlocked: boolean, updatedBy: string = 'admin'): AdminControlState {
  const newState: AdminControlState = {
    isBlocked,
    lastUpdated: Date.now(),
    updatedBy
  }

  try {
    // Salvar estado completo
    localStorage.setItem(ADMIN_CONTROL_KEY, JSON.stringify(newState))
    
    // Salvar variável de ambiente simulada
    localStorage.setItem(BLOCK_DB_LOADING_KEY, isBlocked.toString())
    
    console.log(`🔧 Controle administrativo atualizado: ${isBlocked ? 'BLOQUEADO' : 'LIBERADO'} por ${updatedBy}`)
    
    return newState
  } catch (error) {
    console.error('Erro ao salvar estado do controle administrativo:', error)
    throw new Error('Falha ao atualizar controle administrativo')
  }
}

// Função para verificar se o carregamento está bloqueado
export function isDbLoadingBlocked(): boolean {
  try {
    // Primeiro, verificar localStorage (controle dinâmico)
    const dynamicControl = localStorage.getItem(BLOCK_DB_LOADING_KEY)
    if (dynamicControl !== null) {
      return dynamicControl === 'true'
    }

    // Fallback para variável de ambiente (se disponível)
    const envControl = import.meta.env.VITE_BLOCK_DB_LOADING
    if (envControl !== undefined) {
      return envControl === 'true'
    }

    // Estado padrão: não bloqueado
    return false
  } catch (error) {
    console.warn('Erro ao verificar estado do bloqueio:', error)
    return false
  }
}

// Função para resetar o controle para o estado padrão
export function resetAdminControl(): AdminControlState {
  return setAdminControlState(false, 'system')
}

// Função para obter histórico de mudanças (se necessário)
export function getAdminControlHistory(): AdminControlState[] {
  try {
    const stored = localStorage.getItem(`${ADMIN_CONTROL_KEY}_history`)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.warn('Erro ao carregar histórico do controle administrativo:', error)
  }
  return []
}

// Função para salvar no histórico (opcional)
export function saveToHistory(state: AdminControlState): void {
  try {
    const history = getAdminControlHistory()
    history.push(state)
    
    // Manter apenas os últimos 10 registros
    if (history.length > 10) {
      history.splice(0, history.length - 10)
    }
    
    localStorage.setItem(`${ADMIN_CONTROL_KEY}_history`, JSON.stringify(history))
  } catch (error) {
    console.warn('Erro ao salvar histórico:', error)
  }
}

// Função para notificar outros componentes sobre mudanças
export function notifyControlChange(state: AdminControlState): void {
  try {
    // Disparar evento customizado para notificar outros componentes
    const event = new CustomEvent('adminControlChanged', {
      detail: state
    })
    window.dispatchEvent(event)
  } catch (error) {
    console.warn('Erro ao notificar mudança de controle:', error)
  }
}

// Função completa para alterar o estado com notificação
export function changeAdminControlState(isBlocked: boolean, updatedBy: string = 'admin'): AdminControlState {
  const newState = setAdminControlState(isBlocked, updatedBy)
  saveToHistory(newState)
  notifyControlChange(newState)
  return newState
}

// Hook personalizado para usar o controle administrativo
export function useAdminControl() {
  const [state, setState] = React.useState<AdminControlState>(getAdminControlState)

  React.useEffect(() => {
    // Escutar mudanças no controle
    const handleControlChange = (event: CustomEvent) => {
      setState(event.detail)
    }

    window.addEventListener('adminControlChanged', handleControlChange as EventListener)
    
    return () => {
      window.removeEventListener('adminControlChanged', handleControlChange as EventListener)
    }
  }, [])

  const updateControl = React.useCallback((isBlocked: boolean, updatedBy: string = 'admin') => {
    const newState = changeAdminControlState(isBlocked, updatedBy)
    setState(newState)
    return newState
  }, [])

  const resetControl = React.useCallback(() => {
    const newState = resetAdminControl()
    setState(newState)
    return newState
  }, [])

  return {
    state,
    isBlocked: state.isBlocked,
    updateControl,
    resetControl,
    lastUpdated: state.lastUpdated,
    updatedBy: state.updatedBy
  }
}

// Importar React para o hook
import React from 'react'
