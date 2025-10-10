import { supabase, getSupabaseAdmin } from './supabase'
import { Report, ReportFormData, User, Vaga } from '../types/database'
import { filterVisibleUsers } from './user-filter'

// =============================================
// SISTEMA SIMPLIFICADO DE REPORTS
// =============================================

// Função para filtrar relatórios que contenham referências ao administrador oculto
function filterReportsWithHiddenAdmin(reports: any[]): any[] {
  return reports.filter(report => {
    // Verificar se o reporter é o administrador oculto
    if (report.reporter?.email === 'robgomez.sir@live.com') {
      return false
    }
    
    // Verificar se o assignee é o administrador oculto
    if (report.assignee?.email === 'robgomez.sir@live.com') {
      return false
    }
    
    return true
  })
}

/**
 * ARQUITETURA SIMPLIFICADA:
 * 1. RH cria report → ADMIN recebe notificação
 * 2. ADMIN edita vaga baseada no report
 * 3. Sistema de comunicação em tempo real
 * 
 * PRINCÍPIOS:
 * - Usar sempre getSupabaseAdmin() para operações críticas
 * - Validação mínima de autenticação
 * - Foco na funcionalidade, não na complexidade
 */

// =============================================
// 1. FUNÇÃO PRINCIPAL: CRIAR REPORT
// =============================================

export async function createReport(reportData: ReportFormData): Promise<Report | null> {
  try {
    console.log('📝 Criando report:', { reportData })

    // 1. Verificar se o usuário está autenticado no Supabase Auth
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      console.error('❌ Usuário não autenticado:', authError)
      throw new Error('Usuário não autenticado')
    }

    // 2. Buscar o ID correto na tabela users baseado no email do Auth
    const { data: userData, error: userError } = await getSupabaseAdmin()
      .from('users')
      .select('id, email, role')
      .eq('email', authUser.email)
      .single()

    if (userError || !userData) {
      console.error('❌ Usuário não encontrado na tabela users:', userError)
      throw new Error('Usuário não encontrado na tabela users')
    }

    console.log('👤 Usuário encontrado na tabela users:', userData)

    // Usar o ID da tabela users em vez do Auth ID
    const correctUserId = userData.id

    // 2. Buscar dados da vaga usando cliente administrativo
    const { data: vagaData, error: vagaError } = await getSupabaseAdmin()
      .from('vagas')
      .select('*')
      .eq('id', reportData.vaga_id)
      .single()

    if (vagaError) {
      console.error('❌ Erro ao buscar vaga:', vagaError)
      throw new Error(`Erro ao buscar vaga: ${vagaError.message}`)
    }

    const currentValue = (vagaData as any)[reportData.field_name] || 'Não informado'
    console.log('📋 Valor atual:', currentValue)

    // 3. Criar o report usando cliente administrativo (bypass RLS)
    const { data, error } = await getSupabaseAdmin()
      .from('reports')
      .insert({
        vaga_id: reportData.vaga_id,
        reported_by: correctUserId, // Usar o ID correto da tabela users
        assigned_to: reportData.assigned_to,
        field_name: reportData.field_name,
        current_value: currentValue,
        suggested_changes: reportData.suggested_changes,
        status: 'pending'
      })
      .select('*')
      .single()

    if (error) {
      console.error('❌ Erro ao criar report:', error)
      throw error
    }

    console.log('✅ Report criado com sucesso:', data)
    
    // Verificar se o report foi realmente salvo
    const { data: verification, error: verifyError } = await getSupabaseAdmin()
      .from('reports')
      .select('*')
      .eq('id', data.id)
      .single()
    
    if (verifyError) {
      console.error('⚠️ Erro ao verificar report criado:', verifyError)
    } else {
      console.log('✅ Report verificado no banco:', verification)
    }
    
    return data

  } catch (error) {
    console.error('❌ Erro ao criar report:', error)
    throw error
  }
}

// =============================================
// 2. FUNÇÕES DE BUSCA
// =============================================

export async function getReportById(reportId: string): Promise<Report | null> {
  try {
    const { data: report, error } = await getSupabaseAdmin()
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
      if (error.code === 'PGRST116') {
        return null // Report não encontrado
      }
      throw new Error(`Erro ao buscar report: ${error.message}`)
    }
    
    return report
  } catch (error) {
    console.error('❌ Erro ao buscar report por ID:', error)
    throw error
  }
}

export async function getReportsByUser(userId: string, userRole: string): Promise<Report[]> {
  try {
    console.log('🔍 [getReportsByUser] Buscando reports para:', { userId, userRole })
    
    // Primeiro, verificar se há reports na tabela geral
    const { data: allReports, error: allError } = await getSupabaseAdmin()
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    console.log('🔍 [getReportsByUser] Total de reports na tabela:', allReports?.length || 0)
    if (allReports && allReports.length > 0) {
      console.log('📋 [getReportsByUser] Últimos reports na tabela:', allReports.map((r: any) => ({
        id: r.id,
        reported_by: r.reported_by,
        status: r.status,
        created_at: r.created_at
      })))
    }
    
    let query = getSupabaseAdmin().from('reports').select(`
      *,
      vaga:vagas(*),
      reporter:users!reports_reported_by_fkey(*),
      assignee:users!reports_assigned_to_fkey(*)
    `)

    if (userRole === 'RH') {
      query = query.eq('reported_by', userId)
      console.log('🔍 [getReportsByUser] Aplicando filtro RH para reported_by:', userId)
      
      // Verificar se há reports para este usuário específico
      const { data: userReports, error: userError } = await getSupabaseAdmin()
        .from('reports')
        .select('*')
        .eq('reported_by', userId)
        .order('created_at', { ascending: false })
      
      console.log('🔍 [getReportsByUser] Reports diretos para usuário:', userReports?.length || 0)
      if (userReports && userReports.length > 0) {
        console.log('📋 [getReportsByUser] Reports do usuário:', userReports.map((r: any) => ({
          id: r.id,
          status: r.status,
          created_at: r.created_at,
          field_name: r.field_name
        })))
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('❌ [getReportsByUser] Erro ao buscar reports:', error)
      console.error('❌ [getReportsByUser] Detalhes do erro:', error.code, error.message, error.details)
      throw error
    }

    console.log('✅ [getReportsByUser] Reports encontrados:', data?.length || 0)
    console.log('📊 [getReportsByUser] Dados dos reports:', data)
    
    // Filtrar relatórios que contenham referências ao administrador oculto
    const filteredReports = filterReportsWithHiddenAdmin(data || [])
    
    return filteredReports
  } catch (error) {
    console.error('❌ [getReportsByUser] Erro detalhado ao buscar reports:', error)
    throw error
  }
}

export async function getPendingReportsForAdmin(adminId: string): Promise<Report[]> {
  try {
    const { data, error } = await getSupabaseAdmin()
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

    // Filtrar relatórios que contenham referências ao administrador oculto
    const filteredReports = filterReportsWithHiddenAdmin(data || [])
    
    return filteredReports
  } catch (error) {
    console.error('Erro detalhado ao buscar reports pendentes:', error)
    throw error
  }
}

// =============================================
// 3. FUNÇÕES DE ATUALIZAÇÃO
// =============================================

export async function updateReportStatus(reportId: string, status: Report['status'], adminNotes?: string): Promise<Report | null> {
  try {
    const updateData: Partial<Report> = { status, updated_at: new Date().toISOString() }
    if (adminNotes) {
      updateData.admin_notes = adminNotes
    }
    if (status === 'completed' || status === 'rejected') {
      updateData.completed_at = new Date().toISOString()
    }

    const { data, error } = await getSupabaseAdmin()
      .from('reports')
      .update(updateData)
      .eq('id', reportId)
      .select()
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

export async function deleteReport(reportId: string): Promise<boolean> {
  try {
    console.log('🗑️ [deleteReport] Deletando report:', reportId)
    
    const { error } = await getSupabaseAdmin()
      .from('reports')
      .delete()
      .eq('id', reportId)

    if (error) {
      console.error('❌ [deleteReport] Erro ao deletar report:', error)
      throw error
    }

    console.log('✅ [deleteReport] Report deletado com sucesso')
    return true
  } catch (error) {
    console.error('❌ [deleteReport] Erro detalhado ao deletar report:', error)
    throw error
  }
}

// =============================================
// 4. FUNÇÕES AUXILIARES
// =============================================

export async function getAllAdmins(): Promise<User[]> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('users')
      .select('id, name, email')
      .eq('role', 'ADMIN')

    if (error) {
      console.error('Erro ao buscar administradores:', error)
      throw error
    }

    // Filtrar administrador oculto da lista de administradores
    const filteredAdmins = filterVisibleUsers(data || []) as User[]
    
    return filteredAdmins
  } catch (error) {
    console.error('Erro detalhado ao buscar administradores:', error)
    throw error
  }
}

// =============================================
// 5. FUNÇÕES DE NOTIFICAÇÃO EM TEMPO REAL
// =============================================

export async function getReportsForRealtime(adminId: string): Promise<Report[]> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('reports')
      .select(`
        id,
        vaga_id,
        field_name,
        status,
        created_at,
        vaga:vagas(titulo, cliente, cargo),
        reporter:users!reports_reported_by_fkey(name, email)
      `)
      .eq('assigned_to', adminId)
      .in('status', ['pending', 'in_progress'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar reports para realtime:', error)
      throw error
    }

    // Filtrar relatórios que contenham referências ao administrador oculto
    const filteredReports = filterReportsWithHiddenAdmin(data || [])
    
    return filteredReports
  } catch (error) {
    console.error('Erro detalhado ao buscar reports para realtime:', error)
    throw error
  }
}