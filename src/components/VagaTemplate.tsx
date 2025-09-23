import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Vaga } from '../types/database'
import { 
  ChevronDown,
  ChevronUp,
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar,
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
              {vaga.cliente}
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

      {/* Conteúdo Expansível */}
      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {vaga.salario && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Salário</p>
                  <p className="font-semibold text-green-700">{vaga.salario}</p>
                </div>
              </div>
            )}
            
            {vaga.horario_trabalho && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Horário</p>
                  <p className="font-semibold text-blue-700">{vaga.horario_trabalho}</p>
                </div>
              </div>
            )}
            
            {vaga.jornada_trabalho && (
              <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Jornada</p>
                  <p className="font-semibold text-purple-700">{vaga.jornada_trabalho}</p>
                </div>
              </div>
            )}
            
            {vaga.local_trabalho && (
              <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                <MapPin className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Local</p>
                  <p className="font-semibold text-orange-700">{vaga.local_trabalho}</p>
                </div>
              </div>
            )}
          </div>

          {/* Informações Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Cargo:</span>
              <span className="ml-2 font-medium">{vaga.cargo}</span>
            </div>
            <div>
              <span className="text-gray-600">Categoria:</span>
              <span className="ml-2 font-medium">{vaga.categoria}</span>
            </div>
            <div>
              <span className="text-gray-600">Site:</span>
              <span className="ml-2 font-medium">{vaga.site}</span>
            </div>
          </div>

          {/* Descrição da Vaga */}
          {vaga.descricao_vaga && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição da vaga</h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {vaga.descricao_vaga}
              </p>
            </div>
          )}

          {/* Responsabilidades e Atribuições */}
          {vaga.responsabilidades_atribuicoes && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Responsabilidades e atribuições</h3>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {vaga.responsabilidades_atribuicoes}
              </div>
            </div>
          )}

          {/* Requisitos e Qualificações */}
          {vaga.requisitos_qualificacoes && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Requisitos e qualificações</h3>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {vaga.requisitos_qualificacoes}
              </div>
            </div>
          )}

          {/* Benefícios */}
          {vaga.beneficios && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefícios</h3>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {vaga.beneficios}
              </div>
            </div>
          )}

          {/* Etapas do Processo */}
          {vaga.etapas_processo && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Etapas do processo</h3>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {vaga.etapas_processo}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}