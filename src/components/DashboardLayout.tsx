import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Sidebar, SidebarItem } from './ui/sidebar'
import { Button } from './ui/button'
import { ThemeToggle } from './ThemeToggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { Badge } from './ui/badge'
import { Breadcrumb } from './ui/breadcrumb'
import { 
  Home, 
  Users, 
  Settings, 
  LogOut, 
  UserPlus,
  FileText,
  BarChart3,
  Activity,
  Building2,
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  User
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuth()
  const { config } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  // Detectar scroll para header fixo
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fechar menu mobile ao redimensionar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
        {/* Sidebar Desktop */}
        <div className={`hidden md:flex transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}>
          <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)}>
            {/* Logo */}
            <div className={`flex items-center space-x-3 p-4 border-b ${
              isCollapsed ? 'justify-center' : 'justify-start'
            }`}>
              <div className={`${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg`}>
                <Building2 className={`${isCollapsed ? 'h-4 w-4' : 'h-6 w-6'} text-primary-foreground`} />
              </div>
              {!isCollapsed && (
                <div>
                  <h2 className="text-lg font-bold text-foreground">Repositório</h2>
                  <p className="text-xs text-muted-foreground">de Vagas</p>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="flex-1 p-4 space-y-2">
              {menuItems.map((item, index) => {
                if (!item.show) return null
                
                const Icon = item.icon
                const isActiveItem = isActive(item.href)
                
                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActiveItem ? "default" : "ghost"}
                        className={`w-full transition-all duration-200 rounded-xl hover-scale ${
                          isCollapsed 
                            ? "justify-center p-3 h-12 w-12" 
                            : "justify-start px-3 py-2"
                        } ${
                          isActiveItem 
                            ? "bg-primary text-primary-foreground shadow-md hover-lift-3d" 
                            : "hover:bg-primary/10 hover:shadow-sm"
                        }`}
                        onClick={() => navigate(item.href)}
                      >
                        <Icon className={`${isCollapsed ? "h-5 w-5" : "h-4 w-4"}`} />
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
            </div>
            
            {/* Informações do Usuário e Logout */}
            <div className={`p-4 border-t space-y-3 ${
              isCollapsed ? "space-y-2" : "space-y-3"
            }`}>
              {/* Informações do Usuário */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`w-full flex items-center space-x-3 rounded-lg p-3 hover:bg-accent/50 transition-all duration-200 ${
                    isCollapsed ? "justify-center" : "justify-start"
                  }`}>
                    <div className={`${isCollapsed ? "w-10 h-10" : "w-8 h-8"} bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <span className="text-primary-foreground font-bold text-sm">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    {!isCollapsed && (
                      <div className="flex flex-col min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          Olá, {user?.name}
                        </p>
                        <Badge variant="outline" className="text-xs w-fit">
                          {user?.role}
                        </Badge>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="ml-2">
                    <div className="text-center">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.role}</p>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
              
              {/* Botão de Logout */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`w-full text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 rounded-xl hover-scale ${
                      isCollapsed 
                        ? "justify-center p-3 h-12 w-12" 
                        : "justify-start px-3 py-2"
                    }`}
                    onClick={handleLogout}
                  >
                    <LogOut className={`${isCollapsed ? "h-5 w-5" : "h-4 w-4"}`} />
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
        </div>

        {/* Sidebar Mobile Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="fixed left-0 top-0 h-full w-64 bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <Sidebar isCollapsed={false}>
                {/* Logo Mobile */}
                <div className="flex items-center space-x-3 p-4 border-b">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
                    <Building2 className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Repositório</h2>
                    <p className="text-xs text-muted-foreground">de Vagas</p>
                  </div>
                </div>

                {/* Menu Items Mobile */}
                <div className="flex-1 p-4 space-y-2">
                  {menuItems.map((item, index) => {
                    if (!item.show) return null
                    
                    const Icon = item.icon
                    const isActiveItem = isActive(item.href)
                    
                    return (
                      <Button
                        key={index}
                        variant={isActiveItem ? "default" : "ghost"}
                        className={`w-full justify-start px-3 py-2 transition-all duration-200 rounded-xl hover-scale ${
                          isActiveItem 
                            ? "bg-primary text-primary-foreground shadow-md" 
                            : "hover:bg-primary/10"
                        }`}
                        onClick={() => {
                          navigate(item.href)
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="ml-3 text-sm font-medium">{item.label}</span>
                      </Button>
                    )
                  })}
                </div>
                
                {/* User Info Mobile */}
                <div className="p-4 border-t space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-primary-foreground font-bold text-sm">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        Olá, {user?.name}
                      </p>
                      <Badge variant="outline" className="text-xs w-fit">
                        {user?.role}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-3 py-2 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 rounded-xl"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="ml-3 text-sm font-medium">Sair</span>
                  </Button>
                </div>
              </Sidebar>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Fixo */}
          <header className={`sticky top-0 z-40 transition-all duration-300 ${
            scrolled 
              ? 'bg-card/80 backdrop-blur-xl shadow-lg border-b' 
              : 'bg-card/50 backdrop-blur-sm border-b'
          } ${config.effects.glassmorphism ? 'bg-white/10 backdrop-blur-xl' : ''}`}>
            <div className="flex items-center justify-between px-6 py-4">
              {/* Left Side */}
              <div className="flex items-center space-x-4">
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden hover-scale"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                
                {/* Desktop Collapse Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex hover-scale"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </Button>
                
                {/* Page Title e Breadcrumbs */}
                <div className="space-y-2">
                  <Breadcrumb />
                  <h1 className={`text-2xl font-bold transition-all duration-300 ${
                    config.effects.gradients 
                      ? 'bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent' 
                      : 'text-primary'
                  }`}>
                    {menuItems.find(item => item.href === location.pathname)?.label || 'Dashboard'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {location.pathname === '/dashboard' ? 'Visão geral do sistema' : 'Gerenciamento de dados'}
                  </p>
                </div>
              </div>

              {/* Right Side */}
              <div className="flex items-center space-x-3">
                {/* Search Button */}
                <Button variant="ghost" size="icon" className="hover-scale">
                  <Search className="h-5 w-5" />
                </Button>
                
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative hover-scale">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                    3
                  </Badge>
                </Button>
                
                {/* Theme Toggle */}
                <ThemeToggle />
                
                {/* User Avatar */}
                <Button variant="ghost" size="icon" className="hover-scale">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-primary-foreground font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-muted/10">
            <div className="max-w-7xl mx-auto p-6">
              <div className="animate-fade-in">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
