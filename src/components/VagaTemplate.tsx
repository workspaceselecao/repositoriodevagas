import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Vaga } from '../types/database'
import { 
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2
} from 'lucide-react'

interface VagaTemplateProps {
  vaga: Vaga
  onEdit?: () => void
  onDelete?: () => void
  showActions?: boolean
}

export default function VagaTemplate({ vaga, onEdit, onDelete, showActions = false }: VagaTemplateProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      {/* Header do Card */}
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={toggleExpansion}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-gray-900 mb-1">
              {vaga.cargo} - {vaga.cliente}
            </CardTitle>
            <CardDescription className="text-lg text-blue-600 font-semibold">
              {vaga.produto}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {showActions && (
              <>
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
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
              Descrição da vaga
            </h2>
            <div className="text-gray-700 leading-relaxed">
              {vaga.descricao_vaga ? (
                <div dangerouslySetInnerHTML={{ __html: vaga.descricao_vaga }} />
              ) : (
                <p className="text-gray-500 italic">Informação não disponível</p>
              )}
            </div>
          </div>

          {/* Responsabilidades e atribuições */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
              Responsabilidades e atribuições
            </h2>
            <div className="text-gray-700 leading-relaxed">
              {vaga.responsabilidades_atribuicoes ? (
                <div dangerouslySetInnerHTML={{ __html: vaga.responsabilidades_atribuicoes }} />
              ) : (
                <p className="text-gray-500 italic">Informação não disponível</p>
              )}
            </div>
          </div>

          {/* Requisitos e qualificações */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
              Requisitos e qualificações
            </h2>
            <div className="text-gray-700 leading-relaxed">
              {vaga.requisitos_qualificacoes ? (
                <div dangerouslySetInnerHTML={{ __html: vaga.requisitos_qualificacoes }} />
              ) : (
                <p className="text-gray-500 italic">Informação não disponível</p>
              )}
            </div>
          </div>

          {/* Salário */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
              Salário
            </h2>
            <div className="text-gray-700 leading-relaxed">
              {vaga.salario ? (
                <p><strong>{vaga.salario}</strong></p>
              ) : (
                <p className="text-gray-500 italic">Informação não disponível</p>
              )}
            </div>
          </div>

          {/* Horário de Trabalho */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
              Horário de Trabalho
            </h2>
            <div className="text-gray-700 leading-relaxed">
              {vaga.horario_trabalho ? (
                <p>{vaga.horario_trabalho}</p>
              ) : (
                <p className="text-gray-500 italic">Informação não disponível</p>
              )}
            </div>
          </div>

          {/* Jornada de Trabalho */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
              Jornada de Trabalho
            </h2>
            <div className="text-gray-700 leading-relaxed">
              {vaga.jornada_trabalho ? (
                <p>{vaga.jornada_trabalho}</p>
              ) : (
                <p className="text-gray-500 italic">Informação não disponível</p>
              )}
            </div>
          </div>

          {/* Benefícios */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
              Benefícios
            </h2>
            <div className="text-gray-700 leading-relaxed">
              {vaga.beneficios ? (
                <div className="space-y-2">
                  {vaga.beneficios.split(';').map((beneficio, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-gray-400 mr-2 mt-1">•</span>
                      <span>{beneficio.trim()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Informação não disponível</p>
              )}
            </div>
          </div>

          {/* Local de Trabalho */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
              Local de Trabalho
            </h2>
            <div className="text-gray-700 leading-relaxed">
              {vaga.local_trabalho ? (
                <p>{vaga.local_trabalho}</p>
              ) : (
                <p className="text-gray-500 italic">Informação não disponível</p>
              )}
            </div>
          </div>

          {/* Etapas do processo */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
              Etapas do processo
            </h2>
            <div className="text-gray-700 leading-relaxed">
              {vaga.etapas_processo ? (
                <div className="space-y-3">
                  {vaga.etapas_processo.split('\n').filter(etapa => etapa.trim()).map((etapa, index) => (
                    <div key={index} className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {index + 1}
                      </div>
                      <span>{etapa.trim()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Informação não disponível</p>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}