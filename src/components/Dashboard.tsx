import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Vaga } from '../types/database'
import { getVagas, getClientes, getSites } from '../lib/vagas'
import { getAllUsers } from '../lib/auth'
import { getNoticias } from '../lib/noticias'
import { useAuth } from '../contexts/AuthContext'
import { 
  Users, 
  Building2, 
  Globe, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  Info,
  Megaphone,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react'

interface DashboardStats {
  totalVagas: number
  totalClientes: number
  totalSites: number
  totalUsuarios: number
  vagasAtivas: number
  vagasRecentes: number
  noticiasAtivas: number
}

interface Noticia {
  id: string
  titulo: string
  conteudo: string
  tipo: 'info' | 'alerta' | 'anuncio'
  ativa: boolean
  prioridade: 'baixa' | 'media' | 'alta'
  created_at: string
  updated_at: string
  created_by: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVagas: 0,
    totalClientes: 0,
    totalSites: 0,
    totalUsuarios: 0,
    vagasAtivas: 0,
    vagasRecentes: 0,
    noticiasAtivas: 0
  })
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Carregar dados em paralelo
      const [vagas, clientes, sites, usuarios, noticiasData] = await Promise.all([
        getVagas(),
        getClientes(),
        getSites(),
        getAllUsers(),
        getNoticias()
      ])

      // Calcular estatísticas
      const now = new Date()
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      const vagasRecentes = vagas.filter(vaga => 
        new Date(vaga.created_at) > sevenDaysAgo
      ).length

      const noticiasAtivas = noticiasData.filter(noticia => noticia.ativa).length

      setStats({
        totalVagas: vagas.length,
        totalClientes: clientes.length,
        totalSites: sites.length,
        totalUsuarios: usuarios.length,
        vagasAtivas: vagas.length, // Todas as vagas são consideradas ativas
        vagasRecentes,
        noticiasAtivas
      })

      // Ordenar notícias por prioridade e data
      const noticiasOrdenadas = noticiasData
        .filter(noticia => noticia.ativa)
        .sort((a, b) => {
          const prioridadeOrder = { alta: 3, media: 2, baixa: 1 }
          if (prioridadeOrder[a.prioridade] !== prioridadeOrder[b.prioridade]) {
            return prioridadeOrder[b.prioridade] - prioridadeOrder[a.prioridade]
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        .slice(0, 9) // Mostrar até 9 notícias

      setNoticias(noticiasOrdenadas)
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'alerta':
        return <AlertCircle className="h-4 w-4" />
      case 'anuncio':
        return <Megaphone className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'alerta':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'anuncio':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return 'bg-red-500'
      case 'media':
        return 'bg-yellow-500'
      default:
        return 'bg-green-500'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Carregando dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Visão geral do sistema e notícias importantes
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vagas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVagas}</div>
            <p className="text-xs text-muted-foreground">
              {stats.vagasRecentes} novas esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClientes}</div>
            <p className="text-xs text-muted-foreground">
              Empresas parceiras
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sites Ativos</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSites}</div>
            <p className="text-xs text-muted-foreground">
              Locais de trabalho
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsuarios}</div>
            <p className="text-xs text-muted-foreground">
              {user?.role === 'ADMIN' ? 'Admins + RH' : 'Usuários do sistema'}
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Mural de Notícias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Mural de Notícias
          </CardTitle>
          <CardDescription>
            Avisos, anúncios e informações importantes do sistema
            {noticias.length >= 9 && (
              <span className="block mt-2 text-amber-600 text-sm font-medium">
                ⚠️ Mural completo! Para adicionar nova notícia, faça backup e remova uma notícia ativa nas Configurações.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {noticias.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Megaphone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nenhuma notícia ativa</p>
              <p className="text-sm">Não há notícias ou avisos no momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {noticias.map((noticia) => (
                <Card key={noticia.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded-full ${getTipoColor(noticia.tipo)}`}>
                          {getTipoIcon(noticia.tipo)}
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getTipoColor(noticia.tipo)}`}
                        >
                          {noticia.tipo}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${getPrioridadeColor(noticia.prioridade)}`}></div>
                        <span className="text-xs text-gray-500">{noticia.prioridade}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight">{noticia.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {noticia.conteudo}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(noticia.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(noticia.created_at).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesso rápido às principais funcionalidades do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Building2 className="h-6 w-6" />
              <span className="text-sm">Nova Vaga</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Lista de Clientes</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Comparativo</span>
            </Button>
            {user?.role === 'ADMIN' && (
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Megaphone className="h-6 w-6" />
                <span className="text-sm">Gerenciar Notícias</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
