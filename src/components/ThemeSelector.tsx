import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { getAvailableColorProfiles, getColorProfileInfo, colorSchemes } from '../lib/theme.config'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Separator } from './ui/separator'
import { Sun, Moon, Palette, Sparkles } from 'lucide-react'

// Função para obter a cor específica de um perfil
function getProfileColor(profile: string, mode: 'light' | 'dark'): string {
  const colorScheme = colorSchemes[profile as keyof typeof colorSchemes] || colorSchemes.default
  const colors = mode === 'dark' ? colorScheme.dark : colorScheme.light
  return `hsl(${colors.primary})`
}

// Função para obter cores específicas de cada perfil para os círculos
function getProfileDisplayColors(profile: string): { primary: string, secondary: string } {
  const profileColors: Record<string, { primary: string, secondary: string }> = {
    default: { primary: 'hsl(220.9 39.3% 11%)', secondary: 'hsl(220 14.3% 95.9%)' },
    blue: { primary: 'hsl(221.2 83.2% 53.3%)', secondary: 'hsl(210 40% 96%)' },
    purple: { primary: 'hsl(262.1 83.3% 57.8%)', secondary: 'hsl(220 14.3% 95.9%)' },
    green: { primary: 'hsl(142.1 76.2% 36.3%)', secondary: 'hsl(240 4.8% 95.9%)' },
    orange: { primary: 'hsl(24.6 95% 53.1%)', secondary: 'hsl(60 4.8% 95.9%)' },
    rose: { primary: 'hsl(346.8 77.2% 49.8%)', secondary: 'hsl(240 4.8% 95.9%)' },
    violet: { primary: 'hsl(262.1 83.3% 57.8%)', secondary: 'hsl(240 4.8% 95.9%)' },
    emerald: { primary: 'hsl(158.1 64.4% 51.6%)', secondary: 'hsl(240 4.8% 95.9%)' },
    amber: { primary: 'hsl(25 95% 53%)', secondary: 'hsl(240 4.8% 95.9%)' },
    cyan: { primary: 'hsl(188.7 94.5% 42.7%)', secondary: 'hsl(240 4.8% 95.9%)' }
  }
  
  return profileColors[profile] || profileColors.default
}

export function ThemeSelector() {
  const { mode, profile, setMode, setProfile } = useTheme()
  const availableProfiles = getAvailableColorProfiles()

  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light')
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Palette className="h-5 w-5" />
          Personalização Visual
        </CardTitle>
        <CardDescription>
          Escolha o tema e as cores que mais combinam com seu estilo
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Toggle Modo Claro/Escuro */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            {mode === 'light' ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : (
              <Moon className="h-5 w-5 text-blue-400" />
            )}
            <div>
              <p className="font-medium">Modo {mode === 'light' ? 'Claro' : 'Escuro'}</p>
              <p className="text-sm text-muted-foreground">
                {mode === 'light' 
                  ? 'Tema claro para ambientes bem iluminados' 
                  : 'Tema escuro para reduzir cansaço visual'
                }
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMode}
            className="hover-lift"
          >
            Alternar
          </Button>
        </div>

        <Separator />

        {/* Seletor de Perfis de Cor */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Perfis de Cor
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {availableProfiles.map((colorProfile) => {
              const profileInfo = getColorProfileInfo(colorProfile)
              const isSelected = profile === colorProfile
              const displayColors = getProfileDisplayColors(colorProfile)
              
              return (
                <Button
                  key={colorProfile}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setProfile(colorProfile)}
                  className={`
                    h-auto p-3 flex flex-col items-center gap-2 transition-all duration-300
                    ${isSelected 
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' 
                      : 'hover:scale-105 hover:shadow-md'
                    }
                  `}
                >
                  <div 
                    className={`
                      w-8 h-8 rounded-full border-2 transition-all duration-300
                      ${isSelected ? 'scale-110 shadow-lg' : ''}
                    `}
                    style={{
                      backgroundColor: displayColors.primary,
                      borderColor: displayColors.primary
                    }}
                  />
                  <span className="text-xs font-medium">
                    {profileInfo.name}
                  </span>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Preview do Tema Atual */}
        <div className="mt-6 p-4 rounded-lg border bg-card">
          <h4 className="font-medium mb-3">Preview do Tema</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm">Cor Primária</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-sm">Cor Secundária</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-sm">Cor de Destaque</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente compacto para uso em outras partes da aplicação
export function ThemeToggle() {
  const { mode, setMode } = useTheme()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
      className="hover-lift"
    >
      {mode === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="ml-2 hidden sm:inline">
        {mode === 'light' ? 'Escuro' : 'Claro'}
      </span>
    </Button>
  )
}
