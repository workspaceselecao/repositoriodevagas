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
                      backgroundColor: getProfileColor(colorProfile, mode),
                      borderColor: getProfileColor(colorProfile, mode)
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
