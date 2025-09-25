import React from 'react'
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
  Shield
} from 'lucide-react'
import { APP_VERSION } from '../version'

interface SobreModalProps {
  isOpen: boolean
  onClose: () => void
  user?: {
    name: string
    role: string
  } | null
}

export default function SobreModal({ isOpen, onClose, user }: SobreModalProps) {
  const buildDate = new Date().toLocaleDateString('pt-BR')
  const buildTime = new Date().toLocaleTimeString('pt-BR')

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
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Info className="h-5 w-5 text-primary" />
            Sobre o Repositório de Vagas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações da Aplicação */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Informações da Aplicação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Versão</p>
                  <Badge variant="secondary" className="mt-1">
                    v{APP_VERSION}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Build</p>
                  <p className="text-sm font-medium">{buildDate}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ambiente</p>
                  <Badge variant={import.meta.env.DEV ? "destructive" : "default"}>
                    {import.meta.env.DEV ? 'Desenvolvimento' : 'Produção'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Build Time</p>
                  <p className="text-sm font-medium">{buildTime}</p>
                </div>
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
