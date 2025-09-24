import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CacheProvider } from './contexts/CacheContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { useCleanup } from './hooks/useCleanup'
import LoadingScreen from './components/LoadingScreen'
import DebugInfo from './components/DebugInfo'
import EmergencyRefresh from './components/EmergencyRefresh'
import LoginPage from './components/LoginPage'
import DashboardLayout from './components/DashboardLayout'
import Dashboard from './components/Dashboard'
import ListaClientes from './components/ListaClientes'
import ComparativoClientes from './components/ComparativoClientes'
import NovaVagaFormWithScraping from './components/NovaVagaFormWithScraping'
import Configuracoes from './components/Configuracoes'
import GerenciarUsuarios from './components/GerenciarUsuarios'
import VagaView from './components/VagaView'
import EditarVagaForm from './components/EditarVagaForm'
import Diagnostico from './components/Diagnostico'

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
  const { user, loading } = useAuth()

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
        <ProtectedRoute>
          <DashboardLayout>
            <NovaVagaFormWithScraping />
          </DashboardLayout>
        </ProtectedRoute>
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
              <Route path="/dashboard/diagnostico" element={
                <ProtectedRoute>
                  <Diagnostico />
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
  
  const handleEmergencyRefresh = () => {
    // Limpar todos os caches e recarregar
    localStorage.clear()
    sessionStorage.clear()
    window.location.reload()
  }
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <CacheProvider>
          <AppRoutes />
          <DebugInfo />
          <EmergencyRefresh onRefresh={handleEmergencyRefresh} />
        </CacheProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
