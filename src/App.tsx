import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { useCleanup } from './hooks/useCleanup'
import LoginPage from './components/LoginPage'
import DashboardLayout from './components/DashboardLayout'
import ListaClientes from './components/ListaClientes'
import ComparativoClientes from './components/ComparativoClientes'
import NovaVagaFormWithScraping from './components/NovaVagaFormWithScraping'
import Configuracoes from './components/Configuracoes'
import VagaView from './components/VagaView'
import EditarVagaForm from './components/EditarVagaForm'
import Diagnostico from './components/Diagnostico'

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    )
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground text-sm">Inicializando aplicação...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={
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
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
