import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Vaga } from '../types/database'
import { 
  Share2, 
  Copy, 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Building2,
  Users,
  Heart
} from 'lucide-react'

interface VagaTemplateProps {
  vaga: Vaga
  onEdit?: () => void
  onDelete?: () => void
  showActions?: boolean
}

export default function VagaTemplate({ vaga, onEdit, onDelete, showActions = false }: VagaTemplateProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [linkCopied, setLinkCopied] = useState(false)

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const isExpanded = (section: string) => expandedSections.has(section)

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Header Principal */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {vaga.cargo}
            </h1>
            <div className="flex items-center space-x-2 text-lg text-blue-600 font-semibold mb-4">
              <Building2 className="h-5 w-5" />
              <span>{vaga.cliente}</span>
              <span className="text-gray-400">•</span>
              <span>{vaga.site}</span>
            </div>
            
            {/* Botões de Ação Principais */}
            <div className="flex flex-wrap gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg font-semibold">
                <ExternalLink className="h-5 w-5 mr-2" />
                Candidatar-se
              </Button>
              
              <Button variant="outline" className="px-4 py-3">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar vaga
              </Button>
              
              <Button 
                variant="outline" 
                className="px-4 py-3"
                onClick={copyLink}
              >
                <Copy className="h-4 w-4 mr-2" />
                {linkCopied ? 'Link copiado!' : 'Copiar link'}
              </Button>
            </div>
          </div>
          
          {/* Botões de Administração */}
          {showActions && (
            <div className="flex flex-col space-y-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button variant="outline" size="sm" onClick={onDelete} className="text-red-600">
                  Excluir
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="px-6 py-8 space-y-8">
        
        {/* Descrição da Vaga */}
        {vaga.descricao_vaga && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Descrição da vaga</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {vaga.descricao_vaga}
              </p>
            </div>
          </section>
        )}

        {/* Responsabilidades e Atribuições */}
        {vaga.responsabilidades_atribuicoes && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Responsabilidades e atribuições</h2>
            <div className="prose prose-gray max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {vaga.responsabilidades_atribuicoes}
              </div>
            </div>
          </section>
        )}

        {/* Requisitos e Qualificações */}
        {vaga.requisitos_qualificacoes && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Requisitos e qualificações</h2>
            <div className="prose prose-gray max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {vaga.requisitos_qualificacoes}
              </div>
            </div>
          </section>
        )}

        {/* Informações Adicionais */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Informações adicionais</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Salário */}
            {vaga.salario && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Salário</h3>
                </div>
                <p className="text-2xl font-bold text-green-700">{vaga.salario}</p>
              </div>
            )}

            {/* Horário de Trabalho */}
            {vaga.horario_trabalho && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Clock className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Horário de Trabalho</h3>
                </div>
                <p className="text-lg font-semibold text-blue-700">{vaga.horario_trabalho}</p>
              </div>
            )}

            {/* Jornada de Trabalho */}
            {vaga.jornada_trabalho && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="h-6 w-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Jornada de Trabalho</h3>
                </div>
                <p className="text-lg font-semibold text-purple-700">{vaga.jornada_trabalho}</p>
              </div>
            )}

            {/* Local de Trabalho */}
            {vaga.local_trabalho && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <MapPin className="h-6 w-6 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Local de trabalho</h3>
                </div>
                <p className="text-lg font-semibold text-orange-700">{vaga.local_trabalho}</p>
              </div>
            )}
          </div>
        </section>

        {/* Benefícios */}
        {vaga.beneficios && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefícios</h2>
            <div className="prose prose-gray max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {vaga.beneficios}
              </div>
            </div>
          </section>
        )}

        {/* Etapas do Processo */}
        {vaga.etapas_processo && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Etapas do processo</h2>
            <div className="prose prose-gray max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {vaga.etapas_processo}
              </div>
            </div>
          </section>
        )}

        {/* Informações da Empresa */}
        <section className="bg-blue-50 p-8 rounded-lg">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="h-8 w-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Muito prazer, somos a {vaga.cliente}!</h2>
          </div>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              Aqui na <strong>{vaga.cliente}</strong> acreditamos que <strong>a melhor experiência do cliente começa com o respeito e cuidado com as pessoas</strong>. 
              E isso vale para todo mundo que faz parte da nossa companhia! Se você está em busca da <strong>sua primeira oportunidade</strong>, 
              ou já tem uma <strong>bagagem profissional incrível</strong>, o nosso convite é o mesmo: <strong>vem crescer com a gente!</strong> 💙
            </p>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Quem somos?</strong><br/>
              Somos líderes em nosso segmento, <strong>combinando tecnologia avançada com o toque humano</strong> para revolucionar 
              a experiência do cliente (CX) entre marcas e consumidores. Estamos presentes em várias localidades, 
              com centros de relacionamento e milhares de postos de trabalho.
            </p>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>O que nos move?</strong><br/>
              Juntar <strong>tecnologia + humanização</strong> para criar <strong>conexões reais e experiências inesquecíveis</strong> 
              entre marcas e consumidores. A cada interação, queremos fazer a diferença – <strong>enriquecendo vidas e gerando valor para os negócios</strong> 
              dos nossos clientes.
            </p>
            
            <p className="text-gray-700 leading-relaxed">
              <strong>Estamos de braços abertos pra te receber!</strong><br/>
              Vem com a gente transformar o futuro do atendimento com empatia, tecnologia, inovação e propósito. 💙 
              Todas as nossas vagas são abertas para pessoas com deficiência e beneficiários reabilitados da Previdência Social. 
              Acreditamos num ambiente de trabalho <strong>diverso, acolhedor e cheio de possibilidades!</strong>
            </p>
          </div>
        </section>

        {/* Botões de Ação Finais */}
        <div className="flex flex-wrap gap-4 justify-center pt-8 border-t border-gray-200">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold">
            <ExternalLink className="h-5 w-5 mr-2" />
            Candidatar-se
          </Button>
          
          <Button variant="outline" className="px-6 py-4">
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar vaga
          </Button>
        </div>
      </div>
    </div>
  )
}
