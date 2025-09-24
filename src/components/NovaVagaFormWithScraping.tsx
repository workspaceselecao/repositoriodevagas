import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { VagaFormData } from '../types/database'
import { createVaga, refreshVagasList } from '../lib/vagas'
import { EnhancedJobScrapingService, ScrapingResult, ScrapingError } from '../lib/enhanced-scraping'
import { ConfidenceIndicator, FieldConfidenceIndicator, ConfidenceBar } from './ConfidenceIndicator'
import { Plus, ArrowLeft, Download, Upload, Edit, Trash2, Save, RefreshCw } from 'lucide-react'

export default function NovaVagaFormWithScraping() {
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
  const [scrapingLoading, setScrapingLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [scrapingUrl, setScrapingUrl] = useState('')
  const [scrapedData, setScrapedData] = useState<ScrapingResult | null>(null)
  const [scrapingError, setScrapingError] = useState<string>('')
  const [activeTab, setActiveTab] = useState('manual')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setMessage('')
    setScrapingError('')

    try {
      // Validar campos obrigatórios
      const requiredFields = ['site', 'categoria', 'cargo', 'cliente', 'celula']
      const missingFields = requiredFields.filter(field => !formData[field as keyof VagaFormData]?.trim())
      
      if (missingFields.length > 0) {
        setMessage(`❌ Campos obrigatórios não preenchidos: ${missingFields.join(', ')}`)
        setLoading(false)
        return
      }

      console.log('Enviando dados do formulário:', formData)
      const novaVaga = await createVaga(formData, user.id)
      
      if (novaVaga) {
        setMessage('✅ Vaga criada com sucesso! Atualizando lista...')
        
        // Atualizar lista de vagas automaticamente
        await refreshVagasList()
        
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      } else {
        setMessage('❌ Erro ao criar vaga: Falha na comunicação com o servidor')
      }
    } catch (error: any) {
      console.error('Erro detalhado ao criar vaga:', error)
      
      let errorMessage = 'Erro desconhecido ao criar vaga'
      
      if (error?.message) {
        if (error.message.includes('null value in column "produto"')) {
          errorMessage = '❌ Erro de banco de dados: Coluna "produto" não encontrada. Execute o script de migração no Supabase.'
        } else if (error.message.includes('null value in column "celula"')) {
          errorMessage = '❌ Erro: Campo "Célula" é obrigatório e não foi preenchido.'
        } else if (error.message.includes('violates not-null constraint')) {
          errorMessage = '❌ Erro: Algum campo obrigatório não foi preenchido corretamente.'
        } else {
          errorMessage = `❌ ${error.message}`
        }
      }
      
      setMessage(errorMessage)
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

  const handleScrapingFromURL = async () => {
    if (!scrapingUrl.trim()) {
      setScrapingError('Por favor, insira uma URL válida')
      return
    }

    setScrapingLoading(true)
    setScrapingError('')
    setMessage('Iniciando extração de dados...')

    try {
      console.log('Iniciando extração de URL:', scrapingUrl)
      const result = await EnhancedJobScrapingService.extractFromURL(scrapingUrl)
      
      if ('message' in result) {
        let errorMessage = result.message
        
        // Melhorar mensagens de erro específicas
        if (result.code === 'CORS_ERROR') {
          errorMessage = '🚫 Erro de CORS: Não foi possível acessar a URL diretamente. Tente fazer upload do arquivo HTML ou use uma URL diferente.'
        } else if (result.code === 'NETWORK_ERROR') {
          errorMessage = '🌐 Erro de rede: Verifique sua conexão e tente novamente. Se o problema persistir, faça upload do arquivo HTML.'
        } else if (result.code === 'VALIDATION_ERROR') {
          errorMessage = '⚠️ URL inválida: Certifique-se de que a URL é do domínio gupy.io'
        }
        
        setScrapingError(`${errorMessage} (Código: ${result.code})`)
        setMessage('')
      } else {
        console.log('Extração bem-sucedida!', result)
        setScrapedData(result)
        
        // Aplicar dados extraídos automaticamente aos campos
        setFormData(prev => ({
          ...prev,
          titulo: result.titulo,
          descricao_vaga: result.descricao_vaga,
          responsabilidades_atribuicoes: result.responsabilidades_atribuicoes,
          requisitos_qualificacoes: result.requisitos_qualificacoes,
          salario: result.salario,
          horario_trabalho: result.horario_trabalho,
          jornada_trabalho: result.jornada_trabalho,
          beneficios: result.beneficios,
          local_trabalho: result.local_trabalho,
          etapas_processo: result.etapas_processo
        }))
        
        const confidenceText = result.confidence >= 80 ? 'Excelente' : 
                              result.confidence >= 60 ? 'Boa' : 
                              result.confidence >= 40 ? 'Regular' : 'Baixa'
        
        setMessage(`✅ Dados extraídos com sucesso! Assertividade: ${result.confidence}% (${confidenceText}). Revise e ajuste conforme necessário.`)
      }
    } catch (error: any) {
      console.error('Erro inesperado:', error)
      setScrapingError(`❌ Erro inesperado ao extrair dados: ${error.message}`)
      setMessage('')
    } finally {
      setScrapingLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.name.toLowerCase().endsWith('.html')) {
      setScrapingError('⚠️ Por favor, selecione um arquivo HTML válido (.html)')
      return
    }

    setScrapingError('')
    setMessage('Processando arquivo HTML...')

    const reader = new FileReader()
    reader.onload = (event) => {
      const htmlContent = event.target?.result as string
      
      try {
        console.log('Processando arquivo HTML:', file.name)
        const htmlResult = EnhancedJobScrapingService.extractFromHTML(htmlContent)
        const jsonResult = EnhancedJobScrapingService.extractFromJSON(htmlContent)
        
        let result: ScrapingResult | null = null
        if ('message' in htmlResult) {
          if (jsonResult && !('message' in jsonResult)) {
            result = jsonResult as ScrapingResult
            console.log('Usando dados extraídos do JSON do arquivo')
          } else {
            setScrapingError(`❌ ${htmlResult.message}`)
            setMessage('')
            return
          }
        } else {
          // Combinar resultados HTML e JSON se ambos existirem
          if (jsonResult && !('message' in jsonResult)) {
            result = EnhancedJobScrapingService.combineResults(htmlResult, jsonResult, '')
            console.log('Combinando dados HTML e JSON do arquivo')
          } else {
            result = htmlResult as ScrapingResult
            console.log('Usando dados extraídos do HTML do arquivo')
          }
        }

        if (!result) {
          setScrapingError('❌ Não foi possível extrair dados do arquivo. Verifique se é um arquivo HTML válido de uma vaga do Gupy.')
          setMessage('')
          return
        }
        
        console.log('Extração do arquivo bem-sucedida!', result)
        setScrapedData(result)
        
        // Aplicar dados extraídos automaticamente aos campos
        setFormData(prev => ({
          ...prev,
          titulo: result.titulo,
          descricao_vaga: result.descricao_vaga,
          responsabilidades_atribuicoes: result.responsabilidades_atribuicoes,
          requisitos_qualificacoes: result.requisitos_qualificacoes,
          salario: result.salario,
          horario_trabalho: result.horario_trabalho,
          jornada_trabalho: result.jornada_trabalho,
          beneficios: result.beneficios,
          local_trabalho: result.local_trabalho,
          etapas_processo: result.etapas_processo
        }))
        
        const confidenceText = result.confidence >= 80 ? 'Excelente' : 
                              result.confidence >= 60 ? 'Boa' : 
                              result.confidence >= 40 ? 'Regular' : 'Baixa'
        
        setMessage(`✅ Dados extraídos do arquivo "${file.name}" com sucesso! Assertividade: ${result.confidence}% (${confidenceText}). Revise e ajuste conforme necessário.`)
      } catch (error: any) {
        console.error('Erro ao processar arquivo:', error)
        setScrapingError(`❌ Erro ao processar arquivo: ${error.message}`)
        setMessage('')
      }
    }
    
    reader.onerror = () => {
      setScrapingError('❌ Erro ao ler o arquivo. Verifique se o arquivo não está corrompido.')
      setMessage('')
    }
    
    reader.readAsText(file)
  }

  const clearForm = () => {
    setFormData({
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
    setScrapedData(null)
    setScrapingError('')
    setMessage('')
  }

  const applyScrapedData = (data: ScrapingResult) => {
    setFormData(prev => ({
      ...prev,
      titulo: data.titulo,
      descricao_vaga: data.descricao_vaga,
      responsabilidades_atribuicoes: data.responsabilidades_atribuicoes,
      requisitos_qualificacoes: data.requisitos_qualificacoes,
      salario: data.salario,
      horario_trabalho: data.horario_trabalho,
      jornada_trabalho: data.jornada_trabalho,
      beneficios: data.beneficios,
      local_trabalho: data.local_trabalho,
      etapas_processo: data.etapas_processo
    }))
    setMessage('Dados aplicados ao formulário!')
  }

  const renderFormField = (
    name: keyof VagaFormData,
    label: string,
    placeholder: string,
    type: 'input' | 'textarea' = 'input',
    rows?: number
  ) => (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={formData[name] || ''}
          onChange={handleInputChange}
          placeholder={placeholder}
          rows={rows || 4}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      ) : (
        <Input
          id={name}
          name={name}
          value={formData[name] || ''}
          onChange={handleInputChange}
          placeholder={placeholder}
        />
      )}
    </div>
  )

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
          <h1 className="text-3xl font-bold text-gray-900">Nova Vaga</h1>
          <p className="text-gray-600 mt-2">
            Adicione uma nova vaga ao sistema com extração automática ou manual
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.includes('sucesso') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="auto" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Extração Automática</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center space-x-2">
            <Edit className="h-4 w-4" />
            <span>Preenchimento Manual</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="auto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Extração Automática de Dados
              </CardTitle>
              <CardDescription>
                Extraia informações automaticamente de URLs ou arquivos HTML
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Extração por URL */}
              <div className="space-y-2">
                <Label htmlFor="scraping-url">URL da Vaga</Label>
                <div className="flex space-x-2">
                  <Input
                    id="scraping-url"
                    value={scrapingUrl}
                    onChange={(e) => setScrapingUrl(e.target.value)}
                    placeholder="https://exemplo.com/vaga/123"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleScrapingFromURL}
                    disabled={scrapingLoading || !scrapingUrl.trim()}
                  >
                    {scrapingLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Upload de arquivo */}
              <div className="space-y-2">
                <Label htmlFor="file-upload">Ou faça upload de um arquivo HTML</Label>
                <div className="flex space-x-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".html,.htm"
                    onChange={handleFileUpload}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {scrapingError && (
                <div className="p-3 rounded-md bg-red-50 text-red-800 border border-red-200">
                  {scrapingError}
                </div>
              )}

              {scrapedData && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Dados Extraídos</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <ConfidenceIndicator confidence={scrapedData.confidence} size="sm" />
                        <span className="text-xs text-gray-500">
                          Fonte: {scrapedData.source === 'json' ? 'JSON' : scrapedData.source === 'html' ? 'HTML' : 'Mista'}
                        </span>
                      </div>
                    </div>
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        onClick={() => applyScrapedData(scrapedData)}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Aplicar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setScrapedData(null)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Limpar
                      </Button>
                    </div>
                  </div>

                  {/* Indicador de Confiança Detalhado */}
                  <FieldConfidenceIndicator extractedFields={scrapedData.extractedFields} />

                  {/* Dados Extraídos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(scrapedData).filter(([key]) => !['confidence', 'extractedFields', 'source', 'url'].includes(key)).map(([key, value]) => {
                      const fieldStatus = scrapedData.extractedFields[key as keyof typeof scrapedData.extractedFields]
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium capitalize">
                              {key.replace(/_/g, ' ')}
                            </Label>
                            {fieldStatus && (
                              <div className="flex items-center space-x-1">
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  fieldStatus.found ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {fieldStatus.confidence}%
                                </span>
                                <span className="text-xs text-gray-400">
                                  {fieldStatus.source}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className={`p-2 rounded border text-sm max-h-32 overflow-y-auto ${
                            fieldStatus?.found ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                          }`}>
                            {value || 'Não encontrado'}
                          </div>
                          <ConfidenceBar confidence={fieldStatus?.confidence || 0} className="h-1" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Informações da Vaga
              </CardTitle>
              <CardDescription>
                Preencha todas as informações necessárias sobre a vaga
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderFormField('site', 'Site', 'Ex: São Bento, Casa, etc.', 'input')}
                  {renderFormField('categoria', 'Categoria', 'Ex: Operações', 'input')}
                  {renderFormField('cargo', 'Cargo', 'Ex: Especialista I', 'input')}
                  {renderFormField('cliente', 'Cliente', 'Ex: VIVO, REDE, etc.', 'input')}
                  {renderFormField('titulo', 'Título da Vaga', 'Ex: Desenvolvedor Full Stack', 'input')}
                  {renderFormField('celula', 'Célula', 'Ex: VIVO - Telecom I', 'input')}
                </div>

                {/* Campos principais extraídos */}
                {renderFormField('descricao_vaga', 'Descrição da Vaga', 'Descreva a vaga...', 'textarea')}
                {renderFormField('responsabilidades_atribuicoes', 'Responsabilidades e Atribuições', 'Liste as responsabilidades...', 'textarea')}
                {renderFormField('requisitos_qualificacoes', 'Requisitos e Qualificações', 'Liste os requisitos...', 'textarea')}

                {/* Informações Adicionais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderFormField('salario', 'Salário', 'Ex: R$ 1.518,00', 'input')}
                  {renderFormField('horario_trabalho', 'Horário de Trabalho', 'Ex: Das 09:00 às 18:00', 'input')}
                  {renderFormField('jornada_trabalho', 'Jornada de Trabalho', 'Ex: 180h mês | Escala 5x2', 'input')}
                </div>

                {renderFormField('beneficios', 'Benefícios', 'Liste os benefícios...', 'textarea')}
                {renderFormField('local_trabalho', 'Local de Trabalho', 'Endereço e localização...', 'textarea')}
                {renderFormField('etapas_processo', 'Etapas do Processo', 'Liste as etapas do processo seletivo...', 'textarea')}

                {/* Botões */}
                <div className="flex justify-between space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearForm}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Formulário
                  </Button>
                  <div className="space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Salvando...' : 'Criar Vaga'}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
