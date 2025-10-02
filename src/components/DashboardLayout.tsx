import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useUpdateCheck } from '../hooks/useUpdateCheck'
import { Sidebar, SidebarItem } from './ui/sidebar'
import { Button } from './ui/button'
import { ThemeToggle } from './ThemeToggle'
import Logo from './Logo'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { Badge } from './ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import SobreModal from './SobreModal'
import UpdateModal from './UpdateModal'
import UpdateNotification from './UpdateNotification'
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
  ChevronLeft,
  ChevronRight,
  Info,
  Key,
  Mail,
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
    hasUpdate,
    isChecking,
    showModal: showUpdateModal,
    handleUpdate: handleAppUpdate,
    handleCloseModal: handleCloseUpdateModal,
    checkForUpdates
  } = useUpdateCheck({
    checkOnMount: true, // Verificar na montagem
    checkInterval: 30 * 60 * 1000, // Verificar a cada 30 minutos
    showModalDelay: 2000, // 2 segundos de delay
    autoCheckOnFocus: false // Desabilitar verificação no foco para evitar loops
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
      label: 'Repo Comunica',
      href: '/dashboard',
      show: true
    },
    {
      icon: Building2,
      label: 'Oportunidades',
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
      label: 'Nova Oportunidade',
      href: '/dashboard/nova-vaga',
      show: true
    },
    {
      icon: Mail,
      label: 'Contato',
      href: '/dashboard/contato',
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
      <div className="flex h-screen bg-background">
        {/* Sidebar Desktop - Visível a partir de 800px */}
        <div className={`hidden tablet:flex transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}>
          <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)}>
            <div className="flex flex-col h-full">
              {/* Header Section - Logo + Toggle */}
              <div className={`flex items-center justify-between py-4 border-b border-border/50 ${
                isCollapsed ? "px-2" : "px-4"
              }`}>
                {/* Logo Principal - Sempre na primeira linha */}
                {isCollapsed ? (
                  <div className="flex items-center justify-center w-full">
                    <Logo variant="icon" width={36} height={36} />
                  </div>
                ) : (
                  <div className="flex items-center w-full">
                    <Logo variant="principal" width={200} height={60} />
                  </div>
                )}
                
                {/* Seta de Colapso/Expansão */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="h-8 w-8 hover:bg-primary/10 transition-colors flex-shrink-0"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Menu Items */}
              <div className={`flex-1 space-y-1 ${
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
                        variant="ghost"
                        className={`transition-all duration-200 rounded-lg hover-modern ${
                          isCollapsed 
                            ? "justify-center p-3 h-11 w-11" 
                            : "justify-start px-3 py-2.5 w-full h-11"
                        } ${
                          isActiveItem 
                            ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" 
                            : "hover:bg-primary/5 hover:text-primary"
                        }`}
                        onClick={() => navigate(item.href)}
                      >
                        <Icon className={`${isCollapsed ? "h-5 w-5" : "h-4 w-4"} ${isActiveItem ? "text-primary-foreground" : ""}`} />
                        {!isCollapsed && (
                          <span className={`ml-3 text-sm font-medium ${isActiveItem ? "text-primary-foreground" : ""}`}>
                            {item.label}
                          </span>
                        )}
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
              

              {/* Botão Sobre - Removido, agora o card do usuário abre o modal */}

              {/* Rodapé - Informações do Usuário */}
              <div className={`border-t border-border/50 mt-auto ${
                isCollapsed ? "p-2 space-y-2 flex flex-col items-center" : "p-4 space-y-3"
              }`}>
              {/* Informações do Usuário - Clicável para abrir modal Sobre */}
              <div 
                className={`w-full flex items-center space-x-3 rounded-lg p-3 hover:bg-accent/50 transition-all duration-200 cursor-pointer ${
                  isCollapsed ? "justify-center" : "justify-start"
                }`}
                onClick={() => setIsSobreModalOpen(true)}
                title={isCollapsed ? `${user?.name || 'Usuário'} - ${user?.role}` : undefined}
              >
                <div className={`${isCollapsed ? "w-10 h-10" : "w-8 h-8"} bg-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <span className="text-primary-foreground font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user?.name || 'Usuário'}
                      </p>
                      {hasUpdate && (
                        <Badge variant="default" className="bg-blue-500 text-white text-xs animate-pulse">
                          Atualização
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs w-fit bg-primary/5 text-primary border-primary/20">
                      {user?.role}
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Botão de Logout */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`w-full text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 rounded-lg hover-button ${
                      isCollapsed 
                        ? "justify-center p-3 h-11 w-11" 
                        : "justify-start px-3 py-2.5 h-11"
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
          <div className="tablet:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="fixed left-0 top-0 h-full w-64 bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <Sidebar isCollapsed={false} onToggle={() => {}}>
                {/* Mobile Header */}
                <div className="flex items-center justify-between py-4 px-4 border-b border-border/50">
                  <div className="flex items-center space-x-3">
                    <Logo variant="principal" width={160} height={48} />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="h-8 w-8 hover:bg-primary/10 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>

                {/* Menu Items Mobile */}
                <div className="flex-1 p-4 space-y-1">
                  {menuItems.map((item, index) => {
                    if (!item.show) return null
                    
                    const Icon = item.icon
                    const isActiveItem = isActive(item.href)
                    
                    return (
                      <Button
                        key={index}
                        variant="ghost"
                        className={`w-full justify-start px-3 py-2.5 h-11 transition-all duration-200 rounded-lg hover-modern ${
                          isActiveItem 
                            ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" 
                            : "hover:bg-primary/5 hover:text-primary"
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
                <div className="p-4 border-t border-border/50 space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 cursor-pointer"
                       onClick={() => setIsSobreModalOpen(true)}>
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-primary-foreground font-bold text-sm">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        Olá, {user?.name}
                      </p>
                      <Badge variant="outline" className="text-xs w-fit bg-primary/5 text-primary border-primary/20">
                        {user?.role}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-3 py-2.5 h-11 text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 rounded-lg mb-2"
                    onClick={() => setIsChangePasswordModalOpen(true)}
                  >
                    <Key className="h-4 w-4" />
                    <span className="ml-3 text-sm font-medium">Alterar Senha</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-3 py-2.5 h-11 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 rounded-lg"
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
          {/* Mobile Menu Button */}
          <div className="tablet:hidden fixed top-4 left-4 z-50">
            <Button
              variant="ghost"
              size="icon"
              className="hover-scale bg-card/80 shadow-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Theme Toggle - Fixed Position */}
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-background">
            <div className="max-w-7xl mx-auto p-3 tablet:p-4 laptop:p-6">
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

      {/* Notificação de Atualização */}
      <UpdateNotification
        hasUpdate={hasUpdate}
        isChecking={isChecking}
        onUpdate={handleAppUpdate}
        onCheckUpdate={checkForUpdates}
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
