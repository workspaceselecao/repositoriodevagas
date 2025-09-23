import React from 'react'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Palette, Sun, Moon, Droplets, Sparkles, Leaf, Zap } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const themes = [
  { 
    name: 'Claro', 
    value: 'light', 
    icon: Sun,
    colors: 'from-yellow-400 to-orange-400',
    bgColor: 'bg-gradient-to-r from-yellow-400 to-orange-400',
    textColor: 'text-yellow-600'
  },
  { 
    name: 'Escuro', 
    value: 'dark', 
    icon: Moon,
    colors: 'from-slate-600 to-slate-800',
    bgColor: 'bg-gradient-to-r from-slate-600 to-slate-800',
    textColor: 'text-slate-600'
  },
  { 
    name: 'Azul', 
    value: 'blue', 
    icon: Droplets,
    colors: 'from-blue-400 to-blue-600',
    bgColor: 'bg-gradient-to-r from-blue-400 to-blue-600',
    textColor: 'text-blue-600'
  },
  { 
    name: 'Roxo', 
    value: 'purple', 
    icon: Sparkles,
    colors: 'from-purple-400 to-purple-600',
    bgColor: 'bg-gradient-to-r from-purple-400 to-purple-600',
    textColor: 'text-purple-600'
  },
  { 
    name: 'Laranja', 
    value: 'orange', 
    icon: Zap,
    colors: 'from-orange-400 to-red-500',
    bgColor: 'bg-gradient-to-r from-orange-400 to-red-500',
    textColor: 'text-orange-600'
  },
  { 
    name: 'Verde', 
    value: 'green', 
    icon: Leaf,
    colors: 'from-green-400 to-green-600',
    bgColor: 'bg-gradient-to-r from-green-400 to-green-600',
    textColor: 'text-green-600'
  },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const currentTheme = themes.find(t => t.value === theme)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className={`h-9 w-9 relative overflow-hidden ${currentTheme?.bgColor || 'bg-gradient-to-r from-primary to-primary/70'}`}
        >
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
          {currentTheme?.icon && (
            <currentTheme.icon className="h-4 w-4 text-white relative z-10" />
          )}
          <span className="sr-only">Alterar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon
          const isActive = themeOption.value === theme
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value as any)}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? `${themeOption.bgColor} text-white shadow-md` 
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className={`w-6 h-6 rounded-full ${themeOption.bgColor} flex items-center justify-center`}>
                <Icon className="h-3 w-3 text-white" />
              </div>
              <span className={`font-medium ${isActive ? 'text-white' : themeOption.textColor}`}>
                {themeOption.name}
              </span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
