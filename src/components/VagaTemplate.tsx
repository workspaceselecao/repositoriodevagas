import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Vaga } from '../types/database'
import { 
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Eye,
  Download
} from 'lucide-react'
import { useThemeClasses } from '../hooks/useThemeClasses'
import VagaSection from './VagaSection'
import { downloadVagaAsText } from '../lib/vaga-download'

interface VagaTemplateProps {
  vaga: Vaga
  onEdit?: () => void
  onDelete?: () => void
  onFocus?: () => void
  showActions?: boolean
  variantIndex?: number
  isExpanded?: boolean
}

export default function VagaTemplate({ vaga, onEdit, onDelete, onFocus, showActions = false, variantIndex = 0, isExpanded: isExpandedProp }: VagaTemplateProps) {
  const [isExpandedInternal, setIsExpandedInternal] = useState(false)
  const isExpanded = isExpandedProp !== undefined ? isExpandedProp : isExpandedInternal
  const { textClasses, cardClasses, getCardVariant } = useThemeClasses()

  const toggleExpansion = () => {
    if (isExpandedProp !== undefined) {
      // Se isExpanded é controlado externamente, não fazemos nada
      return
    }
    setIsExpandedInternal(!isExpandedInternal)
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    downloadVagaAsText(vaga)
  }

  return (
    <Card className={`${cardClasses.base} ${getCardVariant(variantIndex)} dark:${getCardVariant(variantIndex)} group`}>
      {/* Header do Card */}
      <CardHeader 
        className={cardClasses.header}
        onClick={toggleExpansion}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className={`${textClasses.heading} mb-1 text-sm md:text-base`}>
              {vaga.titulo || vaga.cargo} - {vaga.cliente}
            </CardTitle>
            <CardDescription className={`text-sm md:text-lg ${textClasses.accent} font-semibold`}>
              {vaga.celula}
            </CardDescription>
          </div>
          <div className="flex items-center justify-between lg:justify-end gap-2">
            {showActions && (
              <div className="flex items-center gap-1">
                {onFocus && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      onFocus()
                    }}
                    className="flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 transition-all duration-200 hover:scale-105"
                  >
                    <Eye className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Focar</span>
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
                    className="flex items-center gap-1 transition-all duration-200 hover:scale-105"
                  >
                    <Edit className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Editar</span>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownload}
                  className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 transition-all duration-200 hover:scale-105"
                >
                  <Download className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
                {onDelete && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete()
                    }}
                    className="text-red-600 hover:text-red-700 flex items-center gap-1 transition-all duration-200 hover:scale-105"
                  >
                    <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Excluir</span>
                  </Button>
                )}
              </div>
            )}
            <div className="transition-transform duration-200 group-hover:scale-110">
              {isExpanded ? <ChevronUp className="h-5 w-5 md:h-6 md:w-6" /> : <ChevronDown className="h-5 w-5 md:h-6 md:w-6" />}
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Conteúdo Expansível - Layout com todos os 9 campos obrigatórios */}
      {isExpanded && (
        <CardContent className="space-y-8 animate-in slide-in-from-top-2 duration-300">
        {/* Descrição da vaga */}
        <VagaSection title="Descrição da vaga" content={vaga.descricao_vaga} />

        {/* Responsabilidades e atribuições */}
        <VagaSection title="Responsabilidades e atribuições" content={vaga.responsabilidades_atribuicoes} />

        {/* Requisitos e qualificações */}
        <VagaSection title="Requisitos e qualificações" content={vaga.requisitos_qualificacoes} />

        {/* Salário */}
        <VagaSection title="Salário">
          {vaga.salario ? (
            <p className={`${textClasses.primary}`}><strong>{vaga.salario}</strong></p>
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
                  <span className={`${textClasses.primary} mr-2 mt-1`}>•</span>
                  <span className={`${textClasses.primary}`}>{beneficio.trim()}</span>
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
                    <span className={`${textClasses.primary}`}>{cleanEtapa}</span>
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