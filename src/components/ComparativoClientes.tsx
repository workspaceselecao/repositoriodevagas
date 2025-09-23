import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
import { Vaga, VagaFilter, ComparisonData } from '../types/database'
import { getVagas, getClientes, getSites, getCategorias, getCargos, getProdutos } from '../lib/vagas'
import { X, Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'

export default function ComparativoClientes() {
  const [clientes, setClientes] = useState<string[]>([])
  const [allVagas, setAllVagas] = useState<Vaga[]>([])
  const [selectedClientes, setSelectedClientes] = useState<string[]>([])
  const [clientFilters, setClientFilters] = useState<{[cliente: string]: VagaFilter}>({})
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [expandedFilters, setExpandedFilters] = useState<{[cliente: string]: boolean}>({})

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Resetar filtros quando clientes selecionados mudarem
    const newClientFilters: {[cliente: string]: VagaFilter} = {}
    selectedClientes.forEach(cliente => {
      newClientFilters[cliente] = clientFilters[cliente] || {}
    })
    setClientFilters(newClientFilters)
  }, [selectedClientes])

  const loadData = async () => {
    try {
      const [clientesData, vagasData] = await Promise.all([
        getClientes(),
        getVagas()
      ])

      setClientes(clientesData)
      setAllVagas(vagasData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

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
    setClientFilters(prev => ({
      ...prev,
      [cliente]: {
        ...prev[cliente],
        [key]: value === 'all' ? undefined : value
      }
    }))
  }

  const clearAllFilters = () => {
    setClientFilters({})
    setSelectedClientes([])
    setExpandedSections(new Set())
    setExpandedFilters({})
  }

  const clearClientFilters = (cliente: string) => {
    setClientFilters(prev => ({
      ...prev,
      [cliente]: {}
    }))
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
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
    if (filters.produto) {
      filtered = filtered.filter(vaga => vaga.produto === filters.produto)
    }

    return filtered
  }

  const getUniqueValuesForCliente = (cliente: string, field: keyof Vaga, appliedFilters?: VagaFilter) => {
    let vagasCliente = allVagas.filter(vaga => vaga.cliente === cliente)
    
    // Aplicar filtros condicionais
    if (appliedFilters) {
      if (appliedFilters.site) {
        vagasCliente = vagasCliente.filter(vaga => vaga.site === appliedFilters.site)
      }
      if (appliedFilters.categoria) {
        vagasCliente = vagasCliente.filter(vaga => vaga.categoria === appliedFilters.categoria)
      }
      if (appliedFilters.cargo) {
        vagasCliente = vagasCliente.filter(vaga => vaga.cargo === appliedFilters.cargo)
      }
      if (appliedFilters.produto) {
        vagasCliente = vagasCliente.filter(vaga => vaga.produto === appliedFilters.produto)
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
    if (!content) return 'Não informado'

    return (
      <div className="text-sm text-gray-700 whitespace-pre-wrap">
        {content}
      </div>
    )
  }

  const renderClientFilters = (cliente: string) => {
    const filters = clientFilters[cliente] || {}
    const isExpanded = expandedFilters[cliente] || false

    // Calcular filtros condicionais
    const sitesDisponiveis = getUniqueValuesForCliente(cliente, 'site')
    const categoriasDisponiveis = getUniqueValuesForCliente(cliente, 'categoria', { site: filters.site })
    const cargosDisponiveis = getUniqueValuesForCliente(cliente, 'cargo', { 
      site: filters.site, 
      categoria: filters.categoria 
    })
    const produtosDisponiveis = getUniqueValuesForCliente(cliente, 'produto', { 
      site: filters.site, 
      categoria: filters.categoria, 
      cargo: filters.cargo 
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
              {/* Site */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Site</label>
                <Select 
                  value={filters.site || 'all'} 
                  onValueChange={(value) => {
                    handleClientFilterChange(cliente, 'site', value)
                    // Limpar filtros dependentes quando site muda
                    if (value !== 'all') {
                      setClientFilters(prev => ({
                        ...prev,
                        [cliente]: {
                          site: value === 'all' ? undefined : value,
                          categoria: undefined,
                          cargo: undefined,
                          produto: undefined
                        }
                      }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Sites</SelectItem>
                    {sitesDisponiveis.map(site => (
                      <SelectItem key={site} value={site}>{site}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Select 
                  value={filters.categoria || 'all'} 
                  onValueChange={(value) => {
                    handleClientFilterChange(cliente, 'categoria', value)
                    // Limpar filtros dependentes quando categoria muda
                    if (value !== 'all') {
                      setClientFilters(prev => ({
                        ...prev,
                        [cliente]: {
                          ...prev[cliente],
                          categoria: value === 'all' ? undefined : value,
                          cargo: undefined,
                          produto: undefined
                        }
                      }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    {categoriasDisponiveis.map(categoria => (
                      <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cargo */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Cargo</label>
                <Select 
                  value={filters.cargo || 'all'} 
                  onValueChange={(value) => {
                    handleClientFilterChange(cliente, 'cargo', value)
                    // Limpar filtros dependentes quando cargo muda
                    if (value !== 'all') {
                      setClientFilters(prev => ({
                        ...prev,
                        [cliente]: {
                          ...prev[cliente],
                          cargo: value === 'all' ? undefined : value,
                          produto: undefined
                        }
                      }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Cargos</SelectItem>
                    {cargosDisponiveis.map(cargo => (
                      <SelectItem key={cargo} value={cargo}>{cargo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Produto */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Produto</label>
                <Select 
                  value={filters.produto || 'all'} 
                  onValueChange={(value) => handleClientFilterChange(cliente, 'produto', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Produtos</SelectItem>
                    {produtosDisponiveis.map(produto => (
                      <SelectItem key={produto} value={produto}>{produto}</SelectItem>
                    ))}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comparativo de Clientes</h1>
          <p className="text-gray-600 mt-2">
            Compare vagas entre diferentes clientes
          </p>
        </div>
        <Button variant="outline" onClick={clearAllFilters}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Limpar Filtros
        </Button>
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
            <p className="text-gray-500 text-sm mt-2">
              Selecione pelo menos um cliente para comparar
            </p>
          )}
        </CardContent>
      </Card>

      {/* Comparativo */}
      {selectedClientes.length > 0 && (
        <div className="space-y-6">
          {/* Layout em Colunas com Filtros Acima */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {selectedClientes.map(cliente => {
              const vagasCliente = getVagasByCliente(cliente)
              return (
                <div key={cliente} className="space-y-4">
                  {/* Filtros para este Cliente */}
                  {renderClientFilters(cliente)}

                  {/* Header da Coluna */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center text-lg">{cliente}</CardTitle>
                      <CardDescription className="text-center">
                        {vagasCliente.length} vaga(s) encontrada(s)
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  {/* Cards Expansíveis */}
                  {vagasCliente.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <p className="text-gray-500">
                          Nenhuma vaga encontrada para este cliente
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {[
                        { key: 'descricao', title: 'Descrição da Vaga' },
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
                        return (
                          <Card key={section.key} className="transition-all duration-200">
                            <CardHeader 
                              className="cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => toggleSection(section.key)}
                            >
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-sm">{section.title}</CardTitle>
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </div>
                            </CardHeader>
                            {isExpanded && (
                              <CardContent>
                                {vagasCliente.map((vaga, index) => (
                                  <div key={vaga.id} className="mb-4 last:mb-0">
                                    {vagasCliente.length > 1 && (
                                      <div className="text-xs text-gray-500 mb-2 font-medium">
                                        Vaga {index + 1}: {vaga.cargo} - {vaga.produto}
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
