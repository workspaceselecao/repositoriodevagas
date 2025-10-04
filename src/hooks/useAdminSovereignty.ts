import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface AdminSovereignty {
  id: string
  admin_id: string
  action_type: string
  target_resource?: string
  action_details: any
  is_active: boolean
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface AdminAuditLog {
  id: string
  admin_id: string
  action: string
  resource_type?: string
  resource_id?: string
  old_values?: any
  new_values?: any
  ip_address?: string
  user_agent?: string
  timestamp: string
}

export interface SovereigntyPower {
  id: string
  name: string
  description: string
  action_type: string
  target_resource?: string
  is_active: boolean
  expires_at?: string
}

export function useAdminSovereignty() {
  const [powers, setPowers] = useState<SovereigntyPower[]>([])
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  // Verificar se o usuário é administrador
  const isAdmin = user?.role === 'ADMIN'

  // Carregar poderes administrativos
  const loadPowers = async () => {
    if (!isAdmin) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('admin_sovereignty')
        .select('*')
        .eq('admin_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedPowers: SovereigntyPower[] = data.map(power => ({
        id: power.id,
        name: getPowerName(power.action_type),
        description: getPowerDescription(power.action_type),
        action_type: power.action_type,
        target_resource: power.target_resource,
        is_active: power.is_active,
        expires_at: power.expires_at
      }))

      setPowers(formattedPowers)
    } catch (error) {
      console.error('Erro ao carregar poderes administrativos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Carregar logs de auditoria
  const loadAuditLogs = async (limit = 50) => {
    if (!isAdmin) return

    try {
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select('*')
        .eq('admin_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) throw error
      setAuditLogs(data || [])
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error)
    }
  }

  // Ativar poder administrativo
  const activatePower = async (
    actionType: string,
    targetResource?: string,
    actionDetails?: any,
    expiresAt?: string
  ) => {
    if (!isAdmin) throw new Error('Apenas administradores podem ativar poderes')

    try {
      const { data, error } = await supabase
        .from('admin_sovereignty')
        .insert({
          admin_id: user.id,
          action_type: actionType,
          target_resource: targetResource,
          action_details: actionDetails || {},
          is_active: true,
          expires_at: expiresAt
        })
        .select()
        .single()

      if (error) throw error

      // Log da ação
      await logAdminAction('activate_power', 'admin_sovereignty', data.id, null, {
        action_type: actionType,
        target_resource: targetResource,
        action_details: actionDetails
      })

      await loadPowers()
      return data
    } catch (error) {
      console.error('Erro ao ativar poder:', error)
      throw error
    }
  }

  // Desativar poder administrativo
  const deactivatePower = async (powerId: string) => {
    if (!isAdmin) throw new Error('Apenas administradores podem desativar poderes')

    try {
      const { error } = await supabase
        .from('admin_sovereignty')
        .update({ is_active: false })
        .eq('id', powerId)
        .eq('admin_id', user.id)

      if (error) throw error

      // Log da ação
      await logAdminAction('deactivate_power', 'admin_sovereignty', powerId, null, {
        deactivated: true
      })

      await loadPowers()
    } catch (error) {
      console.error('Erro ao desativar poder:', error)
      throw error
    }
  }

  // Verificar se tem poder específico
  const hasPower = (actionType: string, targetResource?: string): boolean => {
    if (!isAdmin) return false

    return powers.some(power => {
      if (power.action_type !== actionType) return false
      if (targetResource && power.target_resource !== targetResource) return false
      if (!power.is_active) return false
      if (power.expires_at && new Date(power.expires_at) < new Date()) return false
      return true
    })
  }

  // Log de ação administrativa
  const logAdminAction = async (
    action: string,
    resourceType?: string,
    resourceId?: string,
    oldValues?: any,
    newValues?: any
  ) => {
    if (!isAdmin) return

    try {
      await supabase
        .from('admin_audit_log')
        .insert({
          admin_id: user.id,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          old_values: oldValues,
          new_values: newValues,
          ip_address: await getClientIP(),
          user_agent: navigator.userAgent
        })
    } catch (error) {
      console.error('Erro ao registrar log administrativo:', error)
    }
  }

  // Obter IP do cliente
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip || 'unknown'
    } catch {
      return 'unknown'
    }
  }

  // Bypass RLS para operações administrativas
  const bypassRLS = async <T>(
    operation: () => Promise<T>,
    resourceType: string,
    action: string
  ): Promise<T> => {
    if (!isAdmin) throw new Error('Apenas administradores podem fazer bypass de RLS')

    // Verificar se tem poder de bypass
    if (!hasPower('bypass_rls', resourceType)) {
      throw new Error(`Sem poder para fazer bypass de RLS em ${resourceType}`)
    }

    try {
      const result = await operation()
      
      // Log da ação
      await logAdminAction(action, resourceType, undefined, undefined, {
        bypass_rls: true,
        timestamp: new Date().toISOString()
      })

      return result
    } catch (error) {
      console.error('Erro no bypass de RLS:', error)
      throw error
    }
  }

  // Carregar dados iniciais
  useEffect(() => {
    if (isAdmin) {
      loadPowers()
      loadAuditLogs()
    }
  }, [isAdmin, user?.id])

  return {
    powers,
    auditLogs,
    loading,
    isAdmin,
    loadPowers,
    loadAuditLogs,
    activatePower,
    deactivatePower,
    hasPower,
    logAdminAction,
    bypassRLS
  }
}

// Funções auxiliares para nomes e descrições dos poderes
function getPowerName(actionType: string): string {
  const names: Record<string, string> = {
    'bypass_rls': 'Bypass de RLS',
    'override_permissions': 'Sobrescrever Permissões',
    'system_control': 'Controle do Sistema',
    'user_management': 'Gerenciamento de Usuários',
    'data_management': 'Gerenciamento de Dados',
    'audit_access': 'Acesso a Auditoria',
    'emergency_override': 'Sobrescrita de Emergência'
  }
  return names[actionType] || actionType
}

function getPowerDescription(actionType: string): string {
  const descriptions: Record<string, string> = {
    'bypass_rls': 'Permite contornar as políticas de Row Level Security',
    'override_permissions': 'Permite sobrescrever permissões de outros usuários',
    'system_control': 'Permite controlar configurações do sistema',
    'user_management': 'Permite gerenciar usuários com privilégios elevados',
    'data_management': 'Permite gerenciar dados com privilégios elevados',
    'audit_access': 'Permite acessar logs de auditoria completos',
    'emergency_override': 'Permite sobrescrita de emergência em situações críticas'
  }
  return descriptions[actionType] || 'Poder administrativo'
}
