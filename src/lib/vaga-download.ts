// Utilitário para gerar downloads de informações de vagas
// Suporta diferentes formatos: TXT, JSON, PDF (futuro)

import { Vaga } from '../types/database'

export interface DownloadOptions {
  format: 'txt' | 'json' | 'pdf'
  includeMetadata?: boolean
  includeTimestamp?: boolean
}

export function generateVagaContent(vaga: Vaga, options: DownloadOptions): string {
  const timestamp = new Date().toLocaleString('pt-BR')
  
  switch (options.format) {
    case 'txt':
      return generateTextContent(vaga, options, timestamp)
    case 'json':
      return generateJsonContent(vaga, options, timestamp)
    default:
      return generateTextContent(vaga, options, timestamp)
  }
}

function generateTextContent(vaga: Vaga, options: DownloadOptions, timestamp: string): string {
  let content = ''
  
  if (options.includeTimestamp) {
    content += `Gerado em: ${timestamp}\n`
    content += '='.repeat(50) + '\n\n'
  }
  
  // Informações básicas
  content += `VAGA DE EMPREGO\n`
  content += '='.repeat(50) + '\n\n'
  
  content += `TÍTULO: ${vaga.titulo || vaga.cargo}\n`
  content += `CLIENTE: ${vaga.cliente}\n`
  content += `SITE: ${vaga.site}\n`
  content += `CATEGORIA: ${vaga.categoria}\n`
  content += `CARGO: ${vaga.cargo}\n`
  content += `CÉLULA: ${vaga.celula}\n\n`
  
  // Descrição da vaga
  if (vaga.descricao_vaga) {
    content += `DESCRIÇÃO DA VAGA:\n`
    content += '-'.repeat(30) + '\n'
    content += `${vaga.descricao_vaga}\n\n`
  }
  
  // Responsabilidades e atribuições
  if (vaga.responsabilidades_atribuicoes) {
    content += `RESPONSABILIDADES E ATRIBUIÇÕES:\n`
    content += '-'.repeat(30) + '\n'
    content += `${vaga.responsabilidades_atribuicoes}\n\n`
  }
  
  // Requisitos e qualificações
  if (vaga.requisitos_qualificacoes) {
    content += `REQUISITOS E QUALIFICAÇÕES:\n`
    content += '-'.repeat(30) + '\n'
    content += `${vaga.requisitos_qualificacoes}\n\n`
  }
  
  // Informações adicionais
  if (vaga.salario) {
    content += `SALÁRIO: ${vaga.salario}\n`
  }
  if (vaga.horario_trabalho) {
    content += `HORÁRIO DE TRABALHO: ${vaga.horario_trabalho}\n`
  }
  if (vaga.jornada_trabalho) {
    content += `JORNADA DE TRABALHO: ${vaga.jornada_trabalho}\n`
  }
  
  if (vaga.salario || vaga.horario_trabalho || vaga.jornada_trabalho) {
    content += '\n'
  }
  
  // Benefícios
  if (vaga.beneficios) {
    content += `BENEFÍCIOS:\n`
    content += '-'.repeat(30) + '\n'
    content += `${vaga.beneficios}\n\n`
  }
  
  // Local de trabalho
  if (vaga.local_trabalho) {
    content += `LOCAL DE TRABALHO:\n`
    content += '-'.repeat(30) + '\n'
    content += `${vaga.local_trabalho}\n\n`
  }
  
  // Etapas do processo
  if (vaga.etapas_processo) {
    content += `ETAPAS DO PROCESSO:\n`
    content += '-'.repeat(30) + '\n'
    content += `${vaga.etapas_processo}\n\n`
  }
  
  // Metadados (se solicitado)
  if (options.includeMetadata) {
    content += `METADADOS:\n`
    content += '-'.repeat(30) + '\n'
    content += `ID: ${vaga.id}\n`
    content += `Criado em: ${new Date(vaga.created_at).toLocaleString('pt-BR')}\n`
    content += `Atualizado em: ${new Date(vaga.updated_at).toLocaleString('pt-BR')}\n`
    if (vaga.created_by) {
      content += `Criado por: ${vaga.created_by}\n`
    }
    if (vaga.updated_by) {
      content += `Atualizado por: ${vaga.updated_by}\n`
    }
  }
  
  return content
}

function generateJsonContent(vaga: Vaga, options: DownloadOptions, timestamp: string): string {
  const data = {
    metadata: options.includeTimestamp ? {
      generatedAt: timestamp,
      generatedBy: 'Repositório de Vagas'
    } : undefined,
    vaga: {
      id: vaga.id,
      titulo: vaga.titulo,
      cliente: vaga.cliente,
      site: vaga.site,
      categoria: vaga.categoria,
      cargo: vaga.cargo,
      celula: vaga.celula,
      descricao_vaga: vaga.descricao_vaga,
      responsabilidades_atribuicoes: vaga.responsabilidades_atribuicoes,
      requisitos_qualificacoes: vaga.requisitos_qualificacoes,
      salario: vaga.salario,
      horario_trabalho: vaga.horario_trabalho,
      jornada_trabalho: vaga.jornada_trabalho,
      beneficios: vaga.beneficios,
      local_trabalho: vaga.local_trabalho,
      etapas_processo: vaga.etapas_processo,
      ...(options.includeMetadata && {
        created_at: vaga.created_at,
        updated_at: vaga.updated_at,
        created_by: vaga.created_by,
        updated_by: vaga.updated_by
      })
    }
  }
  
  return JSON.stringify(data, null, 2)
}

export function downloadVagaFile(vaga: Vaga, options: DownloadOptions = { format: 'txt', includeMetadata: true, includeTimestamp: true }): void {
  try {
    const content = generateVagaContent(vaga, options)
    const blob = new Blob([content], { 
      type: options.format === 'json' ? 'application/json' : 'text/plain;charset=utf-8' 
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Gerar nome do arquivo
    const sanitizedTitle = (vaga.titulo || vaga.cargo || 'vaga').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')
    const timestamp = new Date().toISOString().split('T')[0]
    link.download = `${sanitizedTitle}_${vaga.cliente}_${timestamp}.${options.format}`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    console.log(`📄 Arquivo ${options.format.toUpperCase()} baixado com sucesso: ${link.download}`)
  } catch (error) {
    console.error('Erro ao gerar download:', error)
    alert('Erro ao gerar arquivo de download')
  }
}

// Função para download rápido em formato TXT
export function downloadVagaAsText(vaga: Vaga): void {
  downloadVagaFile(vaga, { format: 'txt', includeMetadata: true, includeTimestamp: true })
}

// Função para download rápido em formato JSON
export function downloadVagaAsJson(vaga: Vaga): void {
  downloadVagaFile(vaga, { format: 'json', includeMetadata: true, includeTimestamp: true })
}
