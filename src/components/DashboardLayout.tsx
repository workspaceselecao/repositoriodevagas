import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useUpdateCheck } from '../hooks/useUpdateCheck'
import { Sidebar, SidebarItem } from './ui/sidebar'
import { Button } from './ui/button'
import { ThemeToggle } from './ThemeToggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { Badge } from './ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import SobreModal from './SobreModal'
import UpdateModal from './UpdateModal'
import ChangePasswordModal from './ChangePasswordModal'
import { 
  Home, 
  Users, 
  Settings, 
  LogOut, 
  UserPlus,
  FileText,
  BarChart3,
  Building2,
  Menu,
  Info,
  Key
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSobreModalOpen, setIsSobreModalOpen] = useState(false)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false)
  const { user, logout } = useAuth()
  const { config } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  // Hook para verificar atualizações automaticamente
  const {
    showModal: showUpdateModal,
    handleUpdate: handleAppUpdate,
    handleCloseModal: handleCloseUpdateModal,
    checkForUpdates
  } = useUpdateCheck({
    checkOnMount: true, // Verificar na montagem
    checkInterval: 10 * 60 * 1000, // Verificar a cada 10 minutos
    showModalDelay: 2000, // 2 segundos de delay
    autoCheckOnFocus: true // Verificar quando a janela ganha foco
  })


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
            <div className="flex flex-col h-full">
              {/* Menu Items */}
              <div className={`flex-1 space-y-2 ${
                isCollapsed ? "p-2 flex flex-col items-center" : "p-4"
              }`}>
              {menuItems.map((item, index) => {
                if (!item.show) return null
                
                const Icon = item.icon
                const isActiveItem = isActive(item.href)
                
                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActiveItem ? "default" : "ghost"}
                        className={`transition-all duration-200 rounded-xl hover-modern ${
                          isCollapsed 
                            ? "justify-center p-3 h-12 w-12" 
                            : "justify-start px-3 py-2 w-full"
                        } ${
                          isActiveItem 
                            ? "bg-primary text-primary-foreground shadow-md hover-gradient" 
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
              
              {/* Botão Sobre */}
              <div className={`border-t ${
                isCollapsed ? "p-2 flex flex-col items-center" : "p-4"
              }`}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`w-full transition-all duration-200 rounded-xl hover-modern ${
                        isCollapsed 
                          ? "justify-center p-3 h-12 w-12" 
                          : "justify-start px-3 py-2"
                      }`}
                    >
                      <Info className={`${isCollapsed ? "h-5 w-5" : "h-4 w-4"}`} />
                      {!isCollapsed && <span className="ml-3 text-sm font-medium">Sobre</span>}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setIsSobreModalOpen(true)}>
                      <Info className="mr-2 h-4 w-4" />
                      Informações da Aplicação
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Rodapé - Informações do Usuário */}
              <div className={`border-t mt-auto ${
                isCollapsed ? "p-2 space-y-2 flex flex-col items-center" : "p-4 space-y-3"
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
                          {user?.name || 'Usuário'}
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
                      <p className="font-medium">{user?.name || 'Usuário'}</p>
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
                    className={`w-full text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 rounded-xl hover-button ${
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
            </div>
          </Sidebar>
        </div>

        {/* Sidebar Mobile Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="fixed left-0 top-0 h-full w-64 bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <Sidebar isCollapsed={false} onToggle={() => {}}>

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
                        className={`w-full justify-start px-3 py-2 transition-all duration-200 rounded-xl hover-modern ${
                          isActiveItem 
                            ? "bg-primary text-primary-foreground shadow-md hover-gradient" 
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
                    className="w-full justify-start px-3 py-2 text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 rounded-xl mb-2"
                    onClick={() => setIsChangePasswordModalOpen(true)}
                  >
                    <Key className="h-4 w-4" />
                    <span className="ml-3 text-sm font-medium">Alterar Senha</span>
                  </Button>
                  
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
          {/* Mobile Menu Button - Fixed Position */}
          <div className="md:hidden fixed top-4 left-4 z-50">
            <Button
              variant="ghost"
              size="icon"
              className="hover-scale bg-card/80 backdrop-blur-sm shadow-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Theme Toggle - Fixed Position */}
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>

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

      {/* Modal Sobre */}
      <SobreModal 
        isOpen={isSobreModalOpen} 
        onClose={() => setIsSobreModalOpen(false)}
        user={user}
      />

      {/* Modal de Atualização */}
      <UpdateModal
        isOpen={showUpdateModal}
        onClose={handleCloseUpdateModal}
        onUpdate={handleAppUpdate}
      />
      
      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onSuccess={() => {
          // Opcional: mostrar mensagem de sucesso ou fazer logout
          console.log('Senha alterada com sucesso!')
        }}
      />
    </TooltipProvider>
  )
}
