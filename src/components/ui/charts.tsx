import React from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { cn } from '../../lib/utils'

interface ChartProps {
  title?: string
  description?: string
  className?: string
  data: any[]
}

// Cores do tema
const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--muted))',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300'
]

export function BarChartComponent({ 
  title, 
  description, 
  className, 
  data,
  dataKey,
  xAxisKey = 'name'
}: ChartProps & { dataKey: string; xAxisKey?: string }) {
  return (
    <Card className={cn('', className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey={xAxisKey} 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis className="text-xs" tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Bar 
              dataKey={dataKey} 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function LineChartComponent({ 
  title, 
  description, 
  className, 
  data,
  dataKey,
  xAxisKey = 'name'
}: ChartProps & { dataKey: string; xAxisKey?: string }) {
  return (
    <Card className={cn('', className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey={xAxisKey} 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis className="text-xs" tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function AreaChartComponent({ 
  title, 
  description, 
  className, 
  data,
  dataKey,
  xAxisKey = 'name'
}: ChartProps & { dataKey: string; xAxisKey?: string }) {
  return (
    <Card className={cn('', className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey={xAxisKey} 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis className="text-xs" tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function PieChartComponent({ 
  title, 
  description, 
  className, 
  data,
  dataKey,
  nameKey = 'name'
}: ChartProps & { dataKey: string; nameKey?: string }) {
  return (
    <Card className={cn('', className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Componente de métricas com animação
interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon?: React.ReactNode
  className?: string
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  className 
}: MetricCardProps) {
  const getChangeColor = () => {
    switch (change?.type) {
      case 'increase': return 'text-green-600'
      case 'decrease': return 'text-red-600'
      default: return 'text-muted-foreground'
    }
  }

  const getChangeIcon = () => {
    switch (change?.type) {
      case 'increase': return '↗'
      case 'decrease': return '↘'
      default: return '→'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn('hover:shadow-lg transition-all duration-300', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {change && (
                <div className={cn('flex items-center gap-1 text-sm', getChangeColor())}>
                  <span>{getChangeIcon()}</span>
                  <span>{Math.abs(change.value)}%</span>
                  <span>vs mês anterior</span>
                </div>
              )}
            </div>
            {icon && (
              <div className="text-muted-foreground">
                {icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Componente de dashboard com múltiplos gráficos
interface DashboardChartsProps {
  className?: string
}

export function DashboardCharts({ className }: DashboardChartsProps) {
  // Dados de exemplo
  const barData = [
    { name: 'Jan', vagas: 12 },
    { name: 'Fev', vagas: 19 },
    { name: 'Mar', vagas: 8 },
    { name: 'Abr', vagas: 15 },
    { name: 'Mai', vagas: 22 },
    { name: 'Jun', vagas: 18 },
  ]

  const lineData = [
    { name: 'Jan', candidatos: 45 },
    { name: 'Fev', candidatos: 67 },
    { name: 'Mar', candidatos: 34 },
    { name: 'Abr', candidatos: 89 },
    { name: 'Mai', candidatos: 123 },
    { name: 'Jun', candidatos: 98 },
  ]

  const pieData = [
    { name: 'Tecnologia', value: 35 },
    { name: 'Marketing', value: 25 },
    { name: 'Vendas', value: 20 },
    { name: 'RH', value: 20 },
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Vagas"
          value="156"
          change={{ value: 12, type: 'increase' }}
        />
        <MetricCard
          title="Candidatos Ativos"
          value="1,234"
          change={{ value: 8, type: 'increase' }}
        />
        <MetricCard
          title="Taxa de Conversão"
          value="23.5%"
          change={{ value: 3, type: 'decrease' }}
        />
        <MetricCard
          title="Tempo Médio"
          value="15 dias"
          change={{ value: 0, type: 'neutral' }}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartComponent
          title="Vagas por Mês"
          description="Distribuição mensal de vagas abertas"
          data={barData}
          dataKey="vagas"
        />
        <LineChartComponent
          title="Candidatos por Mês"
          description="Evolução do número de candidatos"
          data={lineData}
          dataKey="candidatos"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartComponent
          title="Taxa de Conversão"
          description="Evolução da taxa de conversão ao longo do tempo"
          data={lineData.map(item => ({ ...item, taxa: item.candidatos * 0.23 }))}
          dataKey="taxa"
        />
        <PieChartComponent
          title="Vagas por Área"
          description="Distribuição de vagas por área de atuação"
          data={pieData}
          dataKey="value"
        />
      </div>
    </div>
  )
}
