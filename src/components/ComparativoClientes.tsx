import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
import { Vaga, VagaFilter, ComparisonData } from '../types/database'
import { getVagas, getClientes, getSites, getCategorias, getCargos, getCelulas } from '../lib/vagas'
import { X, Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { useThemeClasses } from '../hooks/useThemeClasses'

export default function ComparativoClientes() {
  const { textClasses } = useThemeClasses()
  const [clientes, setClientes] = useState<string[]>([])
  const [allVagas, setAllVagas] = useState<Vaga[]>([])
  const [selectedClientes, setSelectedClientes] = useState<string[]>([])
  const [clientFilters, setClientFilters] = useState<{[cliente: string]: VagaFilter}>({})
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [expandedFilters, setExpandedFilters] = useState<{[cliente: string]: boolean}>({})
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isReloading, setIsReloading] = useState(false)
  
  // Refs para controle de rolagem
  const comparativoRef = useRef<HTMLDivElement>(null)
  const clientHeadersRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Função para rolagem inteligente
  const scrollToClientHeaders = () => {
    console.log('🔄 scrollToClientHeaders chamada')
    
    // Tentar encontrar o container dos cabeçalhos dos clientes
    const clientHeadersContainer = document.querySelector('[data-client-headers="true"]')
    
    if (clientHeadersContainer) {
      const containerRect = clientHeadersContainer.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      console.log('📍 Posição do container:', containerRect.top, 'Window height:', windowHeight)
      
      // Calcular posição para manter os cabeçalhos sempre visíveis
      const scrollPosition = window.scrollY + containerRect.top - 80 // 80px de margem do topo
      
      console.log('🎯 Rolando para posição:', scrollPosition)
      
      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      })
    } else {
      console.log('❌ Não foi possível encontrar container dos cabeçalhos')
    }
  }

  // Função para rolagem após expandir card
  const scrollAfterExpand = (expandedElement: HTMLElement) => {
    console.log('🔄 scrollAfterExpand chamada')
    setTimeout(() => {
      const elementRect = expandedElement.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      console.log('📍 Elemento expandido - top:', elementRect.top, 'bottom:', elementRect.bottom, 'window height:', windowHeight)
      
      // Verificar se os cabeçalhos dos clientes ainda estão visíveis
      const clientHeadersContainer = document.querySelector('[data-client-headers="true"]')
      let headersVisible = true
      
      if (clientHeadersContainer) {
        const headersRect = clientHeadersContainer.getBoundingClientRect()
        headersVisible = headersRect.bottom > 0 && headersRect.top < windowHeight
      }
      
      // Se o elemento expandido não está visível OU os cabeçalhos não estão visíveis
      if (elementRect.bottom > windowHeight || elementRect.top < 0 || !headersVisible) {
        // Calcular posição para manter cabeçalhos visíveis E mostrar o conteúdo expandido
        const scrollPosition = window.scrollY + elementRect.top - 150 // Margem maior para manter cabeçalhos
        
        console.log('🎯 Rolando após expandir para posição:', scrollPosition, 'Headers visíveis:', headersVisible)
        
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        })
      } else {
        console.log('✅ Elemento e cabeçalhos já estão visíveis, não precisa rolar')
      }
    }, 100) // Pequeno delay para permitir animação de expansão
  }

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      try {
        const [clientesData, vagasData] = await Promise.all([
          getClientes(),
          getVagas()
        ])
        if (isMounted) {
          setClientes(clientesData)
          setAllVagas(vagasData)
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      }
    }
    load()
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    // Resetar filtros quando clientes selecionados mudarem
    const newClientFilters: {[cliente: string]: VagaFilter} = {}
    selectedClientes.forEach(cliente => {
      newClientFilters[cliente] = clientFilters[cliente] || {}
    })
    setClientFilters(newClientFilters)
  }, [selectedClientes]) // Removido clientFilters da dependência para evitar loop

  // Rolagem inicial quando clientes são selecionados
  useEffect(() => {
    console.log('👀 useEffect rolagem inicial - selectedClientes:', selectedClientes)
    if (selectedClientes.length > 0) {
      // Limpar timeout anterior se existir
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      
      console.log('⏰ Agendando rolagem em 200ms...')
      // Pequeno delay para permitir renderização dos elementos
      scrollTimeoutRef.current = setTimeout(() => {
        scrollToClientHeaders()
      }, 200)
    }
    
    // Cleanup function
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [selectedClientes])


  const handleClienteSelect = (cliente: string) => {
    if (selectedClientes.includes(cliente)) {
      setSelectedClientes(selectedClientes.filter(c => c !== cliente))
      // Remover filtros do cliente desmarcado
      const newClientFilters = { ...clientFilters }
      delete newClientFilters[cliente]
      setClientFilters(newClientFilters)
    } else if (selectedClientes.length < 3) {
      setSelectedClientes([...selectedClientes, cliente])
    }
  }

  const handleClientFilterChange = (cliente: string, key: keyof VagaFilter, value: string) => {
    const newValue = value === 'all' ? undefined : value
    setClientFilters(prev => ({
      ...prev,
      [cliente]: {
        ...prev[cliente],
        [key]: newValue
      }
    }))
  }

  const clearAllFilters = () => {
    setClientFilters({})
    setSelectedClientes([])
    setExpandedSections(new Set())
    setExpandedFilters({})
    setActiveSection(null)
  }

  const handleReload = async () => {
    setIsReloading(true)
    try {
      console.log('🔄 Recarregando dados da página Comparativo...')
      const [clientesData, vagasData] = await Promise.all([
        getClientes(),
        getVagas()
      ])
      
      setClientes(clientesData)
      setAllVagas(vagasData)
      
      // Resetar todos os estados para uma experiência limpa
      setSelectedClientes([])
      setClientFilters({})
      setExpandedSections(new Set())
      setExpandedFilters({})
      setActiveSection(null)
      
      console.log('✅ Dados recarregados com sucesso:', {
        clientes: clientesData.length,
        vagas: vagasData.length
      })
    } catch (error) {
      console.error('❌ Erro ao recarregar dados:', error)
    } finally {
      setIsReloading(false)
    }
  }

  const clearClientFilters = (cliente: string) => {
    setClientFilters(prev => ({
      ...prev,
      [cliente]: {}
    }))
  }

  const toggleSection = (section: string, event?: React.MouseEvent) => {
    const newExpanded = new Set(expandedSections)
    const isExpanding = !newExpanded.has(section)
    
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
      setActiveSection(null) // Nenhuma seção ativa se fechou
    } else {
      newExpanded.add(section)
      setActiveSection(section) // Definir seção ativa quando expandir
    }
    setExpandedSections(newExpanded)
    
    // Rolagem inteligente ao expandir
    if (isExpanding && event) {
      const targetElement = event.currentTarget as HTMLElement
      scrollAfterExpand(targetElement)
    }
  }

  const toggleFilterExpansion = (cliente: string) => {
    setExpandedFilters(prev => ({
      ...prev,
      [cliente]: !prev[cliente]
    }))
  }

  const getVagasByCliente = (cliente: string) => {
    let filtered = allVagas.filter(vaga => vaga.cliente === cliente)
    const filters = clientFilters[cliente] || {}

    if (filters.site) {
      filtered = filtered.filter(vaga => vaga.site === filters.site)
    }
    if (filters.categoria) {
      filtered = filtered.filter(vaga => vaga.categoria === filters.categoria)
    }
    if (filters.cargo) {
      filtered = filtered.filter(vaga => vaga.cargo === filters.cargo)
    }
    if (filters.celula) {
      filtered = filtered.filter(vaga => vaga.celula === filters.celula)
    }

    return filtered
  }

  const getUniqueValuesForCliente = (cliente: string, field: keyof Vaga, appliedFilters?: VagaFilter) => {
    let vagasCliente = allVagas.filter(vaga => vaga.cliente === cliente)
    
    // Aplicar filtros condicionais em ordem hierárquica
    if (appliedFilters) {
      // 1. Célula é o filtro principal - sempre aplicado primeiro
      if (appliedFilters.celula) {
        vagasCliente = vagasCliente.filter(vaga => vaga.celula === appliedFilters.celula)
      }
      
      // 2. Cargo (depende da célula)
      if (appliedFilters.cargo) {
        vagasCliente = vagasCliente.filter(vaga => vaga.cargo === appliedFilters.cargo)
      }
      
      // 3. Site (depende de célula e cargo)
      if (appliedFilters.site) {
        vagasCliente = vagasCliente.filter(vaga => vaga.site === appliedFilters.site)
      }
      
      // 4. Categoria (depende de célula, cargo e site)
      if (appliedFilters.categoria) {
        vagasCliente = vagasCliente.filter(vaga => vaga.categoria === appliedFilters.categoria)
      }
    }
    
    return [...new Set(vagasCliente.map(vaga => vaga[field]).filter(Boolean))].sort() as string[]
  }

  const renderVagaContent = (vaga: Vaga, section: string) => {
    const sections = {
      'descricao': vaga.descricao_vaga,
      'responsabilidades': vaga.responsabilidades_atribuicoes,
      'requisitos': vaga.requisitos_qualificacoes,
      'salario': vaga.salario,
      'horario': vaga.horario_trabalho,
      'jornada': vaga.jornada_trabalho,
      'beneficios': vaga.beneficios,
      'local': vaga.local_trabalho,
      'etapas': vaga.etapas_processo
    }

    const content = sections[section as keyof typeof sections]
    if (!content) return <span className={textClasses.primary}>Não informado</span>

    return (
      <div className={`text-sm ${textClasses.primary} whitespace-pre-wrap`}>
        {content}
      </div>
    )
  }

  const renderClientFilters = (cliente: string) => {
    const filters = clientFilters[cliente] || {}
    const isExpanded = expandedFilters[cliente] || false

    // Calcular filtros condicionais - CÉLULA é o filtro principal
    const celulasDisponiveis = getUniqueValuesForCliente(cliente, 'celula')
    const cargosDisponiveis = getUniqueValuesForCliente(cliente, 'cargo', { 
      celula: filters.celula 
    })
    const sitesDisponiveis = getUniqueValuesForCliente(cliente, 'site', { 
      celula: filters.celula,
      cargo: filters.cargo 
    })
    const categoriasDisponiveis = getUniqueValuesForCliente(cliente, 'categoria', { 
      celula: filters.celula,
      cargo: filters.cargo,
      site: filters.site 
    })

    return (
      <Card className="mb-4">
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleFilterExpansion(cliente)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filtros para {cliente}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  clearClientFilters(cliente)
                }}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Limpar
              </Button>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent>
            <div className="space-y-4">
              {/* Célula - Filtro Principal */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  Célula
                  <span className="ml-2 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">Principal</span>
                </label>
                <Select 
                  value={filters.celula || 'all'} 
                  onValueChange={(value) => {
                    const newValue = value === 'all' ? undefined : value
                    // Limpar TODOS os filtros dependentes quando célula muda
                    setClientFilters(prev => ({
                      ...prev,
                      [cliente]: {
                        celula: newValue,
                        cargo: undefined,
                        site: undefined,
                        categoria: undefined
                      }
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Células</SelectItem>
                    {celulasDisponiveis.map(celula => (
                      <SelectItem key={celula} value={celula}>{celula}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cargo - Depende da Célula */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  Cargo
                  <span className="ml-2 px-2 py-1 text-xs bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">Depende da Célula</span>
                </label>
                <Select 
                  value={filters.cargo || 'all'} 
                  onValueChange={(value) => {
                    const newValue = value === 'all' ? undefined : value
                    // Limpar filtros dependentes quando cargo muda
                    setClientFilters(prev => ({
                      ...prev,
                      [cliente]: {
                        ...prev[cliente],
                        cargo: newValue,
                        site: undefined,
                        categoria: undefined
                      }
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Cargos</SelectItem>
                    {cargosDisponiveis.length > 0 ? (
                      cargosDisponiveis.map(cargo => (
                        <SelectItem key={cargo} value={cargo}>{cargo}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-data" disabled>
                        {filters.celula ? 'Nenhum cargo disponível para esta célula' : 'Selecione uma célula primeiro'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Site - Depende da Célula e Cargo */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  Site
                  <span className="ml-2 px-2 py-1 text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full">Depende da Célula + Cargo</span>
                </label>
                <Select 
                  value={filters.site || 'all'} 
                  onValueChange={(value) => {
                    const newValue = value === 'all' ? undefined : value
                    // Limpar filtros dependentes quando site muda
                    setClientFilters(prev => ({
                      ...prev,
                      [cliente]: {
                        ...prev[cliente],
                        site: newValue,
                        categoria: undefined
                      }
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Sites</SelectItem>
                    {sitesDisponiveis.length > 0 ? (
                      sitesDisponiveis.map(site => (
                        <SelectItem key={site} value={site}>{site}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-data" disabled>
                        {filters.celula || filters.cargo ? 'Nenhum site disponível' : 'Selecione célula e cargo primeiro'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Categoria - Depende de todos os outros */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  Categoria
                  <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Depende de todos</span>
                </label>
                <Select 
                  value={filters.categoria || 'all'} 
                  onValueChange={(value) => handleClientFilterChange(cliente, 'categoria', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    {categoriasDisponiveis.length > 0 ? (
                      categoriasDisponiveis.map(categoria => (
                        <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-data" disabled>
                        {filters.celula || filters.cargo || filters.site ? 'Nenhuma categoria disponível' : 'Selecione outros filtros primeiro'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-3 tablet:gap-4">
        <div>
          <h1 className="text-2xl tablet:text-3xl laptop:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent page-title">
            Comparativo de Clientes
          </h1>
          <p className="page-subtitle text-sm tablet:text-base laptop:text-lg">
            Compare vagas entre diferentes clientes
          </p>
          {activeSection && (
            <div className="mt-2 inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20">
              <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></div>
              <span className="hidden tablet:inline">Seção ativa: </span>
              {
                {
                  'descricao': 'Descrição da Oportunidade',
                  'responsabilidades': 'Responsabilidades e Atribuições',
                  'requisitos': 'Requisitos e Qualificações',
                  'salario': 'Salário',
                  'horario': 'Horário de Trabalho',
                  'jornada': 'Jornada de Trabalho',
                  'beneficios': 'Benefícios',
                  'local': 'Local de Trabalho',
                  'etapas': 'Etapas do Processo'
                }[activeSection] || activeSection
              }
            </div>
          )}
        </div>
        <div className="flex flex-col tablet:flex-row items-stretch tablet:items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleReload}
            disabled={isReloading}
            className="flex items-center gap-2"
          >
            <RotateCcw className={`h-4 w-4 ${isReloading ? 'animate-spin' : ''}`} />
            {isReloading ? 'Recarregando...' : 'Recarregar'}
          </Button>
          <Button variant="outline" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Seleção de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Clientes para Comparação</CardTitle>
          <CardDescription>
            Escolha até 3 clientes para comparar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {clientes.map(cliente => (
              <Button
                key={cliente}
                variant={selectedClientes.includes(cliente) ? "default" : "outline"}
                onClick={() => handleClienteSelect(cliente)}
                disabled={!selectedClientes.includes(cliente) && selectedClientes.length >= 3}
              >
                {cliente}
                {selectedClientes.includes(cliente) && (
                  <X className="h-4 w-4 ml-2" />
                )}
              </Button>
            ))}
          </div>
          {selectedClientes.length === 0 && (
            <p className="text-muted-foreground text-sm mt-2">
              Selecione pelo menos um cliente para comparar
            </p>
          )}
        </CardContent>
      </Card>

      {/* Comparativo */}
      {selectedClientes.length > 0 && (
        <div ref={comparativoRef} className="space-y-4">
          {/* Layout em Colunas com Filtros Acima */}
          <div data-client-headers="true" className="grid grid-cols-1 tablet:grid-cols-2 laptop-lg:grid-cols-3 gap-4 tablet:gap-6">
            {selectedClientes.map(cliente => {
              const vagasCliente = getVagasByCliente(cliente)
              return (
                <div key={cliente} className="space-y-3">
                  {/* Filtros para este Cliente */}
                  {renderClientFilters(cliente)}

                  {/* Header da Coluna */}
                  <Card 
                    ref={selectedClientes.indexOf(cliente) === 0 ? clientHeadersRef : null} 
                    data-client-header={selectedClientes.indexOf(cliente) === 0 ? "true" : "false"}
                    className="py-2 border-2 border-primary/20 bg-primary/5 shadow-sm"
                  >
                    <CardHeader className="py-3">
                      <CardTitle className="text-center text-base font-semibold text-foreground">{cliente}</CardTitle>
                      <CardDescription className="text-center text-sm text-muted-foreground">
                        {vagasCliente.length} vaga(s) encontrada(s)
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  {/* Cards Expansíveis */}
                  {vagasCliente.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <p className="text-muted-foreground">
                          Nenhuma vaga encontrada para este cliente
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      {[
                        { key: 'descricao', title: 'Descrição da Oportunidade' },
                        { key: 'responsabilidades', title: 'Responsabilidades e Atribuições' },
                        { key: 'requisitos', title: 'Requisitos e Qualificações' },
                        { key: 'salario', title: 'Salário' },
                        { key: 'horario', title: 'Horário de Trabalho' },
                        { key: 'jornada', title: 'Jornada de Trabalho' },
                        { key: 'beneficios', title: 'Benefícios' },
                        { key: 'local', title: 'Local de Trabalho' },
                        { key: 'etapas', title: 'Etapas do Processo' }
                      ].map(section => {
                        const isExpanded = expandedSections.has(section.key)
                        const isActive = activeSection === section.key
                        const isInactive = activeSection !== null && activeSection !== section.key
                        
                        return (
                          <Card 
                            key={section.key} 
                            className={`transition-all duration-300 ${
                              isActive 
                                ? 'ring-2 ring-primary shadow-lg scale-[1.02]' 
                                : isInactive 
                                  ? 'opacity-40 grayscale-[0.3]' 
                                  : 'hover:shadow-md'
                            }`}
                          >
                            <CardHeader 
                              className={`cursor-pointer transition-colors py-3 ${
                                isActive 
                                  ? 'bg-primary/5' 
                                  : 'hover:bg-gray-50'
                              }`}
                              onClick={(e) => toggleSection(section.key, e)}
                            >
                              <div className="flex items-center justify-between">
                                <CardTitle className={`text-sm ${textClasses.primary} transition-colors ${
                                  isActive ? 'text-primary font-semibold' : ''
                                }`}>
                                  {section.title}
                                </CardTitle>
                                <div className={`transition-colors ${
                                  isActive ? 'text-primary' : ''
                                }`}>
                                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </div>
                              </div>
                            </CardHeader>
                            {isExpanded && (
                              <CardContent className={`transition-all duration-300 ${
                                isActive ? 'bg-primary/5' : ''
                              }`}>
                                {vagasCliente.map((vaga, index) => (
                                  <div key={vaga.id} className="mb-4 last:mb-0">
                                    {vagasCliente.length > 1 && (
                                      <div className={`text-xs ${textClasses.secondary} mb-2 font-medium`}>
                                        Oportunidade {index + 1}: {vaga.cargo} - {vaga.celula}
                                      </div>
                                    )}
                                    {renderVagaContent(vaga, section.key)}
                                  </div>
                                ))}
                              </CardContent>
                            )}
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
