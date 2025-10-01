import { useTheme } from '../contexts/ThemeContext'

export function useThemeClasses() {
  const { mode, profile } = useTheme()
  
  const getCardVariant = (index: number) => {
    const variants = [
      'card-pastel-blue',
      'card-pastel-purple', 
      'card-pastel-green',
      'card-pastel-orange',
      'card-pastel-pink',
      'card-pastel-teal'
    ]
    return variants[index % variants.length]
  }
  
  const getGradientVariant = (index: number) => {
    const variants = [
      'gradient-pastel-blue',
      'gradient-pastel-purple',
      'gradient-pastel-green', 
      'gradient-pastel-orange',
      'gradient-pastel-pink',
      'gradient-pastel-teal'
    ]
    return variants[index % variants.length]
  }
  
  const textClasses = {
    primary: mode === 'dark' ? 'text-contrast-primary' : 'text-gray-900',
    secondary: mode === 'dark' ? 'text-contrast-secondary' : 'text-gray-700',
    muted: mode === 'dark' ? 'text-contrast-muted' : 'text-gray-500',
    accent: mode === 'dark' ? 'text-contrast-accent' : 'text-blue-600',
    heading: mode === 'dark' ? 'text-xl font-bold text-contrast-primary uppercase tracking-wide' : 'text-xl font-bold text-gray-900 uppercase tracking-wide'
  }
  
  const cardClasses = {
    base: 'w-full hover-pastel transition-all duration-300',
    header: 'cursor-pointer transition-colors'
  }
  
  return {
    mode,
    profile,
    getCardVariant,
    getGradientVariant,
    textClasses,
    cardClasses
  }
}
