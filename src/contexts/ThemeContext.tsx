import React, { createContext, useContext, useEffect, useState } from 'react'
import { ThemeMode, ColorProfile, ThemeConfig, getThemeConfig, applyThemeToDocument } from '../lib/theme.config'

interface ThemeContextType {
  mode: ThemeMode
  profile: ColorProfile
  config: ThemeConfig
  setMode: (mode: ThemeMode) => void
  setProfile: (profile: ColorProfile) => void
  setTheme: (mode: ThemeMode, profile: ColorProfile) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light')
  const [profile, setProfile] = useState<ColorProfile>('corporate')
  const [config, setConfig] = useState<ThemeConfig>(getThemeConfig('light', 'corporate'))

  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode
    const savedProfile = localStorage.getItem('theme-profile') as ColorProfile
    
    if (savedMode) setMode(savedMode)
    if (savedProfile) setProfile(savedProfile)
  }, [])

  useEffect(() => {
    const newConfig = getThemeConfig(mode, profile)
    setConfig(newConfig)
    applyThemeToDocument(newConfig)
    
    localStorage.setItem('theme-mode', mode)
    localStorage.setItem('theme-profile', profile)
  }, [mode, profile])

  const setTheme = (newMode: ThemeMode, newProfile: ColorProfile) => {
    setMode(newMode)
    setProfile(newProfile)
  }

  return (
    <ThemeContext.Provider value={{ 
      mode, 
      profile, 
      config, 
      setMode, 
      setProfile, 
      setTheme 
    }}>
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
