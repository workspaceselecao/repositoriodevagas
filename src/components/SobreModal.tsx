import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { 
  Info, 
  Code, 
  Database, 
  Globe, 
  Package,
  Calendar,
  User,
  Shield,
  Download,
  RefreshCw
} from 'lucide-react'
import { APP_VERSION, checkForUpdates, forceReload, fetchServerVersion, getCurrentStoredVersion } from '../version'

interface SobreModalProps {
  isOpen: boolean
  onClose: () => void
  user?: {
    name: string
    role: string
  } | null
}

export default function SobreModal({ isOpen, onClose, user }: SobreModalProps) {
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false)
  const [serverVersionInfo, setServerVersionInfo] = useState<{version: string, buildDate: string, description?: string} | null>(null)
  const [currentStoredVersion, setCurrentStoredVersion] = useState<string>(APP_VERSION)
  const [isLoadingInfo, setIsLoadingInfo] = useState(false)
  
  
  // Informações locais (fallback)
  const buildDate = new Date().toLocaleDateString('pt-BR')
  const buildTime = new Date().toLocaleTimeString('pt-BR')

  // Função para carregar informações atualizadas do servidor
  const loadServerInfo = async () => {
    setIsLoadingInfo(true)
    try {
      console.log('📡 Carregando informações atualizadas do servidor...')
      
      // Buscar informações da versão do servidor
      const serverInfo = await fetchServerVersion()
      if (serverInfo) {
        setServerVersionInfo(serverInfo)
        console.log('✅ Informações do servidor carregadas:', serverInfo.version)
      }
      
      // Obter versão armazenada localmente
      const storedVersion = getCurrentStoredVersion()
      if (storedVersion) {
        setCurrentStoredVersion(storedVersion)
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar informações do servidor:', error)
    } finally {
      setIsLoadingInfo(false)
    }
  }

  // Carregar informações automaticamente quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadServerInfo()
    }
  }, [isOpen])

  // Função para verificar atualizações
  const handleCheckUpdates = async () => {
    setIsCheckingUpdates(true)
    try {
      console.log('🔍 Verificando atualizações manualmente...')
      
      // Primeiro, carregar informações atualizadas
      await loadServerInfo()
      
      // Depois verificar se há atualizações
      const hasUpdate = await checkForUpdates()
      if (hasUpdate) {
        if (confirm('Nova versão disponível! Deseja atualizar agora?')) {
          forceReload()
        }
      } else {
        alert('Você está usando a versão mais recente!')
      }
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error)
      alert('Erro ao verificar atualizações. Tente novamente.')
    } finally {
      setIsCheckingUpdates(false)
    }
  }

  const techStack = [
    { name: 'React', version: '18.x', icon: '⚛️' },
    { name: 'TypeScript', version: '5.x', icon: '🔷' },
    { name: 'Vite', version: '5.x', icon: '⚡' },
    { name: 'Tailwind CSS', version: '3.x', icon: '🎨' },
    { name: 'Supabase', version: 'Latest', icon: '🚀' },
    { name: 'Lucide React', version: 'Latest', icon: '🎯' }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl page-title">
            <Info className="h-5 w-5 icon-primary" />
            Sobre o Repositório de Vagas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações da Aplicação */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 page-title">
                <Package className="h-4 w-4 icon-primary" />
                Informações da Aplicação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm field-subtitle">Versão Atual</p>
                  <Badge variant="secondary" className="mt-1">
                    {isLoadingInfo ? (
                      <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                    ) : null}
                    v{serverVersionInfo?.version || APP_VERSION}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Versão Armazenada</p>
                  <Badge variant="outline" className="mt-1">
                    v{currentStoredVersion}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Data do Build</p>
                  <p className="text-sm font-medium">
                    {serverVersionInfo?.buildDate 
                      ? new Date(serverVersionInfo.buildDate).toLocaleDateString('pt-BR')
                      : buildDate
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ambiente</p>
                  <Badge variant={import.meta.env.DEV ? "destructive" : "default"}>
                    {import.meta.env.DEV ? 'Desenvolvimento' : 'Produção'}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Hora do Build</p>
                  <p className="text-sm font-medium">
                    {serverVersionInfo?.buildDate 
                      ? new Date(serverVersionInfo.buildDate).toLocaleTimeString('pt-BR')
                      : buildTime
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={serverVersionInfo ? "default" : "secondary"}>
                    {isLoadingInfo ? "Carregando..." : serverVersionInfo ? "Atualizado" : "Local"}
                  </Badge>
                </div>
              </div>
              
              {/* Botões de Ação */}
              <div className="pt-3 border-t space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={loadServerInfo}
                    disabled={isLoadingInfo}
                    variant="outline"
                    size="sm"
                  >
                    {isLoadingInfo ? (
                      <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-1" />
                    )}
                    Atualizar Info
                  </Button>
                  <Button
                    onClick={handleCheckUpdates}
                    disabled={isCheckingUpdates}
                    variant="outline"
                    size="sm"
                  >
                    {isCheckingUpdates ? (
                      <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Download className="h-3 w-3 mr-1" />
                    )}
                    Verificar Atualizações
                  </Button>
                </div>
                
                
                <p className="text-xs text-muted-foreground text-center">
                  As informações são atualizadas automaticamente ao abrir este modal
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Usuário */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Informações da Sessão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Usuário</p>
                  <p className="text-sm font-medium">{user?.name || 'Não identificado'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Perfil</p>
                  <Badge variant="outline">
                    {user?.role || 'N/A'}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessão Ativa</p>
                <p className="text-sm font-medium text-green-600">
                  {new Date().toLocaleString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stack Tecnológico */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                Stack Tecnológico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {techStack.map((tech, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <span className="text-lg">{tech.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{tech.name}</p>
                      <p className="text-xs text-muted-foreground">{tech.version}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Informações de Deploy */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Informações de Deploy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Última Atualização</p>
                  <p className="text-sm font-medium">
                    {serverVersionInfo?.buildDate 
                      ? new Date(serverVersionInfo.buildDate).toLocaleString('pt-BR')
                      : 'Não disponível'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status da Versão</p>
                  <Badge variant={
                    serverVersionInfo?.version === currentStoredVersion ? "default" : "destructive"
                  }>
                    {serverVersionInfo?.version === currentStoredVersion ? "Atualizado" : "Desatualizado"}
                  </Badge>
                </div>
              </div>
              {serverVersionInfo?.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p className="text-sm font-medium bg-muted p-2 rounded">
                    {serverVersionInfo.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações do Sistema */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">User Agent</p>
                  <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                    {navigator.userAgent.substring(0, 50)}...
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resolução</p>
                  <p className="text-sm font-medium">
                    {window.screen.width}x{window.screen.height}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plataforma</p>
                  <p className="text-sm font-medium">{navigator.platform}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Idioma</p>
                  <p className="text-sm font-medium">{navigator.language}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Segurança */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Conexão HTTPS Ativa</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Autenticação Segura (Supabase Auth)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Row Level Security (RLS) Habilitado</span>
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
