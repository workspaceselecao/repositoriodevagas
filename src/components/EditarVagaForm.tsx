import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { VagaFormData, Vaga } from '../types/database'
import { getVagaById, updateVaga } from '../lib/vagas'
import { updateReportStatus } from '../lib/reports'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

export default function EditarVagaForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const reportId = searchParams.get('reportId')
  const [formData, setFormData] = useState<VagaFormData>({
    site: '',
    categoria: '',
    cargo: '',
    cliente: '',
    titulo: '',
    celula: '',
    descricao_vaga: '',
    responsabilidades_atribuicoes: '',
    requisitos_qualificacoes: '',
    salario: '',
    horario_trabalho: '',
    jornada_trabalho: '',
    beneficios: '',
    local_trabalho: '',
    etapas_processo: ''
  })
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadVaga = async () => {
      if (!id) {
        setMessage('ID da vaga não fornecido')
        setLoadingData(false)
        return
      }

      try {
        setLoadingData(true)
        const vaga = await getVagaById(id)
        if (vaga) {
          setFormData({
            site: vaga.site || '',
            categoria: vaga.categoria || '',
            cargo: vaga.cargo || '',
            cliente: vaga.cliente || '',
            titulo: vaga.titulo || '',
            celula: vaga.celula || '',
            descricao_vaga: vaga.descricao_vaga || '',
            responsabilidades_atribuicoes: vaga.responsabilidades_atribuicoes || '',
            requisitos_qualificacoes: vaga.requisitos_qualificacoes || '',
            salario: vaga.salario || '',
            horario_trabalho: vaga.horario_trabalho || '',
            jornada_trabalho: vaga.jornada_trabalho || '',
            beneficios: vaga.beneficios || '',
            local_trabalho: vaga.local_trabalho || '',
            etapas_processo: vaga.etapas_processo || ''
          })
        } else {
          setMessage('Vaga não encontrada')
        }
      } catch (error: any) {
        console.error('Erro ao carregar vaga:', error)
        setMessage(`Erro ao carregar vaga: ${error?.message || 'Erro desconhecido'}`)
      } finally {
        setLoadingData(false)
      }
    }

    loadVaga()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !id) return

    setLoading(true)
    setMessage('')

    try {
      const vagaAtualizada = await updateVaga(id, formData, user.id)
      if (vagaAtualizada) {
        setMessage('Vaga atualizada com sucesso!')
        
        // Se há um reportId, marcar o report como concluído
        if (reportId) {
          try {
            console.log('✅ Marcando report como concluído:', reportId)
            await updateReportStatus(
              reportId, 
              'completed', 
              'Ajustes realizados pelo administrador através da edição da vaga'
            )
            console.log('✅ Report marcado como concluído com sucesso')
            
            // Disparar evento para notificar outros componentes
            window.dispatchEvent(new CustomEvent('report-status-updated', { 
              detail: { reportId: reportId, status: 'completed' } 
            }))
          } catch (reportError) {
            console.error('❌ Erro ao marcar report como concluído:', reportError)
            // Não impedir o sucesso da atualização da vaga por causa do report
          }
        }
        
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      } else {
        setMessage('Erro ao atualizar vaga')
      }
    } catch (error: any) {
      console.error('Erro detalhado ao atualizar vaga:', error)
      const errorMessage = error?.message || 'Erro ao atualizar vaga'
      setMessage(`Erro ao atualizar vaga: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="ml-3 text-lg text-gray-700">Carregando vaga...</p>
      </div>
    )
  }

  if (message && message.includes('não encontrada')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-600">
        <p className="text-xl mb-4">{message}</p>
        <Button onClick={() => navigate('/dashboard')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para a lista de vagas
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Vaga</h1>
          <p className="text-gray-600 mt-2">
            Edite as informações da vaga
          </p>
        </div>
      </div>

      {reportId && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Editando vaga devido a report
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Esta vaga será marcada como concluída automaticamente após salvar as alterações.
              </p>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className={`p-4 rounded-md ${
          message.includes('sucesso') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Save className="h-5 w-5 mr-2" />
            Informações da Vaga
          </CardTitle>
          <CardDescription>
            Edite as informações necessárias sobre a vaga
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site">Site</Label>
                <Input
                  id="site"
                  name="site"
                  value={formData.site}
                  onChange={handleInputChange}
                  placeholder="Ex: São Bento, Casa, etc."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  placeholder="Ex: Operações"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleInputChange}
                  placeholder="Ex: Especialista I"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleInputChange}
                  placeholder="Ex: VIVO, REDE, etc."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="titulo">Título da Vaga</Label>
                <Input
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  placeholder="Ex: Desenvolvedor Full Stack"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="celula">Célula</Label>
                <Input
                  id="celula"
                  name="celula"
                  value={formData.celula}
                  onChange={handleInputChange}
                  placeholder="Ex: VIVO - Telecom I"
                  required
                />
              </div>
            </div>

            {/* Descrição da Vaga */}
            <div className="space-y-2">
              <Label htmlFor="descricao_vaga">Descrição da Vaga</Label>
              <textarea
                id="descricao_vaga"
                name="descricao_vaga"
                value={formData.descricao_vaga}
                onChange={handleInputChange}
                placeholder="Descreva a vaga..."
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Responsabilidades */}
            <div className="space-y-2">
              <Label htmlFor="responsabilidades_atribuicoes">Responsabilidades e Atribuições</Label>
              <textarea
                id="responsabilidades_atribuicoes"
                name="responsabilidades_atribuicoes"
                value={formData.responsabilidades_atribuicoes}
                onChange={handleInputChange}
                placeholder="Liste as responsabilidades..."
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Requisitos */}
            <div className="space-y-2">
              <Label htmlFor="requisitos_qualificacoes">Requisitos e Qualificações</Label>
              <textarea
                id="requisitos_qualificacoes"
                name="requisitos_qualificacoes"
                value={formData.requisitos_qualificacoes}
                onChange={handleInputChange}
                placeholder="Liste os requisitos..."
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Informações Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salario">Salário</Label>
                <Input
                  id="salario"
                  name="salario"
                  value={formData.salario}
                  onChange={handleInputChange}
                  placeholder="Ex: R$ 1.518,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horario_trabalho">Horário de Trabalho</Label>
                <Input
                  id="horario_trabalho"
                  name="horario_trabalho"
                  value={formData.horario_trabalho}
                  onChange={handleInputChange}
                  placeholder="Ex: Das 09:00 às 18:00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jornada_trabalho">Jornada de Trabalho</Label>
                <Input
                  id="jornada_trabalho"
                  name="jornada_trabalho"
                  value={formData.jornada_trabalho}
                  onChange={handleInputChange}
                  placeholder="Ex: 180h mês | Escala 5x2"
                />
              </div>
            </div>

            {/* Benefícios */}
            <div className="space-y-2">
              <Label htmlFor="beneficios">Benefícios</Label>
              <textarea
                id="beneficios"
                name="beneficios"
                value={formData.beneficios}
                onChange={handleInputChange}
                placeholder="Liste os benefícios..."
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Local de Trabalho */}
            <div className="space-y-2">
              <Label htmlFor="local_trabalho">Local de Trabalho</Label>
              <textarea
                id="local_trabalho"
                name="local_trabalho"
                value={formData.local_trabalho}
                onChange={handleInputChange}
                placeholder="Endereço e localização..."
                rows={2}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Etapas do Processo */}
            <div className="space-y-2">
              <Label htmlFor="etapas_processo">Etapas do Processo</Label>
              <textarea
                id="etapas_processo"
                name="etapas_processo"
                value={formData.etapas_processo}
                onChange={handleInputChange}
                placeholder="Liste as etapas do processo seletivo..."
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
