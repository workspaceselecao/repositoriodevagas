import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCache } from '../contexts/CacheContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { VagaFormData, Vaga } from '../types/database'
import { createVaga, getVagaById, updateVaga } from '../lib/vagas'
import { EnhancedJobScrapingService, ScrapingResult, ScrapingError } from '../lib/enhanced-scraping'
import { ConfidenceIndicator, FieldConfidenceIndicator, ConfidenceBar } from './ConfidenceIndicator'
import { Plus, Download, Edit, Trash2, Save, RefreshCw, Loader2 } from 'lucide-react'

export default function NovaVagaFormWithScraping() {
  const { id } = useParams<{ id?: string }>()
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
  const [loadingData, setLoadingData] = useState(false)
  const [scrapingLoading, setScrapingLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [scrapingUrl, setScrapingUrl] = useState('')
  const [scrapedData, setScrapedData] = useState<ScrapingResult | null>(null)
  const [scrapingError, setScrapingError] = useState<string>('')
  const [activeTab, setActiveTab] = useState('manual')
  const { user } = useAuth()
  const { addVaga, updateVaga: updateVagaInCache } = useCache()
  const navigate = useNavigate()

  const isEditing = !!id

  // Carregar dados da vaga se estivermos editando
  useEffect(() => {
    if (isEditing && id) {
      loadVagaData()
    }
  }, [id, isEditing])

  const loadVagaData = async () => {
    if (!id) return

    setLoadingData(true)
    try {
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
        setMessage('✅ Dados da vaga carregados com sucesso!')
      } else {
        setMessage('❌ Vaga não encontrada')
      }
    } catch (error) {
      console.error('Erro ao carregar vaga:', error)
      setMessage('❌ Erro ao carregar dados da vaga')
    } finally {
      setLoadingData(false)
    }
  }

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
      
      if (isEditing) {
        setMessage('⏳ Atualizando vaga no banco de dados...')
        
        // Timeout para evitar loops infinitos (aumentado para 60 segundos)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout: Operação demorou muito para responder')), 60000)
        })
        
        const updatePromise = updateVaga(id!, formData, user.id)
        
        const vagaAtualizada = await Promise.race([updatePromise, timeoutPromise])
        
        if (vagaAtualizada) {
          setMessage('✅ Vaga atualizada com sucesso!')
          console.log('Vaga atualizada:', vagaAtualizada)
          
          // Atualizar vaga no cache
          if (vagaAtualizada && typeof vagaAtualizada === 'object' && 'id' in vagaAtualizada) {
            updateVagaInCache(vagaAtualizada as any)
          }
          
          // Navegar após um delay para mostrar a mensagem
          setTimeout(() => {
            navigate('/dashboard/clientes')
          }, 1500)
        } else {
          setMessage('❌ Erro: Vaga não foi atualizada (retorno nulo)')
        }
      } else {
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
          
          // Adicionar vaga ao cache
          if (novaVaga && typeof novaVaga === 'object' && 'id' in novaVaga) {
            addVaga(novaVaga as any)
          }
          
          // Limpar formulário após sucesso
          clearForm()
          
          // Navegar após um delay para mostrar a mensagem
          setTimeout(() => {
            navigate('/dashboard')
          }, 1500)
        } else {
          setMessage('❌ Erro: Vaga não foi criada (retorno nulo)')
        }
      }
    } catch (error: any) {
      console.error('💥 [handleSubmit] Erro detalhado:', error)
      console.error('💥 [handleSubmit] Tipo do erro:', typeof error)
      console.error('💥 [handleSubmit] Stack trace:', error.stack)
      
      let errorMessage = isEditing ? 'Erro desconhecido ao atualizar vaga' : 'Erro desconhecido ao criar vaga'
      
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
          errorMessage = '🚫 Erro de permissão: Você não tem permissão para criar/editar vagas.'
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
      <Label htmlFor={name} className="field-title">{label}</Label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={formData[name] || ''}
          onChange={handleInputChange}
          placeholder={placeholder}
          rows={rows || 4}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground dark:text-gray-100"
        />
      ) : (
        <Input
          id={name}
          name={name}
          value={formData[name] || ''}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="text-foreground dark:text-gray-100"
        />
      )}
    </div>
  )

  // Mostrar loading se estivermos carregando dados de uma vaga existente
  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados da vaga...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent page-title">
          {isEditing ? 'Editar Vaga' : 'Nova Vaga'}
        </h1>
        <p className="page-subtitle text-lg">
          {isEditing 
            ? 'Edite as informações da vaga com extração automática ou manual'
            : 'Adicione uma nova vaga ao sistema com extração automática ou manual'
          }
        </p>
      </div>

      {/* Mensagem principal - sempre visível no topo */}
      <div className={`mb-6 p-4 rounded-lg shadow-sm border-l-4 ${
        message.includes('✅') || message.includes('sucesso')
          ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-400 dark:border-green-600 border-l-green-500 dark:border-l-green-400' 
          : message.includes('❌') || message.includes('erro')
          ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-400 dark:border-red-600 border-l-red-500 dark:border-l-red-400'
          : message.includes('⏳') || message.includes('Testando')
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-400 dark:border-blue-600 border-l-blue-500 dark:border-l-blue-400'
          : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-600 border-l-gray-500 dark:border-l-gray-400'
      }`}>
        {message || (isEditing 
          ? '💡 Edite os campos necessários e clique em "Atualizar Vaga" para salvar as alterações.'
          : '💡 Preencha os campos obrigatórios e clique em "Salvar Vaga" para criar uma nova vaga.'
        )}
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
              <CardTitle className="flex items-center page-title">
                <Download className="h-5 w-5 mr-2 icon-primary" />
                Extração Automática de Dados
              </CardTitle>
              <CardDescription className="page-subtitle">
                Extraia informações automaticamente de URLs ou arquivos HTML
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Extração por URL */}
              <div className="space-y-2">
                <Label htmlFor="scraping-url" className="field-title">URL da Vaga</Label>
                <div className="flex space-x-2">
                  <Input
                    id="scraping-url"
                    value={scrapingUrl}
                    onChange={(e) => setScrapingUrl(e.target.value)}
                    placeholder="https://atento.gupy.io/jobs/XXXXXXXXXX?jobBoardSource=share_link"
                    className="flex-1 text-foreground dark:text-gray-100"
                  />
                  <Button
                    onClick={handleScrapingFromURL}
                    disabled={scrapingLoading || !scrapingUrl.trim()}
                    className={scrapingLoading ? "btn-active" : "btn-text"}
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
                <div className="mt-6 p-4 bg-green-50 dark:bg-gray-800 border-2 border-green-200 dark:border-gray-600 rounded-lg shadow-sm">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-green-800 dark:text-gray-100 flex items-center">
                          <svg className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Dados Extraídos com Sucesso!
                        </h3>
                        <div className="flex items-center space-x-3 mt-2">
                          <ConfidenceIndicator confidence={scrapedData.confidence} size="sm" />
                          <span className="text-xs text-green-600 dark:text-gray-300 bg-green-100 dark:bg-gray-700 px-2 py-1 rounded-full">
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
                                    fieldStatus.found 
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                  }`}>
                                    {fieldStatus.confidence}%
                                  </span>
                                  <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {fieldStatus.source}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className={`p-3 rounded border text-sm max-h-40 overflow-y-auto ${
                              fieldStatus?.found 
                                ? 'bg-green-50 dark:bg-gray-700 border-green-200 dark:border-gray-600 text-gray-900 dark:text-gray-100' 
                                : 'bg-red-50 dark:bg-gray-700 border-red-200 dark:border-gray-600 text-gray-900 dark:text-gray-100'
                            }`}>
                              {value ? (
                                <div className="whitespace-pre-wrap space-y-1">
                                  {value.split('\n').map((line: string, index: number) => {
                                    const trimmedLine = line.trim()
                                    
                                    if (!trimmedLine) {
                                      return <div key={index} className="h-1" />
                                    }
                                    
                                    // Se a linha começa com marcador, renderizar como lista
                                    if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
                                      return (
                                        <div key={index} className="flex items-start">
                                          <span className="text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0">•</span>
                                          <span className="flex-1">{trimmedLine.substring(1).trim()}</span>
                                        </div>
                                      )
                                    }
                                    
                                    // Se a linha começa com número (lista numerada)
                                    if (/^\d+\.\s/.test(trimmedLine)) {
                                      return (
                                        <div key={index} className="flex items-start">
                                          <span className="text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0 font-semibold">
                                            {trimmedLine.match(/^\d+/)?.[0]}.
                                          </span>
                                          <span className="flex-1">{trimmedLine.replace(/^\d+\.\s/, '').trim()}</span>
                                        </div>
                                      )
                                    }
                                    
                                    // Linha normal
                                    return (
                                      <div key={index} className="leading-relaxed">
                                        {trimmedLine}
                                      </div>
                                    )
                                  })}
                                </div>
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400 italic">Não encontrado</span>
                              )}
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
              <CardTitle className="flex items-center page-title">
                <Plus className="h-5 w-5 mr-2 icon-primary" />
                Informações da Vaga
              </CardTitle>
              <CardDescription className="page-subtitle">
                Preencha todas as informações necessárias sobre a vaga
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
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
                <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 gap-4">
                  {renderFormField('salario', 'Salário', 'Ex: R$ 1.518,00', 'input')}
                  {renderFormField('horario_trabalho', 'Horário de Trabalho', 'Ex: Das 09:00 às 18:00', 'input')}
                  {renderFormField('jornada_trabalho', 'Jornada de Trabalho', 'Ex: 180h mês | Escala 5x2', 'input')}
                </div>

                {renderFormField('beneficios', 'Benefícios', 'Liste os benefícios...', 'textarea')}
                {renderFormField('local_trabalho', 'Local de Trabalho', 'Endereço e localização...', 'textarea')}
                {renderFormField('etapas_processo', 'Etapas do Processo', 'Liste as etapas do processo seletivo...', 'textarea')}

                {/* Botões */}
                <div className="flex flex-col tablet:flex-row justify-between gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearForm}
                    className="w-full tablet:w-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Formulário
                  </Button>
                  <div className="flex flex-col tablet:flex-row gap-2 w-full tablet:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      className="w-full tablet:w-auto"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading} className="w-full tablet:w-auto">
                      {loading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          {isEditing ? 'Atualizando...' : 'Salvando...'}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {isEditing ? 'Atualizar Vaga' : 'Salvar Vaga'}
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
