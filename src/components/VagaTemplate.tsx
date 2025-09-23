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

      {/* Conteúdo Expansível - Layout exato do HTML fornecido */}
      {isExpanded && (
        <CardContent className="space-y-8">
          {/* Descrição da vaga */}
          {vaga.descricao_vaga && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                Descrição da vaga
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: vaga.descricao_vaga }} />
              </div>
            </div>
          )}

          {/* Responsabilidades e atribuições */}
          {vaga.responsabilidades_atribuicoes && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                Responsabilidades e atribuições
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: vaga.responsabilidades_atribuicoes }} />
              </div>
            </div>
          )}

          {/* Requisitos e qualificações */}
          {vaga.requisitos_qualificacoes && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                Requisitos e qualificações
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: vaga.requisitos_qualificacoes }} />
              </div>
            </div>
          )}

          {/* Informações adicionais */}
          {(vaga.salario || vaga.horario_trabalho || vaga.jornada_trabalho || vaga.beneficios || vaga.local_trabalho) && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                Informações adicionais
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-4">
                {vaga.salario && (
                  <div>
                    <p><strong>Salário: {vaga.salario}</strong></p>
                  </div>
                )}
                
                {vaga.horario_trabalho && (
                  <div>
                    <p><strong>Horário de Trabalho</strong></p>
                    <ul className="list-disc pl-6 mt-2">
                      <li>{vaga.horario_trabalho}</li>
                    </ul>
                  </div>
                )}
                
                {vaga.jornada_trabalho && (
                  <div>
                    <p><strong>Jornada de Trabalho</strong></p>
                    <p>{vaga.jornada_trabalho}</p>
                  </div>
                )}
                
                {vaga.beneficios && (
                  <div>
                    <p><strong>Benefícios</strong></p>
                    <div dangerouslySetInnerHTML={{ __html: vaga.beneficios }} />
                  </div>
                )}
                
                {vaga.local_trabalho && (
                  <div>
                    <p><strong>Local de trabalho:</strong> {vaga.local_trabalho}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Etapas do processo */}
          {vaga.etapas_processo && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                Etapas do processo
              </h2>
              <div className="text-gray-700">
                <div dangerouslySetInnerHTML={{ __html: vaga.etapas_processo }} />
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}