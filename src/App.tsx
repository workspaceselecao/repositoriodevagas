import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CacheProvider } from './contexts/CacheContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './components/ui/toast'
import { useCleanup } from './hooks/useCleanup'
import LoadingScreen from './components/LoadingScreen'
import DebugInfo from './components/DebugInfo'
import LoginPageNew from './components/LoginPageNew'
import { DashboardLayout } from './components/layouts/DashboardLayout'
import Dashboard from './components/Dashboard'
import ListaClientes from './components/ListaClientes'
import ComparativoClientes from './components/ComparativoClientes'
import NovaVagaFormWithScraping from './components/NovaVagaFormWithScraping'
import Configuracoes from './components/Configuracoes'
import GerenciarUsuarios from './components/GerenciarUsuarios'
import VagaView from './components/VagaView'
import EditarVagaForm from './components/EditarVagaForm'
import Diagnostico from './components/Diagnostico'
import { DemoPage } from './components/DemoPage'

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
      <Route path="/login" element={!user ? <LoginPageNew /> : <Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout
            title="Dashboard"
            breadcrumbs={[{ label: 'Dashboard' }]}
          >
            <Dashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/clientes" element={
        <ProtectedRoute>
          <DashboardLayout
            title="Lista de Clientes"
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Clientes' }
            ]}
          >
            <ListaClientes />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/comparativo" element={
        <ProtectedRoute>
          <DashboardLayout
            title="Comparativo de Clientes"
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Comparativo' }
            ]}
          >
            <ComparativoClientes />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/nova-vaga" element={
        <ProtectedRoute>
          <DashboardLayout
            title="Nova Vaga"
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Nova Vaga' }
            ]}
          >
            <NovaVagaFormWithScraping />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/usuarios" element={
        <ProtectedRoute requireAdmin={true}>
          <DashboardLayout
            title="Gerenciar Usuários"
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Usuários' }
            ]}
          >
            <GerenciarUsuarios />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/configuracoes" element={
        <ProtectedRoute requireAdmin={true}>
          <DashboardLayout
            title="Configurações"
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Configurações' }
            ]}
          >
            <Configuracoes />
          </DashboardLayout>
        </ProtectedRoute>
      } />
              <Route path="/dashboard/vaga/:id" element={
                <ProtectedRoute>
                  <DashboardLayout
                    title="Visualizar Vaga"
                    breadcrumbs={[
                      { label: 'Dashboard', href: '/dashboard' },
                      { label: 'Vaga' }
                    ]}
                  >
                    <VagaView />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/editar-vaga/:id" element={
                <ProtectedRoute>
                  <DashboardLayout
                    title="Editar Vaga"
                    breadcrumbs={[
                      { label: 'Dashboard', href: '/dashboard' },
                      { label: 'Editar Vaga' }
                    ]}
                  >
                    <EditarVagaForm />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/diagnostico" element={
                <ProtectedRoute>
                  <DashboardLayout
                    title="Diagnóstico"
                    breadcrumbs={[
                      { label: 'Dashboard', href: '/dashboard' },
                      { label: 'Diagnóstico' }
                    ]}
                  >
                    <Diagnostico />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/demo" element={
                <ProtectedRoute>
                  <DemoPage />
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
      <ToastProvider>
        <AuthProvider>
          <CacheProvider>
            <AppRoutes />
            <DebugInfo />
          </CacheProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
