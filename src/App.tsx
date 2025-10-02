import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CacheProvider } from './contexts/CacheContext'
import { ThemeProvider } from './contexts/ThemeContext'
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
import GerenciarUsuarios from './components/GerenciarUsuarios'
import Contato from './components/Contato'
import VagaView from './components/VagaView'
import EditarVagaForm from './components/EditarVagaForm'
import EditarVagaFromReport from './components/EditarVagaFromReport'
import ReportsList from './components/ReportsList'
import RHProtectedRoute from './components/RHProtectedRoute'

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

function AppRoutes() {
  const { user, loading, error, retry } = useAuth()

  // Se há erro, mostrar ErrorFallback
  if (error) {
    return <ErrorFallback error={error} onRetry={retry} />
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
      <Route path="/dashboard/usuarios" element={
        <ProtectedRoute requireAdmin={true}>
          <DashboardLayout>
            <GerenciarUsuarios />
          </DashboardLayout>
        </ProtectedRoute>
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
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function App() {
  // Hook para limpeza de cache
  useCleanup()
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <CacheProvider>
          <AppRoutes />
          <DebugInfo />
        </CacheProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
