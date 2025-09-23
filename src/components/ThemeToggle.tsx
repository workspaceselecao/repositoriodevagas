import React from 'react'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Palette, Sun, Moon, Droplets, Sparkles, Leaf, Zap } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const themes = [
  { name: 'Claro', value: 'light', icon: Sun },
  { name: 'Escuro', value: 'dark', icon: Moon },
  { name: 'Azul', value: 'blue', icon: Droplets },
  { name: 'Roxo', value: 'purple', icon: Sparkles },
  { name: 'Laranja', value: 'orange', icon: Zap },
  { name: 'Verde', value: 'green', icon: Leaf },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const currentTheme = themes.find(t => t.value === theme)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          {currentTheme?.icon && <currentTheme.icon className="h-4 w-4" />}
          <span className="sr-only">Alterar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value as any)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span>{themeOption.name}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
