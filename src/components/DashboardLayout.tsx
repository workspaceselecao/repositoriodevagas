import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useRHNovaVagaAccess } from '../hooks/useSystemConfig'
import { SUPER_ADMIN_EMAIL } from '../lib/user-filter'
import { useTheme } from '../contexts/ThemeContext'
import { useUpdateCheck } from '../hooks/useUpdateCheck'
import { useScreenSize } from '../hooks/useScreenSize'
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
import AdminNotifications from './AdminNotifications'
import NotificationsList from './NotificationsList'
import RealtimeNotifications, { useRealtimeNotifications } from './RealtimeNotifications'
import OptimizedRealtimeNotifications from './OptimizedRealtimeNotifications'
import { 
  Home, 
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
  AlertTriangle,
  HelpCircle,
  Shield,
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
  const { isTablet, isMobile } = useScreenSize()
  const { isEnabled: rhNovaVagaEnabled } = useRHNovaVagaAccess()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Hook para notificações em tempo real
  const {
    pendingReports,
    isLoading: notificationsLoading,
    loadPendingReports,
    handleNewReport,
    handleReportUpdate
  } = useRealtimeNotifications()
  

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


  // Fechar menu mobile ao redimensionar e garantir sidebar persistente
  useEffect(() => {
    if (isTablet) {
      setIsMobileMenuOpen(false)
    }
  }, [isTablet])

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

  // Emergency refresh - recarregar aplicação
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
      show: user?.role === 'ADMIN' || (user?.role === 'RH' && rhNovaVagaEnabled)
    },
    {
      icon: Mail,
      label: 'Contato',
      href: '/dashboard/contato',
      show: true
    },
    {
      icon: HelpCircle,
      label: 'Tira Dúvidas',
      href: '/dashboard/tira-duvidas',
      show: user?.role === 'RH'
    },
    {
      icon: AlertTriangle,
      label: 'Reports',
      href: '/dashboard/reports',
      show: user?.role === 'ADMIN'
    },
    {
      icon: Settings,
      label: 'Configurações',
      href: '/dashboard/configuracoes',
      show: user?.role === 'ADMIN'
    },
    {
      icon: Shield,
      label: 'Painel de Controle',
      href: '/admin/control-panel',
      show: user?.email === SUPER_ADMIN_EMAIL && user?.role === 'ADMIN'
    },
  ]

  const isActive = (href: string) => {
    return location.pathname === href
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar Desktop - Persistente a partir de 800px */}
        {isTablet && (
          <div 
            className={`flex transition-all duration-300 ${
              isCollapsed ? 'w-16' : 'w-64'
            }`}
            style={{ 
              minWidth: isCollapsed ? '64px' : '256px',
              maxWidth: isCollapsed ? '64px' : '256px'
            }}
          >
          <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)}>
            <div className="flex flex-col h-full">
              {/* Header Section - Logo + Toggle */}
              <div className={`flex items-center justify-between py-4 border-b border-border/50 ${
                isCollapsed ? "px-2" : "px-4"
              }`}>
                {/* Logo Principal - Sempre na primeira linha */}
                {isCollapsed ? (
                  <div className="flex items-center justify-center w-full">
                    <Logo variant="icon" width={48} height={48} />
                  </div>
                ) : (
                  <div className="flex items-center w-full">
                    <Logo variant="principal" width={250} height={90} />
                  </div>
                )}
                
                {/* Seta de Colapso/Expansão - Posicionada mais à direita */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="h-8 w-8 hover:bg-primary/10 transition-colors flex-shrink-0 ml-auto"
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
                            : "hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary"
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
                    <Badge variant="outline" className="text-xs w-fit bg-primary/10 dark:bg-primary/20 text-primary border-primary/20">
                      {user?.role}
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Botão de Recarregar Aplicação */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 rounded-lg hover-button ${
                      isCollapsed 
                        ? "justify-center p-3 h-11 w-11" 
                        : "justify-start px-3 py-2.5 h-11"
                    }`}
                    onClick={handleEmergencyRefresh}
                  >
                    <AlertTriangle className={`${isCollapsed ? "h-5 w-5" : "h-4 w-4"}`} />
                    {!isCollapsed && <span className="ml-3 text-sm font-medium">Recarregar</span>}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="ml-2">
                    <p>Recarregar Aplicação</p>
                  </TooltipContent>
                )}
              </Tooltip>

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
        )}

        {/* Sidebar Mobile Overlay - Apenas para resoluções < 800px */}
        {isMobileMenuOpen && isMobile && (
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="fixed left-0 top-0 h-full w-64 bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <Sidebar isCollapsed={false} onToggle={() => {}}>
                {/* Mobile Header */}
                <div className="flex items-center justify-between py-4 px-4 border-b border-border/50">
                  <div className="flex items-center space-x-3">
                    <Logo variant="principal" width={250} height={90} />
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
                            : "hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary"
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
                      <Badge variant="outline" className="text-xs w-fit bg-primary/10 dark:bg-primary/20 text-primary border-primary/20">
                        {user?.role}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-3 py-2.5 h-11 text-foreground hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-all duration-200 rounded-lg mb-2"
                    onClick={() => setIsChangePasswordModalOpen(true)}
                  >
                    <Key className="h-4 w-4" />
                    <span className="ml-3 text-sm font-medium">Alterar Senha</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start px-3 py-2.5 h-11 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 rounded-lg mb-2"
                    onClick={handleEmergencyRefresh}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span className="ml-3 text-sm font-medium">Recarregar Aplicação</span>
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
          {/* Mobile Menu Button - Apenas para resoluções < 800px */}
          {isMobile && (
            <div className="fixed top-4 left-4 z-50">
            <Button
              variant="ghost"
              size="icon"
              className="hover-scale bg-card/80 shadow-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            </div>
          )}

          {/* Theme Toggle e Notificações - Fixed Position */}
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
            {/* Notificações em tempo real */}
            <RealtimeNotifications 
              onNewReport={handleNewReport}
              onReportUpdate={handleReportUpdate}
            />
            
            {/* Lista de notificações (já inclui o ícone de sino) */}
            <NotificationsList 
              pendingReports={pendingReports}
              isLoading={notificationsLoading}
              onRefresh={loadPendingReports}
            />
            
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

      {/* Sistema de notificações otimizado */}
      <OptimizedRealtimeNotifications
        onNewReport={(report) => {
          console.log('🔔 Novo report recebido via sistema otimizado:', report)
        }}
        onReportUpdate={(report) => {
          console.log('🔔 Report atualizado via sistema otimizado:', report)
        }}
        onDataChange={(type, data) => {
          console.log('🔔 Dados atualizados via sistema otimizado:', type, data)
        }}
      />

    </TooltipProvider>
  )
}
