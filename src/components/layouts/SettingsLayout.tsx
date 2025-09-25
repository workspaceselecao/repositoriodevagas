import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Database,
  Server,
  Mail,
  Lock,
  Globe,
  Monitor,
  Smartphone
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { DashboardLayout } from './DashboardLayout'
import { ThemeSelector } from '../ui/theme-selector'
import { cn } from '../../lib/utils'

interface SettingsLayoutProps {
  children?: React.ReactNode
  activeTab?: string
  onTabChange?: (tab: string) => void
}

interface SettingsSection {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const settingsSections: SettingsSection[] = [
  {
    id: 'profile',
    label: 'Perfil',
    icon: User,
    description: 'Gerencie suas informações pessoais'
  },
  {
    id: 'security',
    label: 'Segurança',
    icon: Shield,
    description: 'Configurações de segurança e privacidade'
  },
  {
    id: 'notifications',
    label: 'Notificações',
    icon: Bell,
    description: 'Configure como você recebe notificações'
  },
  {
    id: 'appearance',
    label: 'Aparência',
    icon: Palette,
    description: 'Personalize a aparência do sistema'
  },
  {
    id: 'system',
    label: 'Sistema',
    icon: Server,
    description: 'Configurações do sistema e manutenção'
  },
  {
    id: 'integrations',
    label: 'Integrações',
    icon: Globe,
    description: 'Conecte com outros serviços'
  }
]

export function SettingsLayout({ children, activeTab = 'profile', onTabChange }: SettingsLayoutProps) {
  const [currentTab, setCurrentTab] = useState(activeTab)

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab)
    onTabChange?.(tab)
  }

  return (
    <DashboardLayout
      title="Configurações"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Configurações' }
      ]}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie suas preferências e configurações do sistema
            </p>
          </div>

          {/* Settings Navigation */}
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 p-4">
                {settingsSections.map((section, index) => (
                  <motion.button
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleTabChange(section.id)}
                    className={cn(
                      "flex items-start space-x-3 p-4 rounded-lg text-left transition-all duration-200 hover:bg-accent/50",
                      currentTab === section.id && "bg-accent"
                    )}
                  >
                    <section.icon className={cn(
                      "h-5 w-5 mt-0.5",
                      currentTab === section.id ? "text-primary" : "text-muted-foreground"
                    )} />
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "font-medium",
                        currentTab === section.id ? "text-primary" : "text-foreground"
                      )}>
                        {section.label}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {section.description}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Settings Content */}
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children || <SettingsContent tab={currentTab} />}
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

// Componente de conteúdo das configurações
function SettingsContent({ tab }: { tab: string }) {
  switch (tab) {
    case 'profile':
      return <ProfileSettings />
    case 'security':
      return <SecuritySettings />
    case 'notifications':
      return <NotificationSettings />
    case 'appearance':
      return <AppearanceSettings />
    case 'system':
      return <SystemSettings />
    case 'integrations':
      return <IntegrationSettings />
    default:
      return <ProfileSettings />
  }
}

// Configurações de Perfil
function ProfileSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Atualize suas informações pessoais e preferências
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome completo</label>
              <input
                type="text"
                defaultValue="João Silva"
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                defaultValue="joao@empresa.com"
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone</label>
              <input
                type="tel"
                defaultValue="+55 11 99999-9999"
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cargo</label>
              <input
                type="text"
                defaultValue="Gerente de RH"
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <Button className="bg-gradient-to-r from-primary to-primary/90">
            Salvar alterações
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Foto do Perfil</CardTitle>
          <CardDescription>
            Atualize sua foto de perfil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <Button variant="outline">Alterar foto</Button>
              <p className="text-sm text-muted-foreground">
                JPG, PNG ou GIF. Máximo 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Configurações de Segurança
function SecuritySettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>
            Mantenha sua conta segura com uma senha forte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Senha atual</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nova senha</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirmar nova senha</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button className="bg-gradient-to-r from-primary to-primary/90">
            Alterar senha
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Autenticação de Dois Fatores</CardTitle>
          <CardDescription>
            Adicione uma camada extra de segurança à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">2FA Ativado</h4>
              <p className="text-sm text-muted-foreground">
                Sua conta está protegida com autenticação de dois fatores
              </p>
            </div>
            <Button variant="outline">Gerenciar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Configurações de Notificações
function NotificationSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preferências de Notificação</CardTitle>
          <CardDescription>
            Escolha como você deseja receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email</h4>
                <p className="text-sm text-muted-foreground">
                  Receber notificações por email
                </p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Push</h4>
                <p className="text-sm text-muted-foreground">
                  Receber notificações push no navegador
                </p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">SMS</h4>
                <p className="text-sm text-muted-foreground">
                  Receber notificações por SMS
                </p>
              </div>
              <input type="checkbox" className="rounded" />
            </div>
          </div>
          <Button className="bg-gradient-to-r from-primary to-primary/90">
            Salvar preferências
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Configurações de Aparência
function AppearanceSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tema e Aparência</CardTitle>
          <CardDescription>
            Personalize a aparência do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSelector />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferências de Exibição</CardTitle>
          <CardDescription>
            Configure como o conteúdo é exibido
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Densidade da interface</label>
            <select className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
              <option>Compacta</option>
              <option>Confortável</option>
              <option>Espaçosa</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tamanho da fonte</label>
            <select className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
              <option>Pequeno</option>
              <option>Médio</option>
              <option>Grande</option>
            </select>
          </div>
          <Button className="bg-gradient-to-r from-primary to-primary/90">
            Aplicar configurações
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Configurações do Sistema
function SystemSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
          <CardDescription>
            Informações sobre a versão e status do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Versão</label>
              <p className="text-sm text-muted-foreground">v1.0.0</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Última atualização</label>
              <p className="text-sm text-muted-foreground">15 de Janeiro, 2024</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Online
              </span>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Uptime</label>
              <p className="text-sm text-muted-foreground">99.9%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manutenção</CardTitle>
          <CardDescription>
            Ferramentas de manutenção e diagnóstico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Verificar banco de dados
            </Button>
            <Button variant="outline">
              <Server className="h-4 w-4 mr-2" />
              Testar conectividade
            </Button>
            <Button variant="outline">
              <Monitor className="h-4 w-4 mr-2" />
              Limpar cache
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Configurações de Integrações
function IntegrationSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integrações Disponíveis</CardTitle>
          <CardDescription>
            Conecte com outros serviços e plataformas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-input rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">Email Marketing</h4>
                  <p className="text-sm text-muted-foreground">
                    Integração com Mailchimp
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Conectar
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-input rounded-lg">
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">Google Analytics</h4>
                  <p className="text-sm text-muted-foreground">
                    Rastreamento de métricas
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Conectar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
