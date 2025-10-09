import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { DataProvider, useData } from './contexts/DataContext'
import { useCleanup } from './hooks/useCleanup'
import { handlePageRefresh, detectInfiniteLoop } from './lib/refresh-handler'
import { detectInfiniteLoop as detectLoopAdvanced } from './lib/loop-detector'
import LoadingScreen from './components/LoadingScreen'
import DebugInfo from './components/DebugInfo'
import ErrorFallback from './components/ErrorFallback'
import LoginPage from './components/LoginPage'
import ForgotPasswordPage from './components/ForgotPasswordPage'
import ResetPasswordPage from './components/ResetPasswordPage'
import DashboardLayout from './components/DashboardLayout'
import Dashboard from './components/Dashboard'
import ListaClientes from './components/ListaClientes'
import ComparativoClientes from './components/ComparativoClientes'
import NovaVagaFormWithScraping from './components/NovaVagaFormWithScraping'
import Configuracoes from './components/Configuracoes'
import Contato from './components/Contato'
import VagaView from './components/VagaView'
import EditarVagaForm from './components/EditarVagaForm'
import EditarVagaFromReport from './components/EditarVagaFromReport'
import ReportsList from './components/ReportsList'
import TiraDuvidas from './components/TiraDuvidas'
import RHProtectedRoute from './components/RHProtectedRoute'
import AdminControlPanel from './components/AdminControlPanel'
import { SUPER_ADMIN_EMAIL } from './lib/user-filter'

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen message="Verificando autenticação..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen message="Verificando permissões..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Verificar se é o administrador autorizado
  const isAuthorizedAdmin = user.email === SUPER_ADMIN_EMAIL && user.role === 'ADMIN'
  
  if (!isAuthorizedAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

// Componente para gerenciar carregamento de dados quando usuário está logado
function DataLoadingWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { loading: dataLoading } = useData()

  // SEM timeout de segurança - deixar carregar naturalmente
  console.log('[App] DataLoadingWrapper - user:', !!user, 'dataLoading:', dataLoading)

  // Se usuário está logado mas dados ainda estão carregando
  if (user && dataLoading) {
    console.log('[App] Usuário logado, dados carregando...')
    return <LoadingScreen message="Carregando dados..." />
  }
  
  console.log('[App] Mostrando aplicação - user:', !!user, 'dataLoading:', dataLoading)

  return <>{children}</>
}

function AppRoutes() {
  const { user, loading: authLoading, error, retry } = useAuth()

  // Se há erro, mostrar ErrorFallback
  if (error) {
    return <ErrorFallback error={error} onRetry={retry} />
  }

  // Redirecionamento automático se usuário já está logado
  if (user && (window.location.pathname === '/login' || window.location.pathname === '/')) {
    return <Navigate to="/dashboard" replace />
  }

  if (authLoading) {
    return (
      <LoadingScreen 
        message={user ? 'Carregando dados...' : 'Inicializando aplicação...'} 
      />
    )
  }

  return (
    <DataLoadingWrapper>
      <Routes>
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/forgot-password" element={!user ? <ForgotPasswordPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/clientes" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ListaClientes />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/comparativo" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ComparativoClientes />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/nova-vaga" element={
        <RHProtectedRoute>
          <DashboardLayout>
            <NovaVagaFormWithScraping />
          </DashboardLayout>
        </RHProtectedRoute>
      } />
      <Route path="/dashboard/nova-vaga/:id" element={
        <RHProtectedRoute>
          <DashboardLayout>
            <NovaVagaFormWithScraping />
          </DashboardLayout>
        </RHProtectedRoute>
      } />
      <Route path="/dashboard/configuracoes" element={
        <ProtectedRoute requireAdmin={true}>
          <DashboardLayout>
            <Configuracoes />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/contato" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Contato />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/tira-duvidas" element={
        <ProtectedRoute>
          <DashboardLayout>
            <TiraDuvidas />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/vaga/:id" element={
        <ProtectedRoute>
          <VagaView />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/editar-vaga/:id" element={
        <ProtectedRoute>
          <EditarVagaForm />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/editar-report/:id" element={
        <ProtectedRoute requireAdmin={true}>
          <DashboardLayout>
            <EditarVagaFromReport />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/reports" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ReportsList />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/control-panel" element={
        <AdminRoute>
          <AdminControlPanel />
        </AdminRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DataLoadingWrapper>
  )
}

function App() {
  // Ativar sistema de limpeza de cache
  useCleanup()
  
  // Detectar e gerenciar refresh/reload da página
  useEffect(() => {
    console.log('[App] 🚀 Inicializando aplicação...')
    
    // Detectar loop infinito (sistema básico)
    const hasBasicLoop = detectInfiniteLoop()
    
    // Detectar loop infinito (sistema avançado)
    const hasAdvancedLoop = detectLoopAdvanced()
    
    if (hasBasicLoop || hasAdvancedLoop) {
      console.error('[App] 🚨 Loop infinito detectado pelos dois sistemas!')
      // Se detectou loop, parar aqui e esperar o usuário reagir ao alert
      return
    }
    
    // Gerenciar refresh da página
    handlePageRefresh()
    
    // Log de inicialização
    console.log('[App] ✅ Aplicação inicializada com sucesso')
  }, [])
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
          <DebugInfo />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
