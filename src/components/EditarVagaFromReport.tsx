import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { VagaFormData, Vaga, Report } from '../types/database'
import { getVagaById, updateVaga } from '../lib/vagas'
import { getReportById, updateReportStatus } from '../lib/reports'
import { ArrowLeft, Save, Loader2, AlertCircle, CheckCircle, Edit3, Eye, Info } from 'lucide-react'

export default function EditarVagaFromReport() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
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
  const [report, setReport] = useState<Report | null>(null)
  const [editableField, setEditableField] = useState<string>('')
  const [originalValue, setOriginalValue] = useState<string>('')

  useEffect(() => {
    const loadData = async () => {
      if (!id) return

      try {
        setLoadingData(true)
        
        // Buscar o report
        const reportData = await getReportById(id)
        if (!reportData) {
          setMessage('Report não encontrado')
          return
        }

        setReport(reportData)
        setEditableField(reportData.field_name)

        // Buscar a vaga
        const vagaData = await getVagaById(reportData.vaga_id)
        if (!vagaData) {
          setMessage('Vaga não encontrada')
          return
        }

        // Preencher formulário com dados da vaga
        setFormData({
          site: vagaData.site || '',
          categoria: vagaData.categoria || '',
          cargo: vagaData.cargo || '',
          cliente: vagaData.cliente || '',
          titulo: vagaData.titulo || '',
          celula: vagaData.celula || '',
          descricao_vaga: vagaData.descricao_vaga || '',
          responsabilidades_atribuicoes: vagaData.responsabilidades_atribuicoes || '',
          requisitos_qualificacoes: vagaData.requisitos_qualificacoes || '',
          salario: vagaData.salario || '',
          horario_trabalho: vagaData.horario_trabalho || '',
          jornada_trabalho: vagaData.jornada_trabalho || '',
          beneficios: vagaData.beneficios || '',
          local_trabalho: vagaData.local_trabalho || '',
          etapas_processo: vagaData.etapas_processo || ''
        })

        // Salvar valor original do campo editável
        const originalFieldValue = (vagaData as any)[reportData.field_name] || ''
        setOriginalValue(originalFieldValue)

      } catch (error: any) {
        console.error('Erro ao carregar dados:', error)
        setMessage(`Erro ao carregar dados: ${error.message}`)
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !id || !report) return

    setLoading(true)
    setMessage('')

    try {
      // Atualizar a vaga
      const vagaAtualizada = await updateVaga(report.vaga_id, formData, user.id)
      
      if (vagaAtualizada) {
        // Marcar report como concluído
        await updateReportStatus(id, 'completed', 'Alteração realizada com sucesso')
        
        setMessage('Alteração realizada com sucesso!')
        
        // Mostrar popup de sucesso e redirecionar
        setTimeout(() => {
          alert('Alteração realizada com sucesso!')
          navigate('/dashboard/clientes')
        }, 1000)
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

  const isFieldEditable = (fieldName: string) => {
    return fieldName === editableField
  }

  const getFieldLabel = (fieldName: string) => {
    const labels: { [key: string]: string } = {
      site: 'Site',
      categoria: 'Categoria',
      cargo: 'Cargo',
      cliente: 'Cliente',
      titulo: 'Título',
      descricao_vaga: 'Descrição da vaga',
      responsabilidades_atribuicoes: 'Responsabilidades e atribuições',
      requisitos_qualificacoes: 'Requisitos e qualificações',
      salario: 'Salário',
      horario_trabalho: 'Horário de Trabalho',
      jornada_trabalho: 'Jornada de Trabalho',
      beneficios: 'Benefícios',
      local_trabalho: 'Local de Trabalho',
      etapas_processo: 'Etapas do processo'
    }
    return labels[fieldName] || fieldName
  }

  const getFieldClassName = (fieldName: string) => {
    if (isFieldEditable(fieldName)) {
      return 'border-green-300 bg-green-50 dark:bg-green-900/20 focus:border-green-500 focus:ring-green-500'
    }
    return 'bg-gray-100 dark:bg-gray-800'
  }

  const getLabelClassName = (fieldName: string) => {
    if (isFieldEditable(fieldName)) {
      return 'text-green-700 font-semibold flex items-center gap-1'
    }
    return ''
  }

  const renderFieldLabel = (fieldName: string, labelText: string) => (
    <Label htmlFor={fieldName} className={getLabelClassName(fieldName)}>
      {isFieldEditable(fieldName) && <Edit3 className="h-3 w-3" />}
      {labelText}
    </Label>
  )

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="ml-3 text-lg text-gray-700">Carregando dados do report...</p>
      </div>
    )
  }

  if (message && message.includes('não encontrado')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-600">
        <p className="text-xl mb-4">{message}</p>
        <Button onClick={() => navigate('/dashboard')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para o dashboard
        </Button>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-600">
        <p className="text-xl mb-4">Report não encontrado</p>
        <Button onClick={() => navigate('/dashboard')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para o dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            Editar Oportunidade - Report
          </h1>
          <p className="text-gray-600 mt-1">
            Campo reportado: <span className="font-semibold">{getFieldLabel(editableField)}</span>
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard/clientes')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Informações do Report */}
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            Informações do Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-sm font-medium">Campo Reportado:</Label>
            <p className="text-sm text-gray-700">{getFieldLabel(editableField)}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Valor Atual:</Label>
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
              {originalValue || 'Não informado'}
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Sugestões do RH:</Label>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-sm">
              {report.suggested_changes}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruções de Edição */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            Instruções de Edição
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Edit3 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm text-green-700">Campo Editável</p>
              <p className="text-sm text-gray-600">
                Apenas o campo <strong>"{getFieldLabel(editableField)}"</strong> pode ser editado. 
                Este campo está destacado em verde e permite modificações.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm text-gray-700">Campos Somente Leitura</p>
              <p className="text-sm text-gray-600">
                Todos os outros campos são apenas para visualização e estão desabilitados. 
                Eles servem como contexto para entender melhor a oportunidade.
              </p>
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border border-yellow-200">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Dica:</strong> Consulte as sugestões do RH na seção "Informações do Report" 
              para entender melhor as alterações solicitadas.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mensagem de Status */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.includes('sucesso') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Informações da Oportunidade
          </CardTitle>
          <CardDescription>
            <div className="flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-green-600" />
              <span>
                Campo editável: <strong className="text-green-700">{getFieldLabel(editableField)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Eye className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">
                Demais campos são somente leitura para contexto
              </span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {renderFieldLabel('site', 'Site')}
                <Input
                  id="site"
                  name="site"
                  value={formData.site}
                  onChange={handleInputChange}
                  disabled={!isFieldEditable('site')}
                  className={getFieldClassName('site')}
                />
              </div>
              <div className="space-y-2">
                {renderFieldLabel('categoria', 'Categoria')}
                <Input
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  disabled={!isFieldEditable('categoria')}
                  className={getFieldClassName('categoria')}
                />
              </div>
              <div className="space-y-2">
                {renderFieldLabel('cargo', 'Cargo')}
                <Input
                  id="cargo"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleInputChange}
                  disabled={!isFieldEditable('cargo')}
                  className={getFieldClassName('cargo')}
                />
              </div>
              <div className="space-y-2">
                {renderFieldLabel('cliente', 'Cliente')}
                <Input
                  id="cliente"
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleInputChange}
                  disabled={!isFieldEditable('cliente')}
                  className={getFieldClassName('cliente')}
                />
              </div>
              <div className="space-y-2">
                {renderFieldLabel('titulo', 'Título')}
                <Input
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  disabled={!isFieldEditable('titulo')}
                  className={getFieldClassName('titulo')}
                />
              </div>
              <div className="space-y-2">
                {renderFieldLabel('celula', 'Célula')}
                <Input
                  id="celula"
                  name="celula"
                  value={formData.celula}
                  onChange={handleInputChange}
                  disabled={!isFieldEditable('celula')}
                  className={getFieldClassName('celula')}
                />
              </div>
            </div>

            {/* Campos de Texto */}
            <div className="space-y-4">
              <div className="space-y-2">
                {renderFieldLabel('descricao_vaga', 'Descrição da Vaga')}
                <Textarea
                  id="descricao_vaga"
                  name="descricao_vaga"
                  value={formData.descricao_vaga}
                  onChange={handleInputChange}
                  disabled={!isFieldEditable('descricao_vaga')}
                  className={getFieldClassName('descricao_vaga')}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                {renderFieldLabel('responsabilidades_atribuicoes', 'Responsabilidades e Atribuições')}
                <Textarea
                  id="responsabilidades_atribuicoes"
                  name="responsabilidades_atribuicoes"
                  value={formData.responsabilidades_atribuicoes}
                  onChange={handleInputChange}
                  disabled={!isFieldEditable('responsabilidades_atribuicoes')}
                  className={getFieldClassName('responsabilidades_atribuicoes')}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                {renderFieldLabel('requisitos_qualificacoes', 'Requisitos e Qualificações')}
                <Textarea
                  id="requisitos_qualificacoes"
                  name="requisitos_qualificacoes"
                  value={formData.requisitos_qualificacoes}
                  onChange={handleInputChange}
                  disabled={!isFieldEditable('requisitos_qualificacoes')}
                  className={getFieldClassName('requisitos_qualificacoes')}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  {renderFieldLabel('salario', 'Salário')}
                  <Input
                    id="salario"
                    name="salario"
                    value={formData.salario}
                    onChange={handleInputChange}
                    disabled={!isFieldEditable('salario')}
                    className={getFieldClassName('salario')}
                  />
                </div>
                <div className="space-y-2">
                  {renderFieldLabel('horario_trabalho', 'Horário de Trabalho')}
                  <Input
                    id="horario_trabalho"
                    name="horario_trabalho"
                    value={formData.horario_trabalho}
                    onChange={handleInputChange}
                    disabled={!isFieldEditable('horario_trabalho')}
                    className={getFieldClassName('horario_trabalho')}
                  />
                </div>
                <div className="space-y-2">
                  {renderFieldLabel('jornada_trabalho', 'Jornada de Trabalho')}
                  <Input
                    id="jornada_trabalho"
                    name="jornada_trabalho"
                    value={formData.jornada_trabalho}
                    onChange={handleInputChange}
                    disabled={!isFieldEditable('jornada_trabalho')}
                    className={getFieldClassName('jornada_trabalho')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                {renderFieldLabel('beneficios', 'Benefícios')}
                <Textarea
                  id="beneficios"
                  name="beneficios"
                  value={formData.beneficios}
                  onChange={handleInputChange}
                  disabled={!isFieldEditable('beneficios')}
                  className={getFieldClassName('beneficios')}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                {renderFieldLabel('local_trabalho', 'Local de Trabalho')}
                <Textarea
                  id="local_trabalho"
                  name="local_trabalho"
                  value={formData.local_trabalho}
                  onChange={handleInputChange}
                  disabled={!isFieldEditable('local_trabalho')}
                  className={getFieldClassName('local_trabalho')}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                {renderFieldLabel('etapas_processo', 'Etapas do Processo')}
                <Textarea
                  id="etapas_processo"
                  name="etapas_processo"
                  value={formData.etapas_processo}
                  onChange={handleInputChange}
                  disabled={!isFieldEditable('etapas_processo')}
                  className={getFieldClassName('etapas_processo')}
                  rows={3}
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/clientes')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
