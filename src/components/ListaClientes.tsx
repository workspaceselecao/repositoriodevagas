import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Badge } from './ui/badge'
import { Vaga } from '../types/database'
import { deleteVaga } from '../lib/vagas'
import { exportToExcel } from '../lib/backup'
import { Search, Download, Plus, Users, Building2, TrendingUp, Eye, X, ChevronLeft, ChevronRight, RefreshCw, Filter, Clock, Hash, MapPin, DollarSign, Calendar, User, Briefcase, Globe, Tag, Star, ArrowUpDown } from 'lucide-react'
import VagaTemplate from './VagaTemplate'
import { useAuth } from '../contexts/AuthContext'
import { useRHPermissions } from '../hooks/useRHPermissions'
import { useVagas } from '../hooks/useCacheData'
import { useCache } from '../contexts/CacheContext'
import { useSimpleVagas } from '../hooks/useSimpleVagas'
import { useThemeClasses } from '../hooks/useThemeClasses'
// import { toast } from 'sonner' // Comentado temporariamente

interface SearchFilter {
  field: string
  value: string
  label: string
}

interface SearchSuggestion {
  type: 'field' | 'value' | 'operator'
  label: string
  value: string
  icon: string
  description?: string
}

export default function ListaClientes() {
  const [searchTerm, setSearchTerm] = useState('')
  const [advancedSearch, setAdvancedSearch] = useState(false)
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [focusedVaga, setFocusedVaga] = useState<Vaga | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  
  const { user } = useAuth()
  const { canEdit, canDelete, loading: permissionsLoading } = useRHPermissions()
  const navigate = useNavigate()
  
  // Usar cache simples em desenvolvimento para evitar problemas
  const isDev = import.meta.env.DEV
  const simpleVagas = useSimpleVagas()
  const complexVagas = useVagas()
  const { removeVaga, refreshVagas } = useCache()
  
  // Escolher qual hook usar baseado no ambiente
  const { vagas, loading, lastUpdated } = isDev ? simpleVagas : complexVagas
  const { textClasses } = useThemeClasses()

  // Campos disponíveis para busca
  const searchFields = [
    { key: 'cliente', label: 'Cliente', icon: '🏢' },
    { key: 'cargo', label: 'Cargo', icon: '💼' },
    { key: 'site', label: 'Site', icon: '🌐' },
    { key: 'celula', label: 'Célula', icon: '📊' },
    { key: 'categoria', label: 'Categoria', icon: '📂' },
    { key: 'titulo', label: 'Título', icon: '📝' },
    { key: 'descricao_vaga', label: 'Descrição', icon: '📄' },
    { key: 'responsabilidades_atribuicoes', label: 'Responsabilidades', icon: '✅' },
    { key: 'requisitos_qualificacoes', label: 'Requisitos', icon: '🎓' },
    { key: 'salario', label: 'Salário', icon: '💰' },
    { key: 'horario_trabalho', label: 'Horário', icon: '⏰' },
    { key: 'jornada_trabalho', label: 'Jornada', icon: '📅' },
    { key: 'beneficios', label: 'Benefícios', icon: '🎁' },
    { key: 'local_trabalho', label: 'Local', icon: '📍' },
    { key: 'etapas_processo', label: 'Etapas', icon: '🔄' }
  ]

  // Função para buscar em todos os campos de uma vaga
  const searchInVaga = (vaga: Vaga, searchText: string): boolean => {
    const searchLower = searchText.toLowerCase()
    
    return searchFields.some(field => {
      const fieldValue = vaga[field.key as keyof Vaga]
      if (!fieldValue) return false
      
      return fieldValue.toString().toLowerCase().includes(searchLower)
    })
  }

  // Função para busca avançada com filtros específicos
  const advancedSearchInVaga = (vaga: Vaga, filters: SearchFilter[]): boolean => {
    if (filters.length === 0) return true
    
    return filters.every(filter => {
      const fieldValue = vaga[filter.field as keyof Vaga]
      if (!fieldValue) return false
      
      return fieldValue.toString().toLowerCase().includes(filter.value.toLowerCase())
    })
  }

  // Gerar sugestões baseadas no texto de busca
  const generateSuggestions = (searchText: string): SearchSuggestion[] => {
    if (!searchText.trim()) return []
    
    const suggestions: SearchSuggestion[] = []
    const searchLower = searchText.toLowerCase()
    
    // Sugestões de campos
    searchFields.forEach(field => {
      if (field.label.toLowerCase().includes(searchLower) || field.key.toLowerCase().includes(searchLower)) {
        suggestions.push({
          type: 'field',
          label: `Campo: ${field.label}`,
          value: `${field.key}:`,
          icon: field.icon,
          description: `Buscar no campo ${field.label}`
        })
      }
    })
    
    // Sugestões de valores únicos
    const uniqueValues = new Set<string>()
    vagas.forEach(vaga => {
      searchFields.forEach(field => {
        const value = vaga[field.key as keyof Vaga]
        if (value && value.toString().toLowerCase().includes(searchLower)) {
          uniqueValues.add(value.toString())
        }
      })
    })
    
    Array.from(uniqueValues).slice(0, 10).forEach(value => {
      suggestions.push({
        type: 'value',
        label: value,
        value: value,
        icon: '🔍',
        description: 'Buscar por este valor'
      })
    })
    
    // Sugestões de histórico
    searchHistory.forEach(historyItem => {
      if (historyItem.toLowerCase().includes(searchLower)) {
        suggestions.push({
          type: 'value',
          label: `Histórico: ${historyItem}`,
          value: historyItem,
          icon: '🕒',
          description: 'Busca anterior'
        })
      }
    })
    
    return suggestions.slice(0, 15)
  }

  // Filtrar vagas baseado no termo de busca
  const filteredVagas = useMemo(() => {
    if (!searchTerm && searchFilters.length === 0) {
      return vagas
    }

    let result = vagas

    // Busca simples
    if (searchTerm && !advancedSearch) {
      result = result.filter(vaga => searchInVaga(vaga, searchTerm))
    }

    // Busca avançada com filtros
    if (advancedSearch && searchFilters.length > 0) {
      result = result.filter(vaga => advancedSearchInVaga(vaga, searchFilters))
    }

    return result
  }, [vagas, searchTerm, searchFilters, advancedSearch])

  // Estatísticas de busca
  const searchStats = useMemo(() => {
    const totalVagas = vagas.length
    const filteredCount = filteredVagas.length
    const searchPercentage = totalVagas > 0 ? ((filteredCount / totalVagas) * 100).toFixed(1) : '0'
    
    return {
      total: totalVagas,
      filtered: filteredCount,
      percentage: searchPercentage,
      isFiltered: searchTerm || searchFilters.length > 0
    }
  }, [vagas.length, filteredVagas.length, searchTerm, searchFilters])

  // Calcular paginação
  const totalItems = filteredVagas.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedVagas = filteredVagas.slice(startIndex, endIndex)

  // Resetar página quando o filtro ou quantidade de itens mudar
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, itemsPerPage, searchFilters])

  // Atualizar sugestões quando o termo de busca muda
  useEffect(() => {
    const newSuggestions = generateSuggestions(searchTerm)
    setSuggestions(newSuggestions)
    setShowSuggestions(searchTerm.length > 0 && newSuggestions.length > 0)
    setSelectedSuggestionIndex(-1)
  }, [searchTerm, vagas])

  // Carregar histórico de busca do localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('vagas-search-history')
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.warn('Erro ao carregar histórico de busca:', error)
      }
    }
  }, [])

  // Funções de busca
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    
    // Adicionar ao histórico se não estiver vazio
    if (term.trim()) {
      const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 10)
      setSearchHistory(newHistory)
      localStorage.setItem('vagas-search-history', JSON.stringify(newHistory))
    }
    
    setShowSuggestions(false)
  }

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'field') {
      setSearchTerm(suggestion.value)
      searchInputRef.current?.focus()
    } else {
      handleSearch(suggestion.value)
    }
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex])
        } else {
          handleSearch(searchTerm)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }

  const clearSearch = () => {
    setSearchTerm('')
    setSearchFilters([])
    setAdvancedSearch(false)
    setShowSuggestions(false)
    searchInputRef.current?.focus()
  }

  const toggleAdvancedSearch = () => {
    setAdvancedSearch(!advancedSearch)
    if (advancedSearch) {
      setSearchFilters([])
    }
    setShowSuggestions(false)
  }

  const addSearchFilter = () => {
    if (!searchTerm.trim()) return
    
    // Parse do termo de busca para filtros
    const parts = searchTerm.split(':')
    if (parts.length === 2) {
      const field = parts[0].trim()
      const value = parts[1].trim()
      const fieldInfo = searchFields.find(f => f.key === field)
      
      if (fieldInfo && value) {
        setSearchFilters(prev => [...prev, {
          field,
          value,
          label: fieldInfo.label
        }])
        setSearchTerm('')
        // toast.success(`Filtro adicionado: ${fieldInfo.label}`)
      }
    } else {
      // Busca simples - adicionar como filtro geral
      setSearchFilters(prev => [...prev, {
        field: 'all',
        value: searchTerm,
        label: 'Busca Geral'
      }])
      setSearchTerm('')
      // toast.success('Filtro de busca geral adicionado')
    }
  }

  const removeSearchFilter = (index: number) => {
    setSearchFilters(prev => prev.filter((_, i) => i !== index))
    // toast.success('Filtro removido')
  }

  const clearAllFilters = () => {
    setSearchFilters([])
    setSearchTerm('')
    setAdvancedSearch(false)
    // toast.success('Todos os filtros foram removidos')
  }

  // Funções de navegação da paginação
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const goToPreviousPage = () => {
    goToPage(currentPage - 1)
  }

  const goToNextPage = () => {
    goToPage(currentPage + 1)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  const handleEdit = (vaga: Vaga) => {
    navigate(`/dashboard/nova-vaga/${vaga.id}`)
  }

  const handleViewVaga = (vaga: Vaga) => {
    navigate(`/dashboard/vaga/${vaga.id}`)
  }

  const handleFocusVaga = (vaga: Vaga) => {
    setFocusedVaga(vaga)
    setIsFullscreen(true) // Abrir automaticamente em fullscreen
  }

  const handleCloseFocus = () => {
    setFocusedVaga(null)
    setIsFullscreen(false)
  }


  const handleDelete = async (id: string) => {
    if (user?.role !== 'ADMIN') {
      alert('Apenas administradores podem excluir vagas')
      return
    }

    if (confirm('Tem certeza que deseja excluir esta vaga?')) {
      try {
        const success = await deleteVaga(id)
        if (success) {
          // Remover do cache
          removeVaga(id)
        } else {
          alert('Erro ao excluir vaga')
        }
      } catch (error) {
        console.error('Erro ao excluir vaga:', error)
        alert('Erro ao excluir vaga')
      }
    }
  }

  const handleExport = async () => {
    try {
      await exportToExcel(vagas, `vagas_${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (error) {
      console.error('Erro ao exportar:', error)
      alert('Erro ao exportar dados')
    }
  }

  const handleRefresh = async () => {
    if (isRefreshing) return // Evitar múltiplas chamadas simultâneas
    
    setIsRefreshing(true)
    try {
      console.log('🔄 Recarregando dados da página Oportunidades...')
      
      // Usar o método de refresh apropriado baseado no ambiente
      if (isDev) {
        await simpleVagas.refresh()
      } else {
        await refreshVagas()
      }
      
      // Aguardar um pouco para garantir que o estado foi atualizado
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log('✅ Dados recarregados com sucesso')
      
      // Mostrar feedback visual de sucesso
      const button = document.querySelector('[data-refresh-button]') as HTMLElement
      if (button) {
        button.style.backgroundColor = '#10b981' // Verde
        setTimeout(() => {
          button.style.backgroundColor = ''
        }, 1000)
      }
      
    } catch (error) {
      console.error('❌ Erro ao recarregar dados:', error)
      
      // Mostrar feedback visual de erro
      const button = document.querySelector('[data-refresh-button]') as HTMLElement
      if (button) {
        button.style.backgroundColor = '#ef4444' // Vermelho
        setTimeout(() => {
          button.style.backgroundColor = ''
        }, 1000)
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatText = (text: string | undefined, maxLength: number = 100) => {
    if (!text) return 'Não informado'
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground font-body">Carregando oportunidades...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-3 tablet:gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl tablet:text-3xl laptop:text-4xl font-bold font-heading bg-gradient-to-r from-repovagas-primary to-repovagas-primary/70 bg-clip-text text-transparent page-title">
            Repositório de Oportunidades
          </h1>
          <p className="page-subtitle text-sm tablet:text-base laptop:text-lg font-body text-repovagas-text-secondary">
            Gerencie todas as oportunidades profissionais disponíveis
            {lastUpdated && (
              <span className="block text-xs text-muted-foreground mt-1">
                Última atualização: {new Date(lastUpdated).toLocaleString('pt-BR')}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col tablet:flex-row gap-2 tablet:gap-3">
          <Button 
            onClick={() => navigate('/dashboard/nova-vaga')} 
            size="sm" 
            className="h-8 tablet:h-9 btn-text transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2 icon-primary transition-transform duration-200 hover:rotate-90" />
            Nova Oportunidade
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExport} 
            size="sm" 
            className="h-8 tablet:h-9 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md"
          >
            <Download className="h-4 w-4 mr-2 transition-transform duration-200 hover:scale-110" />
            <span className="hidden tablet:inline">Exportar Excel</span>
            <span className="tablet:hidden">Exportar</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={isRefreshing} 
            size="sm" 
            data-refresh-button
            className="h-8 tablet:h-9 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md"
          >
            <RefreshCw className={`h-4 w-4 mr-2 transition-transform duration-300 ${isRefreshing ? 'animate-spin' : 'hover:rotate-180'}`} />
            <span className={isRefreshing ? 'opacity-70' : ''}>
              {isRefreshing ? 'Atualizando...' : 'Atualizar'}
            </span>
          </Button>
        </div>
      </div>

      {/* Advanced Search */}
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Busca Avançada
              </CardTitle>
              <CardDescription>
                Busque em todas as informações das vagas com filtros inteligentes
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={advancedSearch ? "default" : "outline"}
                size="sm"
                onClick={toggleAdvancedSearch}
                className="transition-all duration-200"
              >
                <Filter className="h-4 w-4 mr-1" />
                {advancedSearch ? 'Modo Simples' : 'Modo Avançado'}
              </Button>
              {searchStats.isFiltered && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Barra de Pesquisa Principal */}
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  ref={searchInputRef}
                  placeholder={
                    advancedSearch 
                      ? "Digite 'campo:valor' para filtros específicos (ex: cliente:atento, salario:5000)"
                      : "Busque em todas as informações das vagas..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSuggestions(searchTerm.length > 0 && suggestions.length > 0)}
                  className="pl-10 pr-10 h-12 text-base"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              {advancedSearch ? (
                <Button
                  onClick={addSearchFilter}
                  disabled={!searchTerm.trim()}
                  className="px-6"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Filtro
                </Button>
              ) : (
                <Button
                  onClick={() => handleSearch(searchTerm)}
                  disabled={!searchTerm.trim()}
                  className="px-6"
                >
                  <Search className="h-4 w-4 mr-1" />
                  Buscar
                </Button>
              )}
            </div>

            {/* Sugestões */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
              >
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedSuggestionIndex === index ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                    }`}
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <span className="text-lg">{suggestion.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{suggestion.label}</div>
                      {suggestion.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {suggestion.description}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.type === 'field' ? 'Campo' : suggestion.type === 'value' ? 'Valor' : 'Operador'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filtros Ativos (Modo Avançado) */}
          {advancedSearch && searchFilters.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Filtros Ativos:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchFilters.map((filter, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-2 px-3 py-1"
                  >
                    <span className="text-xs">
                      {filter.field === 'all' ? 'Busca Geral' : filter.label}: {filter.value}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
                      onClick={() => removeSearchFilter(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Estatísticas de Busca */}
          {searchStats.isFiltered && (
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {searchStats.filtered} de {searchStats.total} vagas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    {searchStats.percentage}% dos resultados
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSearch}
                className="text-blue-600 border-blue-300 hover:bg-blue-100"
              >
                <X className="h-3 w-3 mr-1" />
                Limpar Busca
              </Button>
            </div>
          )}

          {/* Dicas de Busca */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <Search className="h-3 w-3 text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Busca Simples</div>
                <div className="text-gray-600 dark:text-gray-400">Digite qualquer termo para buscar em todos os campos</div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <Filter className="h-3 w-3 text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Busca Específica</div>
                <div className="text-gray-600 dark:text-gray-400">Use "campo:valor" para buscar em campos específicos</div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <Clock className="h-3 w-3 text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Histórico</div>
                <div className="text-gray-600 dark:text-gray-400">Suas buscas anteriores aparecem como sugestões</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 gap-4 tablet:gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <CardTitle className="text-sm font-semibold field-subtitle">Total de Oportunidades</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalItems}</div>
            <p className="text-sm info-text mt-1">oportunidades cadastradas</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <CardTitle className="text-sm font-semibold text-muted-foreground">Clientes Únicos</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {new Set(vagas.map(v => v.cliente)).size}
            </div>
            <p className="text-sm text-muted-foreground mt-1">empresas parceiras</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <CardTitle className="text-sm font-semibold text-muted-foreground">Sites Ativos</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {new Set(vagas.map(v => v.site)).size}
            </div>
            <p className="text-sm text-muted-foreground mt-1">locais de trabalho</p>
          </CardContent>
        </Card>
      </div>

        {/* Oportunidades List */}
        <div className="space-y-6">
          {paginatedVagas.map((vaga, index) => (
            <VagaTemplate
              key={vaga.id}
              vaga={vaga}
              showActions={user?.role === 'ADMIN' || canEdit || canDelete}
              showEditAction={canEdit}
              showDeleteAction={canDelete}
              showFocusAction={true}
              showDownloadAction={true}
              variantIndex={index}
              onEdit={canEdit ? () => handleEdit(vaga) : undefined}
              onDelete={canDelete ? () => handleDelete(vaga.id) : undefined}
              onFocus={() => handleFocusVaga(vaga)}
            />
          ))}
        </div>

        {/* Controles de Paginação */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Itens por página:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={25}>25</option>
                </select>
              </div>
              <span className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} vagas
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(pageNumber)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

      {filteredVagas.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-contrast-primary text-lg">
            {searchTerm ? 'Nenhuma vaga encontrada com os filtros aplicados' : 'Nenhuma vaga cadastrada'}
          </div>
        </div>
      )}

      {/* Modal de Visualização Focada */}
      <Dialog open={!!focusedVaga} onOpenChange={handleCloseFocus}>
        <DialogContent 
          className={`${isFullscreen ? 'max-w-none w-screen h-screen' : 'max-w-4xl'} p-0`}
          hideCloseButton={isFullscreen}
        >
          <div className={`${isFullscreen ? 'h-screen flex flex-col' : ''}`}>
            {/* Header do Modal */}
            <DialogHeader className={`${isFullscreen ? 'p-6 border-b bg-gradient-to-r from-primary/10 to-primary/5' : 'p-6 border-b'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                    <Eye className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold">
                      Visualização Focada
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      Modo de estudo - apenas esta vaga está visível
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCloseFocus}
                    className="flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Fechar</span>
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* Conteúdo da Oportunidade */}
            <div className={`${isFullscreen ? 'flex-1 overflow-auto p-6' : 'p-6'}`}>
              {focusedVaga && (
                <div className="space-y-6">
                  {/* Informações da Oportunidade */}
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className={`text-lg font-semibold ${textClasses.primary} mb-2`}>
                          {focusedVaga.titulo || focusedVaga.cargo}
                        </h3>
                        <p className={`text-sm ${textClasses.primary}`}>
                          <strong>Cliente:</strong> {focusedVaga.cliente}
                        </p>
                        <p className={`text-sm ${textClasses.primary}`}>
                          <strong>Célula:</strong> {focusedVaga.celula}
                        </p>
                        <p className={`text-sm ${textClasses.primary}`}>
                          <strong>Site:</strong> {focusedVaga.site}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${textClasses.primary}`}>
                          <strong>Categoria:</strong> {focusedVaga.categoria}
                        </p>
                        <p className={`text-sm ${textClasses.primary}`}>
                          <strong>Cargo:</strong> {focusedVaga.cargo}
                        </p>
                        <p className={`text-sm ${textClasses.primary}`}>
                          <strong>Criado em:</strong> {new Date(focusedVaga.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Template da Vaga Expandido */}
                  <VagaTemplate
                    vaga={focusedVaga}
                    showActions={false}
                    variantIndex={0}
                    isExpanded={true}
                  />
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
