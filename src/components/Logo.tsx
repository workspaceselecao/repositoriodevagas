import { useTheme } from '../contexts/ThemeContext'

interface LogoProps {
  variant?: 'principal' | 'compacto' | 'icon' | 'favicon'
  className?: string
  width?: number
  height?: number
}

export default function Logo({ 
  variant = 'principal', 
  className = '',
  width,
  height 
}: LogoProps) {
  const { mode } = useTheme()
  const isDark = mode === 'dark'

  const getLogoSrc = () => {
    switch (variant) {
      case 'principal':
        return isDark ? '/logos/logo-repovagas-principal-dark.svg' : '/logos/logo-repovagas-principal.svg'
      case 'compacto':
        return '/logos/logo-repovagas-compacto.svg'
      case 'icon':
        return '/logos/logo-repovagas-icon.svg'
      case 'favicon':
        return '/logos/logo-repovagas-favicon.svg'
      default:
        return '/logos/logo-repovagas-principal.svg'
    }
  }

  const getDefaultDimensions = () => {
    switch (variant) {
      case 'principal':
        return { width: 200, height: 60 }
      case 'compacto':
        return { width: 120, height: 40 }
      case 'icon':
        return { width: 48, height: 48 }
      case 'favicon':
        return { width: 32, height: 32 }
      default:
        return { width: 200, height: 60 }
    }
  }

  const dimensions = getDefaultDimensions()
  const finalWidth = width || dimensions.width
  const finalHeight = height || dimensions.height

  return (
    <img
      src={getLogoSrc()}
      alt="RepoVagas - Repositório de Oportunidades"
      className={`transition-all duration-300 ${className}`}
      width={finalWidth}
      height={finalHeight}
    />
  )
}
