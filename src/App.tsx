import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { DataCacheProvider } from './contexts/DataCacheContext'
import { useCleanup } from './hooks/useCleanup'
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

function AppRoutes() {
  const { user, loading, error, retry } = useAuth()

  // Se há erro, mostrar ErrorFallback
  if (error) {
    return <ErrorFallback error={error} onRetry={retry} />
  }

  // Redirecionamento automático se usuário já está logado
  if (user && (window.location.pathname === '/login' || window.location.pathname === '/')) {
    return <Navigate to="/dashboard" replace />
  }

  if (loading) {
    return (
      <LoadingScreen 
        message={user ? 'Carregando dados...' : 'Inicializando aplicação...'} 
      />
    )
  }

  return (
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
  )
}

function App() {
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataCacheProvider>
          <AppRoutes />
          <DebugInfo />
        </DataCacheProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
