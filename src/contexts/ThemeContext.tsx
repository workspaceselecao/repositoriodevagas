import React, { createContext, useContext, useEffect, useState } from 'react'
import { ThemeVariant, themeVariants } from '../lib/theme.config'

interface ThemeContextType {
  theme: ThemeVariant
  setTheme: (theme: ThemeVariant) => void
  availableThemes: typeof themeVariants
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeVariant>('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeVariant
    if (savedTheme && themeVariants[savedTheme]) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.className = theme
    
    // Aplicar cores CSS customizadas baseadas no tema
    const themeColors = themeVariants[theme].colors
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })
    
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes: themeVariants }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
