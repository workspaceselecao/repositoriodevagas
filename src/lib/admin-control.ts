// Sistema de controle administrativo para bloquear/liberar carregamento de dados
import { supabaseAdmin } from './supabase'

export interface AdminControlState {
  isBlocked: boolean
  lastUpdated: number
  updatedBy: string
  blockedBy?: string
  blockedAt?: string
  reason?: string
}

// Chaves para localStorage
const ADMIN_CONTROL_KEY = 'admin_db_control'
const BLOCK_DB_LOADING_KEY = 'VITE_BLOCK_DB_LOADING'

// Função para obter o estado atual do controle do banco
export async function getAdminControlState(): Promise<AdminControlState> {
  try {
    console.log('🔍 [getAdminControlState] Buscando estado do controle no banco...')
    
    const { data, error } = await supabaseAdmin
      .from('system_control')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single()

    if (error) {
      console.warn('⚠️ [getAdminControlState] Erro ao buscar no banco, usando localStorage:', error.message)
      return getAdminControlStateFromLocalStorage()
    }

    if (data) {
      console.log('✅ [getAdminControlState] Estado encontrado no banco:', data)
      return {
        isBlocked: data.is_blocked || false,
        lastUpdated: new Date(data.updated_at).getTime(),
        updatedBy: data.blocked_by || data.unblocked_by || 'system',
        blockedBy: data.blocked_by,
        blockedAt: data.blocked_at,
        reason: data.reason
      }
    }
  } catch (error) {
    console.warn('⚠️ [getAdminControlState] Erro ao acessar banco, usando localStorage:', error)
    return getAdminControlStateFromLocalStorage()
  }

  // Estado padrão se não encontrar nada
  return {
    isBlocked: false,
    lastUpdated: Date.now(),
    updatedBy: 'system'
  }
}

// Função para obter estado do localStorage (fallback)
function getAdminControlStateFromLocalStorage(): AdminControlState {
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
    console.warn('Erro ao carregar estado do controle administrativo do localStorage:', error)
  }

  // Estado padrão
  return {
    isBlocked: false,
    lastUpdated: Date.now(),
    updatedBy: 'system'
  }
}

// Função para definir o estado do controle no banco
export async function setAdminControlState(isBlocked: boolean, updatedBy: string = 'admin', reason?: string): Promise<AdminControlState> {
  try {
    console.log(`🔧 [setAdminControlState] Atualizando controle: ${isBlocked ? 'BLOQUEADO' : 'LIBERADO'} por ${updatedBy}`)
    
    const now = new Date().toISOString()
    const controlId = '00000000-0000-0000-0000-000000000001'
    
    // Preparar dados para atualização
    const updateData: any = {
      is_blocked: isBlocked,
      updated_at: now,
      reason: reason || null
    }
    
    if (isBlocked) {
      updateData.blocked_by = updatedBy
      updateData.blocked_at = now
      updateData.unblocked_by = null
      updateData.unblocked_at = null
    } else {
      updateData.unblocked_by = updatedBy
      updateData.unblocked_at = now
      updateData.blocked_by = null
      updateData.blocked_at = null
    }
    
    // Atualizar no banco
    const { data, error } = await supabaseAdmin
      .from('system_control')
      .update(updateData)
      .eq('id', controlId)
      .select()
      .single()
    
    if (error) {
      console.error('❌ [setAdminControlState] Erro ao atualizar no banco:', error)
      throw new Error(`Erro ao atualizar controle no banco: ${error.message}`)
    }
    
    const newState: AdminControlState = {
      isBlocked: data.is_blocked,
      lastUpdated: new Date(data.updated_at).getTime(),
      updatedBy: data.blocked_by || data.unblocked_by || updatedBy,
      blockedBy: data.blocked_by,
      blockedAt: data.blocked_at,
      reason: data.reason
    }
    
    // Salvar também no localStorage como fallback
    localStorage.setItem(ADMIN_CONTROL_KEY, JSON.stringify(newState))
    localStorage.setItem(BLOCK_DB_LOADING_KEY, isBlocked.toString())
    
    console.log(`✅ [setAdminControlState] Controle atualizado com sucesso no banco`)
    return newState
    
  } catch (error) {
    console.error('❌ [setAdminControlState] Erro ao salvar estado:', error)
    
    // Fallback para localStorage se o banco falhar
    const newState: AdminControlState = {
      isBlocked,
      lastUpdated: Date.now(),
      updatedBy
    }
    
    localStorage.setItem(ADMIN_CONTROL_KEY, JSON.stringify(newState))
    localStorage.setItem(BLOCK_DB_LOADING_KEY, isBlocked.toString())
    
    console.warn('⚠️ [setAdminControlState] Usando localStorage como fallback')
    return newState
  }
}

// Função para verificar se o carregamento está bloqueado (síncrona para compatibilidade)
export function isDbLoadingBlocked(): boolean {
  try {
    // Verificar localStorage primeiro (mais rápido)
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

// Função assíncrona para verificar bloqueio no banco (mais confiável)
export async function isDbLoadingBlockedAsync(): Promise<boolean> {
  try {
    console.log('🔍 [isDbLoadingBlockedAsync] Verificando bloqueio no banco...')
    
    const { data, error } = await supabaseAdmin
      .from('system_control')
      .select('is_blocked')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single()

    if (error) {
      console.warn('⚠️ [isDbLoadingBlockedAsync] Erro ao verificar no banco, usando localStorage:', error.message)
      return isDbLoadingBlocked()
    }

    const isBlocked = data?.is_blocked || false
    console.log(`🔍 [isDbLoadingBlockedAsync] Estado do banco: ${isBlocked ? 'BLOQUEADO' : 'LIBERADO'}`)
    
    // Sincronizar com localStorage
    localStorage.setItem(BLOCK_DB_LOADING_KEY, isBlocked.toString())
    
    return isBlocked
  } catch (error) {
    console.warn('⚠️ [isDbLoadingBlockedAsync] Erro ao acessar banco, usando localStorage:', error)
    return isDbLoadingBlocked()
  }
}

// Função para resetar o controle para o estado padrão
export async function resetAdminControl(): Promise<AdminControlState> {
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
export async function changeAdminControlState(isBlocked: boolean, updatedBy: string = 'admin', reason?: string): Promise<AdminControlState> {
  const newState = await setAdminControlState(isBlocked, updatedBy, reason)
  saveToHistory(newState)
  notifyControlChange(newState)
  return newState
}

// Hook personalizado para usar o controle administrativo
export function useAdminControl() {
  const [state, setState] = React.useState<AdminControlState>({
    isBlocked: false,
    lastUpdated: Date.now(),
    updatedBy: 'system'
  })
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // Carregar estado inicial
    const loadInitialState = async () => {
      try {
        setLoading(true)
        const initialState = await getAdminControlState()
        setState(initialState)
      } catch (error) {
        console.error('Erro ao carregar estado inicial:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInitialState()

    // Escutar mudanças no controle
    const handleControlChange = (event: CustomEvent) => {
      setState(event.detail)
    }

    window.addEventListener('adminControlChanged', handleControlChange as EventListener)
    
    return () => {
      window.removeEventListener('adminControlChanged', handleControlChange as EventListener)
    }
  }, [])

  const updateControl = React.useCallback(async (isBlocked: boolean, updatedBy: string = 'admin', reason?: string) => {
    try {
      const newState = await changeAdminControlState(isBlocked, updatedBy, reason)
      setState(newState)
      return newState
    } catch (error) {
      console.error('Erro ao atualizar controle:', error)
      throw error
    }
  }, [])

  const resetControl = React.useCallback(async () => {
    try {
      const newState = await resetAdminControl()
      setState(newState)
      return newState
    } catch (error) {
      console.error('Erro ao resetar controle:', error)
      throw error
    }
  }, [])

  return {
    state,
    isBlocked: state.isBlocked,
    updateControl,
    resetControl,
    lastUpdated: state.lastUpdated,
    updatedBy: state.updatedBy,
    loading
  }
}

// Importar React para o hook
import React from 'react'

// Função para verificar se operações de escrita estão bloqueadas
export async function checkWriteBlocked(): Promise<boolean> {
  try {
    const isBlocked = await isDbLoadingBlockedAsync()
    if (isBlocked) {
      console.warn('🚫 [checkWriteBlocked] Sistema está BLOQUEADO - operações de escrita não permitidas')
    }
    return isBlocked
  } catch (error) {
    console.warn('⚠️ [checkWriteBlocked] Erro ao verificar bloqueio, permitindo operação:', error)
    return false
  }
}

// Função para lançar erro se sistema estiver bloqueado
export async function assertWriteAllowed(): Promise<void> {
  const isBlocked = await checkWriteBlocked()
  if (isBlocked) {
    throw new Error('SISTEMA BLOQUEADO: Operações de escrita não são permitidas enquanto o sistema estiver bloqueado pelo SuperUsuário')
  }
}
