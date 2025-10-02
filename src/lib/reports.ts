import { supabase } from './supabase'
import { Report, ReportFormData, User } from '../types/database'

// Criar um novo report
export async function createReport(reportData: ReportFormData, reportedBy: string): Promise<Report | null> {
  try {
    console.log('📝 Criando report:', { reportData, reportedBy })
    
    // Verificar se o usuário tem permissão
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', reportedBy)
      .single()
    
    if (userError || !userData) {
      console.error('❌ Usuário não encontrado:', userError)
      throw new Error('Usuário não encontrado ou sem permissão')
    }
    
    if (userData.role !== 'RH') {
      console.error('❌ Usuário não tem permissão RH:', userData.role)
      throw new Error('Apenas usuários RH podem criar reports')
    }
    
    console.log('✅ Usuário validado:', userData)
    
    // Buscar o valor atual do campo reportado
    const { data: vagaData, error: vagaError } = await supabase
      .from('vagas')
      .select('*')
      .eq('id', reportData.vaga_id)
      .single()
    
    if (vagaError) {
      console.error('❌ Erro ao buscar vaga:', vagaError)
      throw new Error(`Erro ao buscar vaga: ${vagaError.message}`)
    }
    
    const currentValue = (vagaData as any)[reportData.field_name] || 'Não informado'
    console.log('📋 Valor atual do campo:', currentValue)
    
    const { data, error } = await supabase
      .from('reports')
      .insert({
        vaga_id: reportData.vaga_id,
        reported_by: reportedBy,
        assigned_to: reportData.assigned_to,
        field_name: reportData.field_name,
        current_value: currentValue,
        suggested_changes: reportData.suggested_changes
      })
      .select('*')
      .single()

    if (error) {
      console.error('❌ Erro ao criar report:', error)
      console.log('🔍 Detalhes do erro:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      throw error
    }

    console.log('✅ Report criado com sucesso:', data)
    return data
  } catch (error) {
    console.error('❌ Erro detalhado ao criar report:', error)
    throw error
  }
}

// Buscar reports por usuário (admin recebe todos, RH recebe apenas os seus)
export async function getReportsByUser(userId: string, userRole: string): Promise<Report[]> {
  try {
    let query = supabase
      .from('reports')
      .select(`
        *,
        vaga:vagas(*),
        reporter:users!reports_reported_by_fkey(*),
        assignee:users!reports_assigned_to_fkey(*)
      `)
      .order('created_at', { ascending: false })

    // RH só vê seus próprios reports
    if (userRole === 'RH') {
      query = query.eq('reported_by', userId)
    }
    // ADMIN vê todos os reports

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar reports:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Erro detalhado ao buscar reports:', error)
    throw error
  }
}

// Buscar reports pendentes para um admin específico
export async function getPendingReportsForAdmin(adminId: string): Promise<Report[]> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        vaga:vagas(*),
        reporter:users!reports_reported_by_fkey(*),
        assignee:users!reports_assigned_to_fkey(*)
      `)
      .eq('assigned_to', adminId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar reports pendentes:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Erro detalhado ao buscar reports pendentes:', error)
    throw error
  }
}

// Atualizar status do report
export async function updateReportStatus(
  reportId: string, 
  status: 'pending' | 'in_progress' | 'completed' | 'rejected',
  adminNotes?: string
): Promise<Report | null> {
  try {
    const updateData: any = { status }
    
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }
    
    if (adminNotes) {
      updateData.admin_notes = adminNotes
    }

    const { data, error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', reportId)
      .select(`
        *,
        vaga:vagas(*),
        reporter:users!reports_reported_by_fkey(*),
        assignee:users!reports_assigned_to_fkey(*)
      `)
      .single()

    if (error) {
      console.error('Erro ao atualizar status do report:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Erro detalhado ao atualizar status do report:', error)
    throw error
  }
}

// Buscar report por ID
export async function getReportById(reportId: string): Promise<Report | null> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        vaga:vagas(*),
        reporter:users!reports_reported_by_fkey(*),
        assignee:users!reports_assigned_to_fkey(*)
      `)
      .eq('id', reportId)
      .single()

    if (error) {
      console.error('Erro ao buscar report:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Erro detalhado ao buscar report:', error)
    throw error
  }
}

// Buscar todos os usuários ADMIN
export async function getAllAdmins(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'ADMIN')
      .order('name')

    if (error) {
      console.error('Erro ao buscar admins:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Erro detalhado ao buscar admins:', error)
    throw error
  }
}

// Deletar report (apenas ADMIN)
export async function deleteReport(reportId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId)

    if (error) {
      console.error('Erro ao deletar report:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('Erro detalhado ao deletar report:', error)
    throw error
  }
}
