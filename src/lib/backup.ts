import { supabase } from './supabase'
import { BackupLog, BackupOptions } from '../types/database'
import { filterVisibleUsers, filterBackupData, filterExcelSheet, filterCSVContent } from './user-filter'
import * as ExcelJS from 'exceljs'

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
  const workbook = new ExcelJS.Workbook()

  // Adicionar planilha de vagas
  if (data.vagas && data.vagas.length > 0) {
    const worksheet = workbook.addWorksheet('Vagas')
    worksheet.addRows(data.vagas)
  }

  // Adicionar planilha de usuários (já filtrada)
  if (data.users && data.users.length > 0) {
    const filteredUsers = filterExcelSheet(data.users, 'Usuários')
    if (filteredUsers.length > 0) {
      const worksheet = workbook.addWorksheet('Usuários')
      worksheet.addRows(filteredUsers)
    }
  }

  // Adicionar planilha de logs de backup
  if (data.backup_logs && data.backup_logs.length > 0) {
    const worksheet = workbook.addWorksheet('Logs de Backup')
    worksheet.addRows(data.backup_logs)
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

// Função auxiliar para converter JSON para CSV
function jsonToCSV(data: any[]): string {
  if (!data || data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(',')
  
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header]
      // Escapar valores que contêm vírgulas ou aspas
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value || ''
    }).join(',')
  )
  
  return [csvHeaders, ...csvRows].join('\n')
}

// Função para gerar backup em CSV
async function generateCSVBackup(data: any): Promise<string> {
  let csvContent = ''

  // Adicionar vagas
  if (data.vagas && data.vagas.length > 0) {
    csvContent += '=== VAGAS ===\n'
    csvContent += jsonToCSV(data.vagas)
    csvContent += '\n\n'
  }

  // Adicionar usuários (filtrados)
  if (data.users && data.users.length > 0) {
    const filteredUsers = filterExcelSheet(data.users, 'Usuários')
    if (filteredUsers.length > 0) {
      csvContent += '=== USUÁRIOS ===\n'
      csvContent += jsonToCSV(filteredUsers)
      csvContent += '\n\n'
    }
  }

  // Adicionar logs de backup
  if (data.backup_logs && data.backup_logs.length > 0) {
    csvContent += '=== LOGS DE BACKUP ===\n'
    csvContent += jsonToCSV(data.backup_logs)
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
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Dados')
    worksheet.addRows(data)
    
    const buffer = await workbook.xlsx.writeBuffer()
    
    // Criar blob e fazer download
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
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
