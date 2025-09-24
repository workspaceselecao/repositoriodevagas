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
  Activity,
  Building2
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
    // Navegar imediatamente para login (sem aguardar logout)
    navigate('/login')
    
    // Fazer logout em segundo plano
    setTimeout(() => {
      logout().catch((error: any) => {
        console.warn('Erro durante logout em segundo plano:', error)
      })
    }, 100)
  }

  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      href: '/dashboard',
      show: true
    },
    {
      icon: Building2,
      label: 'Lista de Clientes',
      href: '/dashboard/clientes',
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
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isActiveItem ? "default" : "ghost"}
                    className={`w-full transition-all duration-200 rounded-xl ${
                      isCollapsed 
                        ? "justify-center p-4 h-12" 
                        : "justify-start px-3 py-2"
                    } ${
                      isActiveItem 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "hover:bg-primary/10 hover:shadow-sm"
                    }`}
                    onClick={() => navigate(item.href)}
                  >
                    <Icon className={`${isCollapsed ? "h-6 w-6" : "h-4 w-4"}`} />
                    {!isCollapsed && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="ml-2">
                    <p>{item.label}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
          
          <div className="mt-auto p-4 space-y-3">
            {/* Informações do Usuário - Simplificadas */}
            <div className={`w-full flex items-center space-x-3 p-3 rounded-lg ${
              isCollapsed ? "justify-center" : "justify-start"
            }`}>
              <div className={`${isCollapsed ? "w-10 h-10" : "w-8 h-8"} bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center flex-shrink-0`}>
                <span className="text-primary-foreground font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    Olá, {user?.name}
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    {user?.role}
                  </span>
                </div>
              )}
            </div>
            {isCollapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full flex justify-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  <div className="text-center">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.role}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={`w-full text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 rounded-xl ${
                    isCollapsed 
                      ? "justify-center p-4 h-12" 
                      : "justify-start px-3 py-2"
                  }`}
                  onClick={handleLogout}
                >
                  <LogOut className={`${isCollapsed ? "h-6 w-6" : "h-4 w-4"}`} />
                  {!isCollapsed && <span className="ml-3 text-sm font-medium">Sair</span>}
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="ml-2">
                  <p>Sair</p>
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-card/50 backdrop-blur-sm shadow-sm border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Repositório de Vagas
              </h1>
              <ThemeToggle />
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
