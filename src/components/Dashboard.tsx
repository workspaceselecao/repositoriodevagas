import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { LoadingGrid } from './ui/loading-card'
import { EmptyState } from './ui/empty-state'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
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
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const { config } = useTheme()
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
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-9 w-24 bg-muted rounded animate-pulse"></div>
            <div className="h-9 w-32 bg-muted rounded animate-pulse"></div>
            <div className="h-9 w-28 bg-muted rounded animate-pulse"></div>
          </div>
        </div>

        {/* Métricas Skeleton */}
        <LoadingGrid count={4} />

        {/* Notícias Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
              <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-96 bg-muted rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-6 bg-muted rounded"></div>
                        <div className="h-5 w-16 bg-muted rounded"></div>
                      </div>
                      <div className="h-3 w-12 bg-muted rounded"></div>
                    </div>
                    <div className="h-5 w-full bg-muted rounded"></div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-muted rounded"></div>
                      <div className="h-3 w-3/4 bg-muted rounded"></div>
                      <div className="h-3 w-1/2 bg-muted rounded"></div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <div className="h-3 w-20 bg-muted rounded"></div>
                      <div className="h-3 w-16 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
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

      {/* Métricas Principais com Cards 3D */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={`card-3d hover-lift-3d transition-all duration-300 ${
          config.effects.glassmorphism ? 'bg-white/10 backdrop-blur-xl border-white/20' : ''
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total de Vagas</CardTitle>
            <div className={`p-2 rounded-lg ${
              config.effects.gradients 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                : 'bg-blue-500'
            } shadow-lg`}>
              <Building2 className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-foreground">{stats.totalVagas}</div>
              <div className="flex items-center text-green-600 text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="font-medium">+{stats.vagasRecentes}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.vagasRecentes} novas esta semana
            </p>
          </CardContent>
        </Card>

        <Card className={`card-3d hover-lift-3d transition-all duration-300 ${
          config.effects.glassmorphism ? 'bg-white/10 backdrop-blur-xl border-white/20' : ''
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Clientes Únicos</CardTitle>
            <div className={`p-2 rounded-lg ${
              config.effects.gradients 
                ? 'bg-gradient-to-br from-green-500 to-green-600' 
                : 'bg-green-500'
            } shadow-lg`}>
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-foreground">{stats.totalClientes}</div>
              <div className="flex items-center text-blue-600 text-sm">
                <Activity className="h-4 w-4 mr-1" />
                <span className="font-medium">Ativo</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Empresas parceiras
            </p>
          </CardContent>
        </Card>

        <Card className={`card-3d hover-lift-3d transition-all duration-300 ${
          config.effects.glassmorphism ? 'bg-white/10 backdrop-blur-xl border-white/20' : ''
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Sites Ativos</CardTitle>
            <div className={`p-2 rounded-lg ${
              config.effects.gradients 
                ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                : 'bg-purple-500'
            } shadow-lg`}>
              <Globe className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-foreground">{stats.totalSites}</div>
              <div className="flex items-center text-purple-600 text-sm">
                <Zap className="h-4 w-4 mr-1" />
                <span className="font-medium">Online</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Locais de trabalho
            </p>
          </CardContent>
        </Card>

        <Card className={`card-3d hover-lift-3d transition-all duration-300 ${
          config.effects.glassmorphism ? 'bg-white/10 backdrop-blur-xl border-white/20' : ''
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Usuários Ativos</CardTitle>
            <div className={`p-2 rounded-lg ${
              config.effects.gradients 
                ? 'bg-gradient-to-br from-orange-500 to-orange-600' 
                : 'bg-orange-500'
            } shadow-lg`}>
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-foreground">{stats.totalUsuarios}</div>
              <div className="flex items-center text-orange-600 text-sm">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                <span className="font-medium">Logado</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {user?.role === 'ADMIN' ? 'Admins + RH' : 'Usuários do sistema'}
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Mural de Notícias com Tabs Coloridas */}
      <Card className={`transition-all duration-300 ${
        config.effects.glassmorphism ? 'bg-white/10 backdrop-blur-xl border-white/20' : ''
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 ${
              config.effects.gradients 
                ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                : 'bg-purple-500'
            } shadow-lg`}>
              <Eye className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Mural de Notícias</span>
          </CardTitle>
          <CardDescription className="text-base">
            Avisos, anúncios e informações importantes do sistema
            {noticiasExibidas.length >= 9 && (
              <span className="block mt-2 text-amber-600 text-sm font-medium animate-pulse-glow">
                ⚠️ Mural completo! Para adicionar nova notícia, faça backup e remova uma notícia ativa nas Configurações.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {noticiasExibidas.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="Nenhuma notícia ativa"
              description="Não há notícias ou avisos no momento. As notícias aparecerão aqui quando forem adicionadas."
              action={{
                label: "Adicionar Notícia",
                onClick: () => {
                  // Navegar para configurações para adicionar notícia
                  window.location.href = '/dashboard/configuracoes'
                }
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {noticiasExibidas.map((noticia, index) => (
                <Card 
                  key={noticia.id} 
                  className={`card-3d hover-lift-3d transition-all duration-300 animate-fade-in ${
                    config.effects.glassmorphism ? 'bg-white/5 backdrop-blur-sm border-white/10' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${getTipoColor(noticia.tipo)} shadow-md`}>
                          {getTipoIcon(noticia.tipo)}
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs font-medium ${getTipoColor(noticia.tipo)}`}
                        >
                          {noticia.tipo}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getPrioridadeColor(noticia.prioridade)} animate-pulse`}></div>
                        <span className="text-xs text-muted-foreground font-medium">{noticia.prioridade}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight text-foreground hover:text-primary transition-colors duration-200">
                      {noticia.titulo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                      {noticia.conteudo}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3" />
                        <span className="font-medium">{formatDate(noticia.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span className="font-medium">{new Date(noticia.created_at).toLocaleTimeString('pt-BR', { 
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
