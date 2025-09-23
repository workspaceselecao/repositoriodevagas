import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Sidebar, SidebarItem } from './ui/sidebar'
import { Button } from './ui/button'
import { ThemeToggle } from './ThemeToggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { 
  Home, 
  Users, 
  Settings, 
  LogOut, 
  UserPlus,
  FileText,
  BarChart3,
  Activity
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    {
      icon: Home,
      label: 'Lista de Clientes',
      href: '/dashboard',
      show: true
    },
    {
      icon: BarChart3,
      label: 'Comparativo',
      href: '/dashboard/comparativo',
      show: true
    },
    {
      icon: UserPlus,
      label: 'Nova Vaga',
      href: '/dashboard/nova-vaga',
      show: true
    },
    {
      icon: Users,
      label: 'Usuários',
      href: '/dashboard/usuarios',
      show: user?.role === 'ADMIN'
    },
    {
      icon: Settings,
      label: 'Configurações',
      href: '/dashboard/configuracoes',
      show: user?.role === 'ADMIN'
    },
    {
      icon: Activity,
      label: 'Diagnóstico',
      href: '/dashboard/diagnostico',
      show: user?.role === 'ADMIN'
    }
  ]

  const isActive = (href: string) => {
    return location.pathname === href
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)}>
          {menuItems.map((item, index) => {
            if (!item.show) return null
            
            const Icon = item.icon
            const isActiveItem = isActive(item.href)
            
            return (
              <SidebarItem key={index} isCollapsed={isCollapsed}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActiveItem ? "default" : "ghost"}
                      className={`w-full transition-all duration-200 ${
                        isCollapsed 
                          ? "justify-center px-2" 
                          : "justify-start"
                      } ${
                        isActiveItem 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : "hover:bg-primary/10 hover:shadow-sm"
                      }`}
                      onClick={() => navigate(item.href)}
                    >
                      <Icon className="h-4 w-4" />
                      {!isCollapsed && <span className="ml-2">{item.label}</span>}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" className="ml-2">
                      <p>{item.label}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </SidebarItem>
            )
          })}
          
          <div className="mt-auto p-4 space-y-2">
            <SidebarItem isCollapsed={isCollapsed}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`w-full text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 ${
                      isCollapsed 
                        ? "justify-center px-2" 
                        : "justify-start"
                    }`}
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    {!isCollapsed && <span className="ml-2">Sair</span>}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="ml-2">
                    <p>Sair</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </SidebarItem>
          </div>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-card/50 backdrop-blur-sm shadow-sm border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Repositório de Vagas
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      Olá, {user?.name}
                    </p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      {user?.role}
                    </span>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-background via-background to-muted/10">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
