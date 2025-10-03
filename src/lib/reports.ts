import { supabase, supabaseAdmin } from './supabase'
import { Report, ReportFormData, User } from '../types/database'

// =============================================
// SISTEMA DE REPORTS REFEITO DO ZERO
// =============================================

/**
 * ARQUITETURA DO SISTEMA:
 * 1. RH cria report → ADMIN recebe notificação
 * 2. ADMIN edita vaga baseada no report
 * 3. Sistema de comunicação em tempo real
 * 
 * FLUXO DE DADOS:
 * Supabase Auth (autenticação) → Tabela users (roles) → Tabela reports (comunicação)
 */

// =============================================
// 1. FUNÇÃO PRINCIPAL: CRIAR REPORT
// =============================================

export async function createReport(reportData: ReportFormData, reportedBy: string): Promise<Report | null> {
  try {
    console.log('🚀 [REPORTS] Iniciando criação de report...')
    console.log('📋 Dados:', { reportData, reportedBy })
    
    // ETAPA 1: Verificar autenticação
    const authUser = await verifyAuthentication(reportedBy)
    console.log('✅ Usuário autenticado:', authUser.id)
    
    // ETAPA 2: Garantir que usuário existe na tabela users
    const user = await ensureUserExists(authUser)
    console.log('✅ Usuário na tabela users:', user.id, user.role)
    
    // ETAPA 3: Validar permissões RH
    if (user.role !== 'RH') {
      throw new Error('Apenas usuários RH podem criar reports')
    }
    
    // ETAPA 4: Buscar dados da vaga
    const vaga = await getVagaData(reportData.vaga_id)
    console.log('✅ Vaga encontrada:', vaga.id)
    
    // ETAPA 5: Criar report usando cliente administrativo
    const report = await createReportRecord({
      ...reportData,
      reported_by: user.id,
      current_value: vaga[reportData.field_name] || 'Não informado'
    })
    
    console.log('🎉 Report criado com sucesso:', report.id)
    return report
    
  } catch (error) {
    console.error('❌ [REPORTS] Erro ao criar report:', error)
    throw error
  }
}

// =============================================
// 2. FUNÇÕES AUXILIARES
// =============================================

async function verifyAuthentication(userId: string) {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Usuário não autenticado')
  }
  
  if (user.id !== userId) {
    throw new Error('ID do usuário não corresponde à sessão')
  }
  
  return user
}

async function ensureUserExists(authUser: any): Promise<User> {
  // Tentar buscar usuário na tabela users
  const { data: existingUser, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()
  
  if (existingUser && !fetchError) {
    return existingUser
  }
  
  // Se não existe, criar usando dados do Auth
  console.log('⚠️ Usuário não encontrado na tabela users, criando...')
  
  const { data: newUser, error: createError } = await supabaseAdmin
    .from('users')
    .insert({
      id: authUser.id,
      email: authUser.email || 'usuario@exemplo.com',
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
      role: authUser.user_metadata?.role || 'RH',
      password_hash: '' // Não necessário com Supabase Auth
    })
    .select()
    .single()
  
  if (createError) {
    console.error('❌ Erro ao criar usuário:', createError)
    throw new Error(`Erro ao criar usuário: ${createError.message}`)
  }
  
  return newUser
}

async function getVagaData(vagaId: string) {
  const { data: vaga, error } = await supabaseAdmin
    .from('vagas')
    .select('*')
    .eq('id', vagaId)
    .single()
  
  if (error) {
    throw new Error(`Erro ao buscar vaga: ${error.message}`)
  }
  
  return vaga
}

async function createReportRecord(data: any) {
  const { data: report, error } = await supabaseAdmin
    .from('reports')
    .insert({
      vaga_id: data.vaga_id,
      reported_by: data.reported_by,
      assigned_to: data.assigned_to,
      field_name: data.field_name,
      current_value: data.current_value,
      suggested_changes: data.suggested_changes,
      status: 'pending'
    })
    .select('*')
    .single()
  
  if (error) {
    console.error('❌ Erro ao criar report:', error)
    throw new Error(`Erro ao criar report: ${error.message}`)
  }
  
  return report
}

// =============================================
// 3. FUNÇÕES PARA ADMINISTRADORES
// =============================================

export async function getReportsForAdmin(adminId: string): Promise<Report[]> {
  try {
    const { data: reports, error } = await supabaseAdmin
      .from('reports')
      .select(`
        *,
        vaga:vagas(*),
        reporter:users!reports_reported_by_fkey(*),
        assignee:users!reports_assigned_to_fkey(*)
      `)
      .eq('assigned_to', adminId)
      .order('created_at', { ascending: false })
    
    if (error) {
      throw new Error(`Erro ao buscar reports: ${error.message}`)
    }
    
    return reports || []
  } catch (error) {
    console.error('❌ Erro ao buscar reports para admin:', error)
    throw error
  }
}

export async function updateReportStatus(reportId: string, status: string, adminNotes?: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('reports')
      .update({
        status,
        admin_notes: adminNotes,
        updated_at: new Date().toISOString(),
        completed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', reportId)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Erro ao atualizar report: ${error.message}`)
    }
    
    return data
  } catch (error) {
    console.error('❌ Erro ao atualizar status do report:', error)
    throw error
  }
}

// =============================================
// 4. FUNÇÕES PARA BUSCAR ADMINS
// =============================================

export async function getAllAdmins(): Promise<User[]> {
  try {
    const { data: admins, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', 'ADMIN')
      .order('name')
    
    if (error) {
      throw new Error(`Erro ao buscar admins: ${error.message}`)
    }
    
    return admins || []
  } catch (error) {
    console.error('❌ Erro ao buscar admins:', error)
    throw error
  }
}

// =============================================
// 5. FUNÇÕES DE BUSCA GERAL
// =============================================

export async function getReportsByUser(userId: string, userRole: string): Promise<Report[]> {
  try {
    let query = supabaseAdmin.from('reports').select(`
      *,
      vaga:vagas(*),
      reporter:users!reports_reported_by_fkey(*),
      assignee:users!reports_assigned_to_fkey(*)
    `)
    
    if (userRole === 'ADMIN') {
      // Admins veem todos os reports
      query = query.order('created_at', { ascending: false })
    } else {
      // RH vê apenas seus próprios reports
      query = query.eq('reported_by', userId).order('created_at', { ascending: false })
    }
    
    const { data: reports, error } = await query
    
    if (error) {
      throw new Error(`Erro ao buscar reports: ${error.message}`)
    }
    
    return reports || []
  } catch (error) {
    console.error('❌ Erro ao buscar reports por usuário:', error)
    throw error
  }
}

export async function getPendingReportsForAdmin(adminId: string): Promise<Report[]> {
  try {
    const { data: reports, error } = await supabaseAdmin
      .from('reports')
      .select(`
        *,
        vaga:vagas(*),
        reporter:users!reports_reported_by_fkey(*)
      `)
      .eq('assigned_to', adminId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (error) {
      throw new Error(`Erro ao buscar reports pendentes: ${error.message}`)
    }
    
    return reports || []
  } catch (error) {
    console.error('❌ Erro ao buscar reports pendentes:', error)
    throw error
  }
}

export async function deleteReport(reportId: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('reports')
      .delete()
      .eq('id', reportId)
    
    if (error) {
      throw new Error(`Erro ao deletar report: ${error.message}`)
    }
  } catch (error) {
    console.error('❌ Erro ao deletar report:', error)
    throw error
  }
}