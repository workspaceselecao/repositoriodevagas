import { supabase } from './supabase'
import { BackupLog, BackupOptions } from '../types/database'
import { filterVisibleUsers, filterBackupData, filterExcelSheet, filterCSVContent } from './user-filter'
import * as XLSX from 'xlsx'

// Função para fazer backup manual
export async function createManualBackup(userId: string, options: BackupOptions): Promise<BackupLog | null> {
  try {
    // Criar log de backup
    const { data: backupLog, error: logError } = await supabase
      .from('backup_logs')
      .insert({
        backup_type: 'manual',
        status: 'pending',
        created_by: userId
      })
      .select()
      .single()

    if (logError) {
      throw new Error(logError.message)
    }

    // Coletar dados baseado nas opções
    const backupData: any = {}

    if (options.data?.vagas) {
      const { data: vagas, error: vagasError } = await supabase
        .from('vagas')
        .select('*')

      if (vagasError) {
        throw new Error(vagasError.message)
      }
      backupData.vagas = vagas
    }

    if (options.data?.users) {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')

      if (usersError) {
        throw new Error(usersError.message)
      }
      // Filtrar usuários ocultos
      backupData.users = filterVisibleUsers(users || [])
    }

    if (options.data?.backup_logs) {
      const { data: logs, error: logsError } = await supabase
        .from('backup_logs')
        .select('*')

      if (logsError) {
        throw new Error(logsError.message)
      }
      backupData.backup_logs = logs
    }

    // Filtrar dados do backup para remover administrador oculto
    const filteredBackupData = filterBackupData(backupData)

    // Gerar arquivo baseado no formato
    let fileName = ''
    let fileData: any = null

    if (options.format === 'excel') {
      fileName = `backup_${new Date().toISOString().split('T')[0]}.xlsx`
      fileData = await generateExcelBackup(filteredBackupData)
    } else if (options.format === 'csv') {
      fileName = `backup_${new Date().toISOString().split('T')[0]}.csv`
      fileData = await generateCSVBackup(filteredBackupData)
    } else {
      fileName = `backup_${new Date().toISOString().split('T')[0]}.json`
      fileData = JSON.stringify(filteredBackupData, null, 2)
    }

    // Atualizar log de backup com sucesso
    const { error: updateError } = await supabase
      .from('backup_logs')
      .update({
        backup_data: filteredBackupData,
        file_path: fileName,
        status: 'success'
      })
      .eq('id', backupLog.id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    return {
      ...backupLog,
      backup_data: filteredBackupData,
      file_path: fileName,
      status: 'success'
    }
  } catch (error) {
    console.error('Erro ao criar backup manual:', error)
    return null
  }
}

// Função para gerar backup em Excel
async function generateExcelBackup(data: any): Promise<Buffer> {
  const workbook = XLSX.utils.book_new()

  // Adicionar planilha de vagas
  if (data.vagas && data.vagas.length > 0) {
    const vagasSheet = XLSX.utils.json_to_sheet(data.vagas)
    XLSX.utils.book_append_sheet(workbook, vagasSheet, 'Vagas')
  }

  // Adicionar planilha de usuários (já filtrada)
  if (data.users && data.users.length > 0) {
    const filteredUsers = filterExcelSheet(data.users, 'Usuários')
    if (filteredUsers.length > 0) {
      const usersSheet = XLSX.utils.json_to_sheet(filteredUsers)
      XLSX.utils.book_append_sheet(workbook, usersSheet, 'Usuários')
    }
  }

  // Adicionar planilha de logs de backup
  if (data.backup_logs && data.backup_logs.length > 0) {
    const logsSheet = XLSX.utils.json_to_sheet(data.backup_logs)
    XLSX.utils.book_append_sheet(workbook, logsSheet, 'Logs de Backup')
  }

  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  return excelBuffer
}

// Função para gerar backup em CSV
async function generateCSVBackup(data: any): Promise<string> {
  let csvContent = ''

  // Adicionar vagas
  if (data.vagas && data.vagas.length > 0) {
    csvContent += '=== VAGAS ===\n'
    csvContent += XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(data.vagas))
    csvContent += '\n\n'
  }

  // Adicionar usuários (filtrados)
  if (data.users && data.users.length > 0) {
    const filteredUsers = filterExcelSheet(data.users, 'Usuários')
    if (filteredUsers.length > 0) {
      csvContent += '=== USUÁRIOS ===\n'
      csvContent += XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(filteredUsers))
      csvContent += '\n\n'
    }
  }

  // Adicionar logs de backup
  if (data.backup_logs && data.backup_logs.length > 0) {
    csvContent += '=== LOGS DE BACKUP ===\n'
    csvContent += XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(data.backup_logs))
  }

  return csvContent
}

// Função para fazer backup automático
export async function createAutomaticBackup(): Promise<BackupLog | null> {
  try {
    // Criar log de backup automático
    const { data: backupLog, error: logError } = await supabase
      .from('backup_logs')
      .insert({
        backup_type: 'automatic',
        status: 'pending'
      })
      .select()
      .single()

    if (logError) {
      throw new Error(logError.message)
    }

    // Coletar todos os dados
    const { data: vagas, error: vagasError } = await supabase
      .from('vagas')
      .select('*')

    if (vagasError) {
      throw new Error(vagasError.message)
    }

    const backupData = {
      vagas,
      timestamp: new Date().toISOString()
    }

    // Atualizar log de backup com sucesso
    const { error: updateError } = await supabase
      .from('backup_logs')
      .update({
        backup_data: backupData,
        status: 'success'
      })
      .eq('id', backupLog.id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    return {
      ...backupLog,
      backup_data: backupData,
      status: 'success'
    }
  } catch (error) {
    console.error('Erro ao criar backup automático:', error)
    return null
  }
}

// Função para exportar dados para Excel
export async function exportToExcel(data: any[], fileName: string): Promise<void> {
  try {
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados')
    
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    
    // Criar blob e fazer download
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error)
  }
}

// Função para buscar logs de backup
export async function getBackupLogs(): Promise<BackupLog[]> {
  try {
    const { data: logs, error } = await supabase
      .from('backup_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return logs || []
  } catch (error) {
    console.error('Erro ao buscar logs de backup:', error)
    return []
  }
}
