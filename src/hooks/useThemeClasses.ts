import { useTheme } from '../contexts/ThemeContext'

export function useThemeClasses() {
  const { theme } = useTheme()
  
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
    primary: 'text-gray-900 dark:text-contrast-primary',
    secondary: 'text-gray-700 dark:text-contrast-secondary',
    muted: 'text-gray-500 dark:text-contrast-muted',
    accent: 'text-blue-600 dark:text-contrast-accent',
    heading: 'text-xl font-bold text-gray-900 dark:text-contrast-primary uppercase tracking-wide'
  }
  
  const cardClasses = {
    base: 'w-full hover-pastel transition-all duration-300',
    header: 'cursor-pointer hover:bg-gray-50 dark:hover:bg-opacity-20 transition-colors'
  }
  
  return {
    theme,
    getCardVariant,
    getGradientVariant,
    textClasses,
    cardClasses
  }
}
