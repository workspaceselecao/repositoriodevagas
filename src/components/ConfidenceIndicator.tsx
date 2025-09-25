import React from 'react'
import { FieldConfidence } from '../lib/enhanced-scraping'

interface ConfidenceIndicatorProps {
  confidence: number
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
}

interface FieldConfidenceIndicatorProps {
  extractedFields: FieldConfidence
}

export function ConfidenceIndicator({ confidence, size = 'md', showPercentage = true }: ConfidenceIndicatorProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30'
    if (confidence >= 40) return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30'
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return '🟢'
    if (confidence >= 60) return '🟡'
    if (confidence >= 40) return '🟠'
    return '🔴'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'Excelente'
    if (confidence >= 60) return 'Boa'
    if (confidence >= 40) return 'Regular'
    return 'Baixa'
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  return (
    <div className={`inline-flex items-center space-x-2 rounded-full ${getConfidenceColor(confidence)} ${sizeClasses[size]}`}>
      <span className="text-sm">{getConfidenceIcon(confidence)}</span>
      <span className="font-medium">{getConfidenceLabel(confidence)}</span>
      {showPercentage && (
        <span className="font-bold">{confidence}%</span>
      )}
    </div>
  )
}

export function FieldConfidenceIndicator({ extractedFields }: FieldConfidenceIndicatorProps) {
  const fields = Object.entries(extractedFields) as [keyof FieldConfidence, any][]
  const totalFields = fields.length
  const foundFields = fields.filter(([, field]) => field.found).length
  const avgConfidence = Math.round(
    fields.reduce((sum, [, field]) => sum + field.confidence, 0) / totalFields
  )

  const getFieldLabel = (fieldName: string) => {
    const labels: Record<string, string> = {
      titulo: 'Título',
      descricao_vaga: 'Descrição',
      responsabilidades_atribuicoes: 'Responsabilidades',
      requisitos_qualificacoes: 'Requisitos',
      salario: 'Salário',
      horario_trabalho: 'Horário',
      jornada_trabalho: 'Jornada',
      beneficios: 'Benefícios',
      local_trabalho: 'Local',
      etapas_processo: 'Etapas'
    }
    return labels[fieldName] || fieldName
  }

  const getFieldIcon = (field: any) => {
    if (field.found) {
      if (field.confidence >= 80) return '✅'
      if (field.confidence >= 60) return '⚠️'
      return '❌'
    }
    return '❓'
  }

  return (
    <div className="space-y-4">
      {/* Resumo Geral */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Resumo da Extração</h3>
          <ConfidenceIndicator confidence={avgConfidence} />
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-900 dark:text-gray-100">Campos encontrados:</span>
            <span className="ml-2 text-blue-600 dark:text-blue-400">{foundFields}/{totalFields}</span>
          </div>
          <div>
            <span className="font-medium text-gray-900 dark:text-gray-100">Assertividade média:</span>
            <span className="ml-2 text-blue-600 dark:text-blue-400">{avgConfidence}%</span>
          </div>
        </div>
      </div>

      {/* Detalhamento por Campo */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">Detalhamento por Campo</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {fields.map(([fieldName, field]) => (
            <div
              key={fieldName}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                field.found ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getFieldIcon(field)}</span>
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{getFieldLabel(fieldName)}</span>
              </div>
              <div className="flex items-center space-x-2">
                {field.found && (
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                    {field.confidence}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Barra de Progresso Visual */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Progresso da Extração</span>
          <span>{foundFields}/{totalFields} campos</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${(foundFields / totalFields) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export function ConfidenceBar({ confidence, className = '' }: { confidence: number; className?: string }) {
  const getColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500'
    if (confidence >= 60) return 'bg-yellow-500'
    if (confidence >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className={`h-2 rounded-full transition-all duration-500 ${getColor(confidence)}`}
        style={{ width: `${confidence}%` }}
      />
    </div>
  )
}

export function ConfidenceBadge({ confidence, showIcon = true }: { confidence: number; showIcon?: boolean }) {
  const getBadgeConfig = (confidence: number) => {
    if (confidence >= 80) {
      return { 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '🟢',
        label: 'Excelente'
      }
    }
    if (confidence >= 60) {
      return { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '🟡',
        label: 'Boa'
      }
    }
    if (confidence >= 40) {
      return { 
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: '🟠',
        label: 'Regular'
      }
    }
    return { 
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: '🔴',
      label: 'Baixa'
    }
  }

  const config = getBadgeConfig(confidence)

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {config.label} ({confidence}%)
    </span>
  )
}
