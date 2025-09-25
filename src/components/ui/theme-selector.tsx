import React from 'react'
import { motion } from 'framer-motion'
import { Palette, Sun, Moon, Zap, Leaf, Circle, Heart } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { cn } from '../../lib/utils'

const themeIcons = {
  light: Sun,
  dark: Moon,
  'tech-blue': Zap,
  'fresh-green': Leaf,
  'neutral-gray': Circle,
  'warm-pastel': Heart,
}

export function ThemeSelector() {
  const { theme, setTheme, availableThemes } = useTheme()

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Selecionar Tema
        </CardTitle>
        <CardDescription>
          Escolha o tema que melhor se adapta ao seu ambiente de trabalho
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(availableThemes).map(([key, themeConfig]) => {
            const Icon = themeIcons[key as keyof typeof themeIcons]
            const isActive = theme === key
            
            return (
              <motion.div
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={isActive ? "default" : "outline"}
                  className={cn(
                    "w-full h-auto p-4 flex flex-col items-center gap-2",
                    isActive && "ring-2 ring-primary ring-offset-2"
                  )}
                  onClick={() => setTheme(key as any)}
                >
                  <Icon className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium text-sm">{themeConfig.name}</div>
                    <div className="text-xs opacity-70">{themeConfig.description}</div>
                  </div>
                </Button>
              </motion.div>
            )
          })}
        </div>
        
        {/* Preview do tema atual */}
        <div className="mt-6 p-4 rounded-lg border bg-card">
          <div className="text-sm font-medium mb-2">Preview do tema atual:</div>
          <div className="flex gap-2">
            <div className="w-4 h-4 rounded-full bg-primary"></div>
            <div className="w-4 h-4 rounded-full bg-secondary"></div>
            <div className="w-4 h-4 rounded-full bg-accent"></div>
            <div className="w-4 h-4 rounded-full bg-muted"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative"
    >
      <motion.div
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {theme === 'dark' ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </motion.div>
    </Button>
  )
}
