import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useAuth } from '../contexts/AuthContext'
import { useDashboardStats, useNoticias } from '../hooks/useCacheData'
import { useCache } from '../contexts/CacheContext'
import { APP_VERSION, checkForUpdates, forceReload } from '../version'
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
  RefreshCw,
  Download,
  AlertTriangle
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const { stats, loading } = useDashboardStats()
  const { noticias } = useNoticias()
  const { refreshAll } = useCache()

  // Limitar notícias exibidas
  const noticiasExibidas = noticias.slice(0, 9)

  // Verificar atualizações
  const handleCheckUpdates = async () => {
    const hasUpdate = await checkForUpdates()
    if (hasUpdate) {
      if (confirm('Nova versão disponível! Deseja atualizar agora?')) {
        forceReload()
      }
    } else {
      alert('Você está usando a versão mais recente!')
    }
  }

  // Emergency refresh
  const handleEmergencyRefresh = () => {
    if (confirm('⚠️ ATENÇÃO: Isso irá limpar todos os caches e recarregar a página. Continuar?')) {
      // Limpar todos os caches
      localStorage.clear()
      sessionStorage.clear()
      
      // Limpar cache do Supabase
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('supabase') || name.includes('auth')) {
              caches.delete(name)
            }
          })
        }).catch(() => {
          // Ignorar erros de cache
        })
      }
      
      // Forçar reload da página
      window.location.reload()
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
        <div className="flex space-x-2">
          <Button onClick={refreshAll} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleCheckUpdates} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Verificar Atualizações
          </Button>
          <Button onClick={handleEmergencyRefresh} variant="destructive" size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Emergency Refresh
          </Button>
        </div>
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
            {noticiasExibidas.length >= 9 && (
              <span className="block mt-2 text-amber-600 text-sm font-medium">
                ⚠️ Mural completo! Para adicionar nova notícia, faça backup e remova uma notícia ativa nas Configurações.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {noticiasExibidas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Megaphone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nenhuma notícia ativa</p>
              <p className="text-sm">Não há notícias ou avisos no momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {noticiasExibidas.map((noticia) => (
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

      {/* Rodapé com versão */}
      <div className="text-center text-sm text-gray-500 mt-8">
        <p>Repositório de Vagas v{APP_VERSION}</p>
      </div>

    </div>
  )
}
