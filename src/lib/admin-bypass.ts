import { supabase, supabaseAdmin } from './supabase'
import { useAdminSovereignty } from '../hooks/useAdminSovereignty'

// Tipos para operações administrativas
export interface AdminOperation {
  operation: string
  resource: string
  resourceId?: string
  data?: any
  reason?: string
}

export interface BypassResult<T = any> {
  success: boolean
  data?: T
  error?: string
  logged: boolean
}

// Classe para operações administrativas soberanas
export class AdminBypass {
  private static instance: AdminBypass
  private sovereigntyHook: ReturnType<typeof useAdminSovereignty> | null = null

  private constructor() {}

  static getInstance(): AdminBypass {
    if (!AdminBypass.instance) {
      AdminBypass.instance = new AdminBypass()
    }
    return AdminBypass.instance
  }

  // Configurar hook de soberania
  setSovereigntyHook(hook: ReturnType<typeof useAdminSovereignty>) {
    this.sovereigntyHook = hook
  }

  // Verificar se é administrador
  private isAdmin(): boolean {
    return this.sovereigntyHook?.isAdmin || false
  }

  // Verificar se tem poder específico
  private hasPower(actionType: string, targetResource?: string): boolean {
    return this.sovereigntyHook?.hasPower(actionType, targetResource) || false
  }

  // Log de operação administrativa
  private async logOperation(
    action: string,
    resourceType?: string,
    resourceId?: string,
    oldValues?: any,
    newValues?: any
  ): Promise<void> {
    if (this.sovereigntyHook) {
      await this.sovereigntyHook.logAdminAction(
        action,
        resourceType,
        resourceId,
        oldValues,
        newValues
      )
    }
  }

  // Bypass para operações de usuário
  async bypassUserOperation<T>(
    operation: () => Promise<T>,
    action: string,
    userId?: string
  ): Promise<BypassResult<T>> {
    if (!this.isAdmin()) {
      return { success: false, error: 'Acesso negado: não é administrador', logged: false }
    }

    if (!this.hasPower('user_management')) {
      return { success: false, error: 'Acesso negado: sem poder de gerenciamento de usuários', logged: false }
    }

    try {
      const result = await operation()
      await this.logOperation(action, 'users', userId)
      return { success: true, data: result, logged: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { success: false, error: errorMessage, logged: false }
    }
  }

  // Bypass para operações de vagas
  async bypassVagaOperation<T>(
    operation: () => Promise<T>,
    action: string,
    vagaId?: string
  ): Promise<BypassResult<T>> {
    if (!this.isAdmin()) {
      return { success: false, error: 'Acesso negado: não é administrador', logged: false }
    }

    if (!this.hasPower('data_management')) {
      return { success: false, error: 'Acesso negado: sem poder de gerenciamento de dados', logged: false }
    }

    try {
      const result = await operation()
      await this.logOperation(action, 'vagas', vagaId)
      return { success: true, data: result, logged: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { success: false, error: errorMessage, logged: false }
    }
  }

  // Bypass para operações de sistema
  async bypassSystemOperation<T>(
    operation: () => Promise<T>,
    action: string,
    systemId?: string
  ): Promise<BypassResult<T>> {
    if (!this.isAdmin()) {
      return { success: false, error: 'Acesso negado: não é administrador', logged: false }
    }

    if (!this.hasPower('system_control')) {
      return { success: false, error: 'Acesso negado: sem poder de controle do sistema', logged: false }
    }

    try {
      const result = await operation()
      await this.logOperation(action, 'system', systemId)
      return { success: true, data: result, logged: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { success: false, error: errorMessage, logged: false }
    }
  }

  // Bypass de emergência (contorna todas as verificações)
  async emergencyBypass<T>(
    operation: () => Promise<T>,
    action: string,
    reason: string,
    resourceType?: string,
    resourceId?: string
  ): Promise<BypassResult<T>> {
    if (!this.isAdmin()) {
      return { success: false, error: 'Acesso negado: não é administrador', logged: false }
    }

    if (!this.hasPower('emergency_override')) {
      return { success: false, error: 'Acesso negado: sem poder de sobrescrita de emergência', logged: false }
    }

    try {
      const result = await operation()
      await this.logOperation(action, resourceType, resourceId, null, {
        emergency_bypass: true,
        reason,
        timestamp: new Date().toISOString()
      })
      return { success: true, data: result, logged: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { success: false, error: errorMessage, logged: false }
    }
  }

  // Operações específicas de usuário com bypass
  async createUserWithBypass(userData: any): Promise<BypassResult> {
    return this.bypassUserOperation(
      async () => {
        const { data, error } = await supabaseAdmin
          .from('users')
          .insert(userData)
          .select()
          .single()

        if (error) throw error
        return data
      },
      'create_user_with_bypass',
      undefined
    )
  }

  async updateUserWithBypass(userId: string, updates: any): Promise<BypassResult> {
    return this.bypassUserOperation(
      async () => {
        const { data, error } = await supabaseAdmin
          .from('users')
          .update(updates)
          .eq('id', userId)
          .select()
          .single()

        if (error) throw error
        return data
      },
      'update_user_with_bypass',
      userId
    )
  }

  async deleteUserWithBypass(userId: string): Promise<BypassResult> {
    return this.bypassUserOperation(
      async () => {
        const { error } = await supabaseAdmin
          .from('users')
          .delete()
          .eq('id', userId)

        if (error) throw error
        return { deleted: true }
      },
      'delete_user_with_bypass',
      userId
    )
  }

  // Operações específicas de vagas com bypass
  async createVagaWithBypass(vagaData: any): Promise<BypassResult> {
    return this.bypassVagaOperation(
      async () => {
        const { data, error } = await supabaseAdmin
          .from('vagas')
          .insert(vagaData)
          .select()
          .single()

        if (error) throw error
        return data
      },
      'create_vaga_with_bypass',
      undefined
    )
  }

  async updateVagaWithBypass(vagaId: string, updates: any): Promise<BypassResult> {
    return this.bypassVagaOperation(
      async () => {
        const { data, error } = await supabaseAdmin
          .from('vagas')
          .update(updates)
          .eq('id', vagaId)
          .select()
          .single()

        if (error) throw error
        return data
      },
      'update_vaga_with_bypass',
      vagaId
    )
  }

  async deleteVagaWithBypass(vagaId: string): Promise<BypassResult> {
    return this.bypassVagaOperation(
      async () => {
        const { error } = await supabaseAdmin
          .from('vagas')
          .delete()
          .eq('id', vagaId)

        if (error) throw error
        return { deleted: true }
      },
      'delete_vaga_with_bypass',
      vagaId
    )
  }

  // Operações de sistema com bypass
  async updateSystemControlWithBypass(controlData: any): Promise<BypassResult> {
    return this.bypassSystemOperation(
      async () => {
        const { data, error } = await supabaseAdmin
          .from('system_control')
          .update(controlData)
          .eq('id', '00000000-0000-0000-0000-000000000001')
          .select()
          .single()

        if (error) throw error
        return data
      },
      'update_system_control_with_bypass',
      '00000000-0000-0000-0000-000000000001'
    )
  }

  // Operações de auditoria
  async getAuditLogsWithBypass(limit = 100): Promise<BypassResult> {
    if (!this.isAdmin()) {
      return { success: false, error: 'Acesso negado: não é administrador', logged: false }
    }

    if (!this.hasPower('audit_access')) {
      return { success: false, error: 'Acesso negado: sem poder de acesso à auditoria', logged: false }
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('admin_audit_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) throw error

      await this.logOperation('access_audit_logs', 'admin_audit_log')
      return { success: true, data, logged: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return { success: false, error: errorMessage, logged: false }
    }
  }

  // Operação de limpeza de dados (emergência)
  async emergencyDataCleanup(table: string, condition: any): Promise<BypassResult> {
    return this.emergencyBypass(
      async () => {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .match(condition)

        if (error) throw error
        return { cleaned: true, table, condition }
      },
      'emergency_data_cleanup',
      'Limpeza de emergência de dados',
      table
    )
  }
}

// Instância singleton
export const adminBypass = AdminBypass.getInstance()

// Hook para usar o bypass administrativo
export function useAdminBypass() {
  const sovereignty = useAdminSovereignty()
  
  // Configurar o hook no singleton
  React.useEffect(() => {
    adminBypass.setSovereigntyHook(sovereignty)
  }, [sovereignty])

  return {
    ...sovereignty,
    bypass: adminBypass
  }
}

// Importar React para o hook
import React from 'react'
