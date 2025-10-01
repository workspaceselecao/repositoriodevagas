import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Vaga } from '../types/database'
import { deleteVaga } from '../lib/vagas'
import { exportToExcel } from '../lib/backup'
import { Search, Download, Plus, Users, Building2, TrendingUp, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react'
import VagaTemplate from './VagaTemplate'
import { useAuth } from '../contexts/AuthContext'
import { useVagas } from '../hooks/useCacheData'
import { useCache } from '../contexts/CacheContext'
import { useThemeClasses } from '../hooks/useThemeClasses'

export default function ListaClientes() {
  const [searchTerm, setSearchTerm] = useState('')
  const [focusedVaga, setFocusedVaga] = useState<Vaga | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  const { user } = useAuth()
  const navigate = useNavigate()
  const { vagas, loading } = useVagas()
  const { removeVaga } = useCache()
  const { textClasses } = useThemeClasses()

  // Filtrar vagas baseado no termo de busca
  const filteredVagas = useMemo(() => {
    if (!searchTerm) {
      return vagas
    }

    return vagas.filter(vaga =>
      vaga.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaga.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaga.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaga.celula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vaga.titulo && vaga.titulo.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [vagas, searchTerm])

  // Calcular paginação
  const totalItems = filteredVagas.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedVagas = filteredVagas.slice(startIndex, endIndex)

  // Resetar página quando o filtro ou quantidade de itens mudar
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, itemsPerPage])

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
          <p className="text-muted-foreground">Carregando vagas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent page-title">
            Lista de Vagas
          </h1>
          <p className="page-subtitle text-lg">
            Gerencie todas as vagas de emprego disponíveis
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => navigate('/dashboard/nova-vaga')} size="lg" className="h-12 btn-text">
            <Plus className="h-5 w-5 mr-2 icon-primary" />
            Nova Vaga
          </Button>
          <Button variant="outline" onClick={handleExport} size="lg" className="h-12">
            <Download className="h-5 w-5 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          placeholder="Buscar por cliente, cargo, site ou célula..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-12 text-base"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <CardTitle className="text-sm font-semibold field-subtitle">Total de Vagas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalItems}</div>
            <p className="text-sm info-text mt-1">vagas cadastradas</p>
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

        {/* Vagas List */}
        <div className="space-y-6">
          {paginatedVagas.map((vaga, index) => (
            <VagaTemplate
              key={vaga.id}
              vaga={vaga}
              showActions={true}
              variantIndex={index}
              onEdit={() => handleEdit(vaga)}
              onDelete={() => handleDelete(vaga.id)}
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

            {/* Conteúdo da Vaga */}
            <div className={`${isFullscreen ? 'flex-1 overflow-auto p-6' : 'p-6'}`}>
              {focusedVaga && (
                <div className="space-y-6">
                  {/* Informações da Vaga */}
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
