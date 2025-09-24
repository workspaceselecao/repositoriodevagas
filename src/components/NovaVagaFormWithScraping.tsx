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
import { testSupabaseConnection, testInsertVaga, testRealInsert } from '../lib/test-supabase'
import { Plus, ArrowLeft, Download, Edit, Trash2, Save, RefreshCw } from 'lucide-react'

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
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Prevenir múltiplos envios
    if (loading) {
      console.log('Formulário já está sendo enviado, ignorando...')
      return
    }

    setLoading(true)
    setMessage('')
    setScrapingError('')

    try {
      // Validar campos obrigatórios
      const requiredFields = ['site', 'categoria', 'cargo', 'cliente', 'celula']
      const missingFields = requiredFields.filter(field => !formData[field as keyof VagaFormData]?.trim())
      
      if (missingFields.length > 0) {
        setMessage(`❌ Campos obrigatórios não preenchidos: ${missingFields.join(', ')}`)
        return
      }

      console.log('🚀 Iniciando envio do formulário...')
      console.log('Dados do formulário:', formData)
      
      setMessage('⏳ Salvando vaga no banco de dados...')
      
      // Timeout para evitar loops infinitos (aumentado para 60 segundos)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Operação demorou muito para responder')), 60000)
      })
      
      const createPromise = createVaga(formData, user.id)
      
      const novaVaga = await Promise.race([createPromise, timeoutPromise])
      
      if (novaVaga) {
        setMessage('✅ Vaga criada com sucesso!')
        console.log('Vaga criada:', novaVaga)
        
        // Limpar formulário após sucesso
        clearForm()
        
        // Navegar após um delay para mostrar a mensagem
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      } else {
        setMessage('❌ Erro: Vaga não foi criada (retorno nulo)')
      }
    } catch (error: any) {
      console.error('💥 [handleSubmit] Erro detalhado ao criar vaga:', error)
      console.error('💥 [handleSubmit] Tipo do erro:', typeof error)
      console.error('💥 [handleSubmit] Stack trace:', error.stack)
      
      let errorMessage = 'Erro desconhecido ao criar vaga'
      
      if (error?.message) {
        console.log('📝 [handleSubmit] Mensagem do erro:', error.message)
        
        if (error.message.includes('Timeout')) {
          errorMessage = '⏰ Timeout: A operação demorou muito. Verifique sua conexão e tente novamente.'
        } else if (error.message.includes('null value in column "produto"')) {
          errorMessage = '❌ MIGRAÇÃO NECESSÁRIA: O banco ainda usa coluna "produto". Execute o script "migrate-produto-to-celula.sql" no Supabase SQL Editor.'
        } else if (error.message.includes('null value in column "celula"')) {
          errorMessage = '❌ Erro: Campo "Célula" é obrigatório e não foi preenchido.'
        } else if (error.message.includes('violates not-null constraint')) {
          errorMessage = '❌ Erro: Algum campo obrigatório não foi preenchido corretamente.'
        } else if (error.message.includes('JWT') || error.message.includes('auth')) {
          errorMessage = '🔐 Erro de autenticação: Faça login novamente.'
        } else if (error.message.includes('permission') || error.message.includes('policy')) {
          errorMessage = '🚫 Erro de permissão: Você não tem permissão para criar vagas.'
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = '🌐 Erro de rede: Verifique sua conexão com a internet.'
        } else if (error.message.includes('Campos obrigatórios não preenchidos')) {
          errorMessage = `❌ ${error.message}`
        } else {
          errorMessage = `❌ Erro inesperado: ${error.message}`
        }
      } else {
        console.error('❌ [handleSubmit] Erro sem mensagem:', error)
        errorMessage = '❌ Erro desconhecido. Verifique o console para mais detalhes.'
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

  const testConnection = async () => {
    setLoading(true)
    setMessage('🔍 Testando conexão com Supabase...')
    
    try {
      const result = await testSupabaseConnection()
      
      if (result.success) {
        setMessage(`✅ ${result.message}`)
        console.log('Teste de conexão bem-sucedido:', result.details)
      } else {
        setMessage(`❌ ${result.message}`)
        console.error('Teste de conexão falhou:', result.details)
      }
    } catch (error: any) {
      setMessage(`❌ Erro no teste: ${error.message}`)
      console.error('Erro no teste de conexão:', error)
    } finally {
      setLoading(false)
    }
  }

  const testInsert = async () => {
    setLoading(true)
    setMessage('🧪 Testando inserção no banco de dados...')
    
    try {
      const result = await testRealInsert()
      
      if (result.success) {
        setMessage(`✅ ${result.message}`)
        console.log('Teste de inserção bem-sucedido:', result.details)
      } else {
        setMessage(`❌ ${result.message}`)
        console.error('Teste de inserção falhou:', result.details)
      }
    } catch (error: any) {
      setMessage(`❌ Erro no teste de inserção: ${error.message}`)
      console.error('Erro no teste de inserção:', error)
    } finally {
      setLoading(false)
    }
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
    setScrapedData(null)
    setActiveTab('manual') // Mudar para aba manual
    setMessage('✅ Dados aplicados ao formulário! Você está na aba de extração manual para revisar e editar.')
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

      {/* Mensagem principal - sempre visível no topo */}
      <div className={`mb-6 p-4 rounded-lg shadow-sm border-l-4 ${
        message.includes('✅') || message.includes('sucesso')
          ? 'bg-green-50 text-green-800 border-green-400 border-l-green-500' 
          : message.includes('❌') || message.includes('erro')
          ? 'bg-red-50 text-red-800 border-red-400 border-l-red-500'
          : message.includes('⏳') || message.includes('Testando')
          ? 'bg-blue-50 text-blue-800 border-blue-400 border-l-blue-500'
          : 'bg-gray-50 text-gray-800 border-gray-400 border-l-gray-500'
      }`}>
        {message || '💡 Preencha os campos obrigatórios e clique em "Salvar Vaga" para criar uma nova vaga.'}
      </div>

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
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        Extraindo...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Extrair
                      </>
                    )}
                  </Button>
                </div>
              </div>


              {scrapingError && (
                <div className="mt-4 p-4 rounded-lg bg-red-50 text-red-800 border-2 border-red-200 shadow-sm">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{scrapingError}</p>
                    </div>
                  </div>
                </div>
              )}

              {scrapedData && (
                <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg shadow-sm">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-green-800 flex items-center">
                          <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Dados Extraídos com Sucesso!
                        </h3>
                        <div className="flex items-center space-x-3 mt-2">
                          <ConfidenceIndicator confidence={scrapedData.confidence} size="sm" />
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            Fonte: {scrapedData.source === 'json' ? 'JSON' : scrapedData.source === 'html' ? 'HTML' : 'Mista'}
                          </span>
                        </div>
                      </div>
                      <div className="space-x-2">
                        <Button
                          size="sm"
                          onClick={() => applyScrapedData(scrapedData)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Aplicar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setScrapedData(null)}
                          className="border-green-300 text-green-700 hover:bg-green-50"
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
                  <div className="space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearForm}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpar Formulário
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={testConnection}
                      disabled={loading}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Testar Conexão
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={testInsert}
                      disabled={loading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Testar Inserção
                    </Button>
                  </div>
                  <div className="space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Vaga
                        </>
                      )}
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
