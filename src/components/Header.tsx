import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Logo from './Logo'
import { Button } from './ui/button'
import { ArrowLeft } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  backTo?: string
  className?: string
}

export default function Header({ 
  title, 
  subtitle, 
  showBackButton = false, 
  backTo = '/dashboard',
  className = '' 
}: HeaderProps) {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-4">
        {showBackButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(backTo)}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        )}
        
        <div className="flex items-center space-x-4">
          <Logo variant="compacto" width={100} height={32} />
          <div className="h-8 w-px bg-border" />
          <div>
            <h1 className="text-2xl font-bold font-heading text-repovagas-primary">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm font-body text-repovagas-text-secondary">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {user && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-body text-repovagas-text-secondary">
            {user.name}
          </span>
          <div className="w-8 h-8 bg-repovagas-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
