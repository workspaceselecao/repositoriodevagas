import React from 'react'
import { motion } from 'framer-motion'
import { 
  Star, 
  Heart, 
  Zap, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info,
  Plus,
  Download,
  Upload,
  Settings,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  Briefcase,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { DashboardLayout } from './layouts/DashboardLayout'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Toast } from './ui/toast'
import { SkeletonCard, SkeletonTable, SkeletonForm } from './ui/skeleton'
import { DataTable, DefaultActions } from './ui/data-table'
import { 
  BarChartComponent, 
  LineChartComponent, 
  PieChartComponent, 
  MetricCard,
  DashboardCharts 
} from './ui/charts'
import { ThemeSelector } from './ui/theme-selector'
import { useToast } from './ui/toast'
import { cn } from '../lib/utils'

// Dados de exemplo para demonstração
const sampleData = [
  { id: '1', name: 'João Silva', email: 'joao@empresa.com', role: 'ADMIN', status: 'active', createdAt: '2024-01-15' },
  { id: '2', name: 'Maria Santos', email: 'maria@empresa.com', role: 'RH', status: 'active', createdAt: '2024-01-14' },
  { id: '3', name: 'Pedro Costa', email: 'pedro@empresa.com', role: 'USER', status: 'inactive', createdAt: '2024-01-13' },
  { id: '4', name: 'Ana Oliveira', email: 'ana@empresa.com', role: 'RH', status: 'active', createdAt: '2024-01-12' },
  { id: '5', name: 'Carlos Lima', email: 'carlos@empresa.com', role: 'USER', status: 'pending', createdAt: '2024-01-11' },
]

const chartData = [
  { name: 'Jan', vagas: 12, candidatos: 45 },
  { name: 'Fev', vagas: 19, candidatos: 67 },
  { name: 'Mar', vagas: 8, candidatos: 34 },
  { name: 'Abr', vagas: 15, candidatos: 89 },
  { name: 'Mai', vagas: 22, candidatos: 123 },
  { name: 'Jun', vagas: 18, candidatos: 98 },
]

const pieData = [
  { name: 'Tecnologia', value: 35 },
  { name: 'Marketing', value: 25 },
  { name: 'Vendas', value: 20 },
  { name: 'RH', value: 20 },
]

export function DemoPage() {
  const { addToast } = useToast()

  const handleToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: { title: 'Sucesso!', description: 'Operação realizada com sucesso.' },
      error: { title: 'Erro!', description: 'Algo deu errado. Tente novamente.' },
      warning: { title: 'Atenção!', description: 'Verifique os dados antes de continuar.' },
      info: { title: 'Informação', description: 'Esta é uma mensagem informativa.' }
    }
    
    addToast({
      type,
      ...messages[type]
    })
  }

  const columns = [
    { key: 'name' as const, title: 'Nome', sortable: true },
    { key: 'email' as const, title: 'Email', sortable: true },
    { 
      key: 'role' as const, 
      title: 'Função', 
      render: (value: string) => (
        <Badge variant={value === 'ADMIN' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      )
    },
    { 
      key: 'status' as const, 
      title: 'Status',
      render: (value: string) => (
        <Badge 
          variant={
            value === 'active' ? 'default' : 
            value === 'inactive' ? 'destructive' : 
            'secondary'
          }
        >
          {value === 'active' ? 'Ativo' : 
           value === 'inactive' ? 'Inativo' : 'Pendente'}
        </Badge>
      )
    },
    { key: 'createdAt' as const, title: 'Criado em', sortable: true }
  ]

  return (
    <DashboardLayout
      title="Demonstração do Design System"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Demo' }
      ]}
    >
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Sistema de Design Completo
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore todos os componentes, temas e funcionalidades do Repositório de Vagas
          </p>
        </motion.div>

        {/* Temas */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">🎨 Temas e Cores</h2>
          <ThemeSelector />
        </motion.section>

        {/* Botões */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">🔘 Botões</h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Button variant="default">Padrão</Button>
                <Button variant="secondary">Secundário</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destrutivo</Button>
                <Button variant="success">Sucesso</Button>
                <Button variant="warning">Aviso</Button>
                <Button variant="info">Info</Button>
                <Button size="sm">Pequeno</Button>
                <Button size="default">Normal</Button>
                <Button size="lg">Grande</Button>
                <Button size="xl">Extra Grande</Button>
                <Button size="icon"><Plus className="h-4 w-4" /></Button>
                <Button size="icon-sm"><Download className="h-4 w-4" /></Button>
                <Button size="icon-lg"><Upload className="h-4 w-4" /></Button>
                <Button disabled>Desabilitado</Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Cards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">🃏 Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Simples</CardTitle>
                <CardDescription>
                  Este é um card básico com header e conteúdo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Conteúdo do card aqui. Pode conter qualquer tipo de informação.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Card com Ícone
                </CardTitle>
                <CardDescription>
                  Card com ícone e efeito hover
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Favorito</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Rápido</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
              <CardHeader>
                <CardTitle>Card Destacado</CardTitle>
                <CardDescription>
                  Card com gradiente e borda colorida
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge className="bg-primary text-primary-foreground">
                  Destaque
                </Badge>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Badges */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">🏷️ Badges</h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                <Badge variant="default">Padrão</Badge>
                <Badge variant="secondary">Secundário</Badge>
                <Badge variant="destructive">Destrutivo</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge className="bg-green-500 text-white">Sucesso</Badge>
                <Badge className="bg-yellow-500 text-white">Aviso</Badge>
                <Badge className="bg-blue-500 text-white">Info</Badge>
                <Badge className="bg-purple-500 text-white">Roxo</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Toasts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">🍞 Toasts</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button onClick={() => handleToast('success')} variant="success">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Sucesso
                  </Button>
                  <Button onClick={() => handleToast('error')} variant="destructive">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Erro
                  </Button>
                  <Button onClick={() => handleToast('warning')} variant="warning">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Aviso
                  </Button>
                  <Button onClick={() => handleToast('info')} variant="info">
                    <Info className="h-4 w-4 mr-2" />
                    Info
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <Toast type="success" title="Sucesso!" description="Operação realizada com sucesso." />
                  <Toast type="error" title="Erro!" description="Algo deu errado. Tente novamente." />
                  <Toast type="warning" title="Atenção!" description="Verifique os dados antes de continuar." />
                  <Toast type="info" title="Informação" description="Esta é uma mensagem informativa." />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Skeletons */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">💀 Skeletons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonForm />
            <div className="space-y-4">
              <h3 className="font-medium">Tabela</h3>
              <SkeletonTable rows={3} />
            </div>
          </div>
        </motion.section>

        {/* Data Table */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">📊 Data Table</h2>
          <DataTable
            data={sampleData}
            columns={columns}
            actions={DefaultActions({
              onView: (row) => console.log('View:', row),
              onEdit: (row) => console.log('Edit:', row),
              onDelete: (row) => console.log('Delete:', row)
            })}
            searchable
            filterable
            pagination
            pageSize={3}
          />
        </motion.section>

        {/* Charts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">📈 Gráficos</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChartComponent
              title="Vagas por Mês"
              description="Distribuição mensal de vagas"
              data={chartData}
              dataKey="vagas"
            />
            <LineChartComponent
              title="Candidatos por Mês"
              description="Evolução do número de candidatos"
              data={chartData}
              dataKey="candidatos"
            />
            <PieChartComponent
              title="Vagas por Área"
              description="Distribuição por área de atuação"
              data={pieData}
              dataKey="value"
            />
            <div className="space-y-4">
              <h3 className="font-medium">Métricas</h3>
              <div className="grid grid-cols-2 gap-4">
                <MetricCard
                  title="Total de Vagas"
                  value="156"
                  change={{ value: 12, type: 'increase' }}
                  icon={<Briefcase className="h-5 w-5" />}
                />
                <MetricCard
                  title="Candidatos"
                  value="1,234"
                  change={{ value: 8, type: 'increase' }}
                  icon={<Users className="h-5 w-5" />}
                />
                <MetricCard
                  title="Taxa de Conversão"
                  value="23.5%"
                  change={{ value: 3, type: 'decrease' }}
                  icon={<TrendingUp className="h-5 w-5" />}
                />
                <MetricCard
                  title="Tempo Médio"
                  value="15 dias"
                  change={{ value: 0, type: 'neutral' }}
                  icon={<Clock className="h-5 w-5" />}
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Dashboard Completo */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">📊 Dashboard Completo</h2>
          <DashboardCharts />
        </motion.section>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="text-center py-8 border-t border-border"
        >
          <p className="text-muted-foreground">
            ✨ Sistema de Design criado com React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui e Framer Motion
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
