import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Vaga } from '../types/database'
import { getVagas, deleteVaga } from '../lib/vagas'
import { exportToExcel } from '../lib/backup'
import { Search, Download, Plus, Users, Building2, TrendingUp } from 'lucide-react'
import VagaTemplate from './VagaTemplate'
import { useAuth } from '../contexts/AuthContext'

export default function ListaClientes() {
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [filteredVagas, setFilteredVagas] = useState<Vaga[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
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
      vaga.celula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vaga.titulo && vaga.titulo.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <VagaTemplate
            key={vaga.id}
            vaga={vaga}
            showActions={true}
            onEdit={() => handleEdit(vaga)}
            onDelete={() => handleDelete(vaga.id)}
          />
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
