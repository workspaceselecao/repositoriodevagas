import React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const location = useLocation()
  
  // Gerar breadcrumbs automaticamente baseado na rota
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/dashboard' }
    ]
    
    if (pathSegments.length > 1) {
      const pageMap: Record<string, string> = {
        'clientes': 'Lista de Vagas',
        'comparativo': 'Comparativo',
        'nova-vaga': 'Nova Vaga',
        'usuarios': 'Usuários',
        'configuracoes': 'Configurações',
        'diagnostico': 'Diagnóstico'
      }
      
      const currentPage = pageMap[pathSegments[1]]
      if (currentPage) {
        breadcrumbs.push({
          label: currentPage,
          href: `/dashboard/${pathSegments[1]}`
        })
      }
    }
    
    return breadcrumbs
  }
  
  const breadcrumbItems = items || generateBreadcrumbs()
  
  return (
    <nav className={`flex items-center space-x-1 text-sm text-muted-foreground ${className}`}>
      <Link 
        to="/dashboard" 
        className="flex items-center hover:text-foreground transition-colors duration-200"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4" />
          {item.href && index < breadcrumbItems.length - 1 ? (
            <Link 
              to={item.href}
              className="hover:text-foreground transition-colors duration-200"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
