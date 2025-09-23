'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Sidebar, SidebarItem } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  Users, 
  Settings, 
  LogOut, 
  UserPlus,
  FileText,
  BarChart3
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const menuItems = [
    {
      icon: Home,
      label: 'Lista de Clientes',
      href: '/dashboard',
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
      label: 'Nova Vaga',
      href: '/dashboard/nova-vaga',
      show: true
    },
    {
      icon: Users,
      label: 'Usuários',
      href: '/dashboard/usuarios',
      show: user?.role === 'ADMIN' || user?.role === 'RH'
    },
    {
      icon: Settings,
      label: 'Configurações',
      href: '/dashboard/configuracoes',
      show: user?.role === 'ADMIN'
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)}>
        {menuItems.map((item, index) => {
          if (!item.show) return null
          
          const Icon = item.icon
          return (
            <SidebarItem key={index} isCollapsed={isCollapsed}>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push(item.href)}
              >
                <Icon className="h-4 w-4" />
                {!isCollapsed && <span className="ml-2">{item.label}</span>}
              </Button>
            </SidebarItem>
          )
        })}
        
        <div className="mt-auto p-4">
          <SidebarItem isCollapsed={isCollapsed}>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Sair</span>}
            </Button>
          </SidebarItem>
        </div>
      </Sidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              Repositório de Vagas
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Olá, {user?.name}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user?.role}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
