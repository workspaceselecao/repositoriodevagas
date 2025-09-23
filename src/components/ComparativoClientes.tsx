import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
import { Vaga, VagaFilter, ComparisonData } from '../types/database'
import { getVagas, getClientes, getSites, getCategorias, getCargos, getProdutos } from '../lib/vagas'
import { X, Filter, RotateCcw } from 'lucide-react'

export default function ComparativoClientes() {
  const [clientes, setClientes] = useState<string[]>([])
  const [sites, setSites] = useState<string[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [cargos, setCargos] = useState<string[]>([])
  const [produtos, setProdutos] = useState<string[]>([])
  const [vagas, setVagas] = useState<Vaga[]>([])
  
  const [selectedClientes, setSelectedClientes] = useState<string[]>([])
  const [filters, setFilters] = useState<VagaFilter>({})
  const [comparisonData, setComparisonData] = useState<ComparisonData>({ clientes: [], vagas: [] })
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterVagas()
  }, [filters])

  const loadData = async () => {
    try {
      const [clientesData, sitesData, categoriasData, cargosData, produtosData, vagasData] = await Promise.all([
        getClientes(),
        getSites(),
        getCategorias(),
        getCargos(),
        getProdutos(),
        getVagas()
      ])

      setClientes(clientesData)
      setSites(sitesData)
      setCategorias(categoriasData)
      setCargos(cargosData)
      setProdutos(produtosData)
      setVagas(vagasData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const filterVagas = () => {
    let filtered = vagas

    if (filters.cliente) {
      filtered = filtered.filter(vaga => vaga.cliente === filters.cliente)
    }
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

    const clientesUnicos = [...new Set(filtered.map(v => v.cliente))]
    setComparisonData({ clientes: clientesUnicos, vagas: filtered })
  }

  const handleClienteSelect = (cliente: string) => {
    if (selectedClientes.includes(cliente)) {
      setSelectedClientes(selectedClientes.filter(c => c !== cliente))
    } else {
      setSelectedClientes([...selectedClientes, cliente])
    }
  }

  const handleFilterChange = (key: keyof VagaFilter, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }))
  }

  const clearFilters = () => {
    setFilters({})
    setSelectedClientes([])
    setExpandedSections(new Set())
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

  const getVagasByCliente = (cliente: string) => {
    return comparisonData.vagas.filter(vaga => vaga.cliente === cliente)
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
        <Button variant="outline" onClick={clearFilters}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Limpar Filtros
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros Avançados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <Select value={filters.cliente || 'all'} onValueChange={(value) => handleFilterChange('cliente', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Clientes</SelectItem>
                  {clientes.map(cliente => (
                    <SelectItem key={cliente} value={cliente}>{cliente}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Site</label>
              <Select value={filters.site || 'all'} onValueChange={(value) => handleFilterChange('site', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Sites</SelectItem>
                  {sites.map(site => (
                    <SelectItem key={site} value={site}>{site}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={filters.categoria || 'all'} onValueChange={(value) => handleFilterChange('categoria', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categorias.map(categoria => (
                    <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cargo</label>
              <Select value={filters.cargo || 'all'} onValueChange={(value) => handleFilterChange('cargo', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Cargos</SelectItem>
                  {cargos.map(cargo => (
                    <SelectItem key={cargo} value={cargo}>{cargo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Produto</label>
              <Select value={filters.produto || 'all'} onValueChange={(value) => handleFilterChange('produto', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Produtos</SelectItem>
                  {produtos.map(produto => (
                    <SelectItem key={produto} value={produto}>{produto}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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
            {comparisonData.clientes.map(cliente => (
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {selectedClientes.map(cliente => {
            const vagasCliente = getVagasByCliente(cliente)
            return (
              <Card key={cliente} className="h-fit">
                <CardHeader>
                  <CardTitle className="text-center text-lg">{cliente}</CardTitle>
                  <CardDescription className="text-center">
                    {vagasCliente.length} vaga(s) encontrada(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {vagasCliente.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      Nenhuma vaga encontrada para este cliente
                    </p>
                  ) : (
                    <Accordion type="multiple" className="space-y-2">
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
                      ].map(section => (
                        <AccordionItem key={section.key} value={section.key}>
                          <AccordionTrigger 
                            className="text-sm"
                            onClick={() => toggleSection(section.key)}
                          >
                            {section.title}
                          </AccordionTrigger>
                          <AccordionContent>
                            {vagasCliente.map((vaga, index) => (
                              <div key={vaga.id} className="mb-4 last:mb-0">
                                {vagasCliente.length > 1 && (
                                  <div className="text-xs text-gray-500 mb-2">
                                    Vaga {index + 1}: {vaga.cargo} - {vaga.produto}
                                  </div>
                                )}
                                {renderVagaContent(vaga, section.key)}
                              </div>
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
