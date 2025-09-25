import React from 'react'
import { Button } from './ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from './ui/dropdown-menu'
import { Palette, Sun, Moon, Monitor, Building2, Sparkles, Heart, Gem, Circle } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { ColorProfile, ThemeMode } from '../lib/theme.config'

const profileConfigs: Record<ColorProfile, { 
  name: string; 
  icon: React.ComponentType<{ className?: string }>; 
  emoji: string;
  description: string;
}> = {
  corporate: {
    name: 'Corporate',
    icon: Building2,
    emoji: '🏢',
    description: 'Azul + cinza, mais sério'
  },
  vibrant: {
    name: 'Vibrant',
    icon: Sparkles,
    emoji: '🌈',
    description: 'Gradientes neon e contrastes ousados'
  },
  pastel: {
    name: 'Pastel Soft',
    icon: Heart,
    emoji: '🌸',
    description: 'Cores suaves, mais humanizado'
  },
  glassmorphism: {
    name: 'Dark Glassmorphism',
    icon: Gem,
    emoji: '💎',
    description: 'Fundo blur + transparências elegantes'
  },
  minimal: {
    name: 'Minimal White',
    icon: Circle,
    emoji: '⚪',
    description: 'Super clean, bordas sutis'
  }
}

export function ThemeToggle() {
  const { mode, profile, setMode, setProfile } = useTheme()

  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light')
  }

  const handleProfileChange = (newProfile: ColorProfile) => {
    setProfile(newProfile)
  }

  const currentProfile = profileConfigs[profile]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative transition-all duration-200 hover:scale-105 hover:shadow-md"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Configurações de tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Personalização Visual
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={toggleMode} 
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/50 transition-all duration-200"
        >
          <Monitor className="h-4 w-4" />
          <div className="flex flex-col">
            <span className="font-medium">
              {mode === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            </span>
            <span className="text-xs text-muted-foreground">
              Alternar entre claro e escuro
            </span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-3 p-3">
            <Palette className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="font-medium">Perfil de Cor</span>
              <span className="text-xs text-muted-foreground">
                {currentProfile.description}
              </span>
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56">
            {Object.entries(profileConfigs).map(([key, config]) => {
              const Icon = config.icon
              const isActive = profile === key
              return (
                <DropdownMenuItem
                  key={key}
                  onClick={() => handleProfileChange(key as ColorProfile)}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-all duration-200 ${
                    isActive ? 'bg-accent' : 'hover:bg-accent/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{config.emoji}</span>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{config.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {config.description}
                    </span>
                  </div>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
