import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Vaga } from '../types/database'
import { getVagas, deleteVaga } from '../lib/vagas'
import { exportToExcel } from '../lib/backup'
import { Search, Download, Edit, Trash2, Plus } from 'lucide-react'
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
      vaga.produto.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredVagas(filtered)
  }

  const handleEdit = (vaga: Vaga) => {
    navigate(`/dashboard/editar-vaga/${vaga.id}`)
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lista de Clientes</h1>
          <p className="text-gray-600 mt-2">
            Gerencie todas as vagas de emprego disponíveis
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => navigate('/dashboard/nova-vaga')}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Vaga
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar por cliente, cargo, site ou produto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Vagas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vagas.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(vagas.map(v => v.cliente)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sites Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(vagas.map(v => v.site)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vagas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVagas.map((vaga) => (
          <Card key={vaga.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{vaga.cargo}</CardTitle>
                  <CardDescription className="text-blue-600 font-medium">
                    {vaga.cliente}
                  </CardDescription>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(vaga)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {user?.role === 'ADMIN' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(vaga.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Site:</span>
                  <span className="font-medium">{vaga.site}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Produto:</span>
                  <span className="font-medium">{vaga.produto}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Categoria:</span>
                  <span className="font-medium">{vaga.categoria}</span>
                </div>
                {vaga.salario && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Salário:</span>
                    <span className="font-medium text-green-600">{vaga.salario}</span>
                  </div>
                )}
              </div>
              
              {vaga.descricao_vaga && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-700">
                    {formatText(vaga.descricao_vaga, 120)}
                  </p>
                </div>
              )}
              
              {vaga.local_trabalho && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>Local:</strong> {formatText(vaga.local_trabalho, 80)}
                  </p>
                </div>
              )}
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
