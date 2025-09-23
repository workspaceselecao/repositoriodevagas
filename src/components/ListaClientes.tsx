import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Vaga } from '../types/database'
import { getVagas, deleteVaga } from '../lib/vagas'
import { exportToExcel } from '../lib/backup'
import { Search, Download, Edit, Trash2, Plus, ChevronDown, ChevronUp, MapPin, Clock, DollarSign, Calendar, Eye, Users, Building2, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function ListaClientes() {
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [filteredVagas, setFilteredVagas] = useState<Vaga[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<{[vagaId: string]: Set<string>}>({})
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadVagas()
  }, [])

  useEffect(() => {
    filterVagas()
  }, [searchTerm, vagas])

  const loadVagas = async () => {
    try {
      setLoading(true)
      const data = await getVagas()
      setVagas(data)
    } catch (error) {
      console.error('Erro ao carregar vagas:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterVagas = () => {
    if (!searchTerm) {
      setFilteredVagas(vagas)
      return
    }

    const filtered = vagas.filter(vaga =>
      vaga.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaga.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaga.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaga.produto.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredVagas(filtered)
  }

  const handleEdit = (vaga: Vaga) => {
    navigate(`/dashboard/editar-vaga/${vaga.id}`)
  }

  const handleViewVaga = (vaga: Vaga) => {
    navigate(`/dashboard/vaga/${vaga.id}`)
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
          setVagas(vagas.filter(vaga => vaga.id !== id))
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

  const toggleSection = (vagaId: string, section: string) => {
    setExpandedSections(prev => {
      const newExpanded = { ...prev }
      if (!newExpanded[vagaId]) {
        newExpanded[vagaId] = new Set()
      }
      
      const sections = new Set(newExpanded[vagaId])
      if (sections.has(section)) {
        sections.delete(section)
      } else {
        sections.add(section)
      }
      
      newExpanded[vagaId] = sections
      return newExpanded
    })
  }

  const isSectionExpanded = (vagaId: string, section: string) => {
    return expandedSections[vagaId]?.has(section) || false
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Lista de Clientes
          </h1>
          <p className="text-muted-foreground text-lg">
            Gerencie todas as vagas de emprego disponíveis
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => navigate('/dashboard/nova-vaga')} size="lg" className="h-12">
            <Plus className="h-5 w-5 mr-2" />
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
          placeholder="Buscar por cliente, cargo, site ou produto..."
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
              <CardTitle className="text-sm font-semibold text-muted-foreground">Total de Vagas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{vagas.length}</div>
            <p className="text-sm text-muted-foreground mt-1">vagas cadastradas</p>
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
        {filteredVagas.map((vaga) => (
          <Card key={vaga.id} className="hover:shadow-lg transition-shadow">
            {/* Header da Vaga */}
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {vaga.cargo}
                  </CardTitle>
                  <CardDescription className="text-lg text-blue-600 font-semibold">
                    {vaga.cliente} - {vaga.site}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewVaga(vaga)}
                    className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    <Eye className="h-4 w-4" />
                    Ver Vaga
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(vaga)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                  {user?.role === 'ADMIN' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(vaga.id)}
                      className="text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            {/* Informações Principais */}
            <CardContent className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {vaga.salario && (
                  <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Salário</p>
                      <p className="font-semibold text-green-700">{vaga.salario}</p>
                    </div>
                  </div>
                )}
                
                {vaga.horario_trabalho && (
                  <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Horário</p>
                      <p className="font-semibold text-blue-700">{vaga.horario_trabalho}</p>
                    </div>
                  </div>
                )}
                
                {vaga.jornada_trabalho && (
                  <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Jornada</p>
                      <p className="font-semibold text-purple-700">{vaga.jornada_trabalho}</p>
                    </div>
                  </div>
                )}
                
                {vaga.local_trabalho && (
                  <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Local</p>
                      <p className="font-semibold text-orange-700">{formatText(vaga.local_trabalho, 30)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Informações Adicionais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Produto:</span>
                  <span className="ml-2 font-medium">{vaga.produto}</span>
                </div>
                <div>
                  <span className="text-gray-600">Categoria:</span>
                  <span className="ml-2 font-medium">{vaga.categoria}</span>
                </div>
                <div>
                  <span className="text-gray-600">Site:</span>
                  <span className="ml-2 font-medium">{vaga.site}</span>
                </div>
              </div>

              {/* Seções Expansíveis */}
              <div className="space-y-3">
                {/* Descrição da Vaga */}
                {vaga.descricao_vaga && (
                  <div className="border rounded-lg">
                    <button
                      className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      onClick={() => toggleSection(vaga.id, 'descricao')}
                    >
                      <span className="font-semibold">Descrição da vaga</span>
                      {isSectionExpanded(vaga.id, 'descricao') ? 
                        <ChevronUp className="h-5 w-5" /> : 
                        <ChevronDown className="h-5 w-5" />
                      }
                    </button>
                    {isSectionExpanded(vaga.id, 'descricao') && (
                      <div className="px-4 pb-4 border-t">
                        <p className="text-gray-700 whitespace-pre-wrap mt-3">
                          {vaga.descricao_vaga}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Responsabilidades e Atribuições */}
                {vaga.responsabilidades_atribuicoes && (
                  <div className="border rounded-lg">
                    <button
                      className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      onClick={() => toggleSection(vaga.id, 'responsabilidades')}
                    >
                      <span className="font-semibold">Responsabilidades e atribuições</span>
                      {isSectionExpanded(vaga.id, 'responsabilidades') ? 
                        <ChevronUp className="h-5 w-5" /> : 
                        <ChevronDown className="h-5 w-5" />
                      }
                    </button>
                    {isSectionExpanded(vaga.id, 'responsabilidades') && (
                      <div className="px-4 pb-4 border-t">
                        <div className="text-gray-700 whitespace-pre-wrap mt-3">
                          {vaga.responsabilidades_atribuicoes}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Requisitos e Qualificações */}
                {vaga.requisitos_qualificacoes && (
                  <div className="border rounded-lg">
                    <button
                      className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      onClick={() => toggleSection(vaga.id, 'requisitos')}
                    >
                      <span className="font-semibold">Requisitos e qualificações</span>
                      {isSectionExpanded(vaga.id, 'requisitos') ? 
                        <ChevronUp className="h-5 w-5" /> : 
                        <ChevronDown className="h-5 w-5" />
                      }
                    </button>
                    {isSectionExpanded(vaga.id, 'requisitos') && (
                      <div className="px-4 pb-4 border-t">
                        <div className="text-gray-700 whitespace-pre-wrap mt-3">
                          {vaga.requisitos_qualificacoes}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Benefícios */}
                {vaga.beneficios && (
                  <div className="border rounded-lg">
                    <button
                      className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      onClick={() => toggleSection(vaga.id, 'beneficios')}
                    >
                      <span className="font-semibold">Benefícios</span>
                      {isSectionExpanded(vaga.id, 'beneficios') ? 
                        <ChevronUp className="h-5 w-5" /> : 
                        <ChevronDown className="h-5 w-5" />
                      }
                    </button>
                    {isSectionExpanded(vaga.id, 'beneficios') && (
                      <div className="px-4 pb-4 border-t">
                        <div className="text-gray-700 whitespace-pre-wrap mt-3">
                          {vaga.beneficios}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Etapas do Processo */}
                {vaga.etapas_processo && (
                  <div className="border rounded-lg">
                    <button
                      className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      onClick={() => toggleSection(vaga.id, 'etapas')}
                    >
                      <span className="font-semibold">Etapas do processo</span>
                      {isSectionExpanded(vaga.id, 'etapas') ? 
                        <ChevronUp className="h-5 w-5" /> : 
                        <ChevronDown className="h-5 w-5" />
                      }
                    </button>
                    {isSectionExpanded(vaga.id, 'etapas') && (
                      <div className="px-4 pb-4 border-t">
                        <div className="text-gray-700 whitespace-pre-wrap mt-3">
                          {vaga.etapas_processo}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVagas.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            {searchTerm ? 'Nenhuma vaga encontrada com os filtros aplicados' : 'Nenhuma vaga cadastrada'}
          </div>
        </div>
      )}
    </div>
  )
}
