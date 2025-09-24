import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Vaga } from '../types/database'
import { 
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { useThemeClasses } from '../hooks/useThemeClasses'
import VagaSection from './VagaSection'

interface VagaTemplateProps {
  vaga: Vaga
  onEdit?: () => void
  onDelete?: () => void
  onFocus?: () => void
  showActions?: boolean
  variantIndex?: number
}

export default function VagaTemplate({ vaga, onEdit, onDelete, onFocus, showActions = false, variantIndex = 0 }: VagaTemplateProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { textClasses, cardClasses, getCardVariant } = useThemeClasses()

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <Card className={`${cardClasses.base} ${getCardVariant(variantIndex)} dark:${getCardVariant(variantIndex)}`}>
      {/* Header do Card */}
      <CardHeader 
        className={cardClasses.header}
        onClick={toggleExpansion}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className={`${textClasses.heading} mb-1`}>
              {vaga.titulo || vaga.cargo} - {vaga.cliente}
            </CardTitle>
            <CardDescription className={`text-lg ${textClasses.accent} font-semibold`}>
              {vaga.celula}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {showActions && (
              <>
                {onFocus && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      onFocus()
                    }}
                    className="flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                  >
                    <Eye className="h-4 w-4" />
                    Focar
                  </Button>
                )}
                {onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit()
                    }}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                )}
                {onDelete && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete()
                    }}
                    className="text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                )}
              </>
            )}
            {isExpanded ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
          </div>
        </div>
      </CardHeader>

      {/* Conteúdo Expansível - Layout com todos os 9 campos obrigatórios */}
      {isExpanded && (
        <CardContent className="space-y-8">
        {/* Descrição da vaga */}
        <VagaSection title="Descrição da vaga" content={vaga.descricao_vaga} />

        {/* Responsabilidades e atribuições */}
        <VagaSection title="Responsabilidades e atribuições" content={vaga.responsabilidades_atribuicoes} />

        {/* Requisitos e qualificações */}
        <VagaSection title="Requisitos e qualificações" content={vaga.requisitos_qualificacoes} />

        {/* Salário */}
        <VagaSection title="Salário">
          {vaga.salario ? (
            <p><strong>{vaga.salario}</strong></p>
          ) : null}
        </VagaSection>

        {/* Horário de Trabalho */}
        <VagaSection title="Horário de Trabalho" content={vaga.horario_trabalho} />

        {/* Jornada de Trabalho */}
        <VagaSection title="Jornada de Trabalho" content={vaga.jornada_trabalho} />

        {/* Benefícios */}
        <VagaSection title="Benefícios">
          {vaga.beneficios ? (
            <div className="space-y-2">
              {vaga.beneficios.split(';').map((beneficio, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-gray-400 dark:text-contrast-muted mr-2 mt-1">•</span>
                  <span>{beneficio.trim()}</span>
                </div>
              ))}
            </div>
          ) : null}
        </VagaSection>

        {/* Local de Trabalho */}
        <VagaSection title="Local de Trabalho" content={vaga.local_trabalho} />

        {/* Etapas do processo */}
        <VagaSection title="Etapas do processo">
          {vaga.etapas_processo ? (
            <div className="space-y-3">
              {vaga.etapas_processo.split('\n').filter(etapa => etapa.trim()).map((etapa, index) => {
                // Remove "Etapa X:" do texto, mantendo apenas o conteúdo da etapa
                const cleanEtapa = etapa.trim().replace(/^Etapa\s+\d+:\s*/i, '')
                return (
                  <div key={index} className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-800 dark:bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <span>{cleanEtapa}</span>
                  </div>
                )
              })}
            </div>
          ) : null}
        </VagaSection>
        </CardContent>
      )}
    </Card>
  )
}