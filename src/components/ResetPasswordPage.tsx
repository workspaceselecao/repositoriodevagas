import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { resetPasswordWithToken, logoutAndRedirect, hasPasswordRecoverySession } from '../lib/auth'
import { validatePasswordStrength, getPasswordStrength, passwordsMatch } from '../lib/password-utils'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { ThemeToggle } from './ThemeToggle'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Shield, X } from 'lucide-react'

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [shakeError, setShakeError] = useState(false)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)
  const [searchParams] = useSearchParams()
  const { config } = useTheme()
  const navigate = useNavigate()

    // Verificar se há uma sessão de recuperação válida
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Verificar se há um token na URL (indica que o usuário clicou no link)
        const url = new URL(window.location.href)
        const hashParams = new URLSearchParams(url.hash.substring(1))
        const queryParams = new URLSearchParams(url.search)
        const hasToken = hashParams.has('access_token') || hashParams.has('token_hash') || 
                        queryParams.has('access_token') || queryParams.has('token_hash')

        const hasSession = await hasPasswordRecoverySession()
        setIsValidSession(hasSession)

        if (!hasSession) {
          // Mensagem mais específica baseada na presença do token
          if (hasToken) {
            setMessage('Este link de recuperação já foi usado ou expirou. Links de recuperação só podem ser usados uma vez. Por favor, solicite um novo link.')
          } else {
            setMessage('Link de recuperação inválido ou expirado. Solicite um novo link.')
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error)
        setIsValidSession(false)
        setMessage('Erro ao verificar link de recuperação. Tente solicitar um novo link.')
      }
    }

    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setShakeError(false)

    // Validações
    if (!formData.password) {
      setMessage('Por favor, digite uma nova senha.')
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
      return
    }

    if (!formData.confirmPassword) {
      setMessage('Por favor, confirme sua nova senha.')
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
      return
    }

    if (!passwordsMatch(formData.password, formData.confirmPassword)) {
      setMessage('As senhas não coincidem.')
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
      return
    }

    const validation = validatePasswordStrength(formData.password)
    if (!validation.isValid) {
      setMessage(`Senha muito fraca. ${validation.errors.join(', ')}`)
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
      return
    }

    setLoading(true)

    try {
      const result = await resetPasswordWithToken(formData.password)
      
      if (result.success) {
        setIsSuccess(true)
        setMessage(result.message)
        
        // Redirecionar após sucesso
        setTimeout(() => {
          logoutAndRedirect()
        }, 2000)
      } else {
        setIsSuccess(false)
        setMessage(result.message)
        setShakeError(true)
        setTimeout(() => setShakeError(false), 500)
      }
    } catch (error) {
      setIsSuccess(false)
      setMessage('Erro inesperado. Tente novamente mais tarde.')
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null
  const passwordsMatchResult = formData.password && formData.confirmPassword ? passwordsMatch(formData.password, formData.confirmPassword) : null

  // Se não há sessão válida, mostrar tela de erro
  if (isValidSession === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20"></div>
        
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>

        <Card className={`w-full max-w-md relative z-10 transition-all duration-300 ${
          config.effects.glassmorphism 
            ? 'bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl' 
            : 'bg-card shadow-xl'
        }`}>
          <CardHeader className="text-center space-y-6 pb-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center">
                <X className="h-10 w-10 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-destructive">
                Link Inválido
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                Este link de recuperação não é válido ou expirou
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 px-8 pb-8">
            <div className="flex items-center gap-2 p-4 rounded-xl border bg-destructive/10 border-destructive/20">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <span className="text-destructive text-sm font-medium">
                {message}
              </span>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/forgot-password')}
                className="w-full"
              >
                Solicitar Novo Link
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Voltar ao Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background dinâmico baseado no tema */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20"></div>
      
      {/* Padrão de fundo animado */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40 animate-pulse"></div>
      
      {/* Círculos flutuantes decorativos */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-secondary/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-10 w-16 h-16 bg-accent/10 rounded-full blur-xl animate-pulse delay-500"></div>
      
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Card principal com glassmorphism */}
      <Card className={`w-full max-w-md relative z-10 transition-all duration-300 hover:shadow-2xl ${
        config.effects.glassmorphism 
          ? 'bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl' 
          : 'bg-card shadow-xl'
      } ${shakeError ? 'animate-shake' : ''}`}>
        <CardHeader className="text-center space-y-6 pb-8">
          {/* Logo animado */}
          <div className="flex justify-center">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 hover:rotate-6 ${
              config.effects.gradients 
                ? 'bg-gradient-to-br from-primary via-primary/80 to-primary/60' 
                : 'bg-primary'
            }`}>
              <Lock className="h-10 w-10 text-primary-foreground animate-bounce-in" />
            </div>
          </div>
          
          {/* Título com gradiente */}
          <div className="space-y-2">
            <CardTitle className={`text-3xl font-bold transition-all duration-300 ${
              config.effects.gradients 
                ? 'bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent' 
                : 'text-primary'
            }`}>
              Nova Senha
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              {isSuccess 
                ? 'Senha redefinida com sucesso!'
                : 'Digite sua nova senha segura'
              }
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 px-8 pb-8">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Nova Senha */}
              <div className="space-y-3">
                <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    disabled={loading}
                    className={`w-full h-12 px-4 pr-12 transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary ${
                      config.effects.glassmorphism 
                        ? 'bg-white/20 backdrop-blur-sm border-white/30' 
                        : 'bg-background'
                    } ${loading ? 'opacity-50' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Indicador de força da senha */}
                {formData.password && passwordStrength && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Força da senha:</span>
                      <span className={`font-medium ${
                        passwordStrength.color === 'red' ? 'text-red-600' :
                        passwordStrength.color === 'orange' ? 'text-orange-600' :
                        passwordStrength.color === 'yellow' ? 'text-yellow-600' :
                        passwordStrength.color === 'lightgreen' ? 'text-green-600' :
                        'text-green-700'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.color === 'red' ? 'bg-red-500' :
                          passwordStrength.color === 'orange' ? 'bg-orange-500' :
                          passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                          passwordStrength.color === 'lightgreen' ? 'bg-green-500' :
                          'bg-green-600'
                        }`}
                        style={{ width: `${passwordStrength.score}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Campo Confirmar Senha */}
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-medium">
                  <Lock className="h-4 w-4" />
                  Confirmar Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    disabled={loading}
                    className={`w-full h-12 px-4 pr-12 transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary ${
                      config.effects.glassmorphism 
                        ? 'bg-white/20 backdrop-blur-sm border-white/30' 
                        : 'bg-background'
                    } ${loading ? 'opacity-50' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Indicador de confirmação */}
                {formData.confirmPassword && passwordsMatchResult !== null && (
                  <div className="flex items-center gap-2 text-xs">
                    {passwordsMatchResult ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-success">Senhas coincidem</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <span className="text-destructive">Senhas não coincidem</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* Mensagem de erro/sucesso */}
              {message && (
                <div className={`flex items-center gap-2 p-4 rounded-xl border transition-all duration-300 ${
                  shakeError ? 'animate-shake' : ''
                } ${
                  config.effects.glassmorphism 
                    ? isSuccess 
                      ? 'bg-success/20 backdrop-blur-sm border-success/30' 
                      : 'bg-destructive/20 backdrop-blur-sm border-destructive/30'
                    : isSuccess 
                      ? 'bg-success/10 border-success/20' 
                      : 'bg-destructive/10 border-destructive/20'
                }`}>
                  {isSuccess ? (
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${
                    isSuccess ? 'text-success' : 'text-destructive'
                  }`}>
                    {message}
                  </span>
                </div>
              )}
              
              {/* Botão de redefinir */}
              <Button
                type="submit"
                disabled={loading || !formData.password || !formData.confirmPassword || passwordsMatchResult === false}
                className={`w-full h-14 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  config.effects.gradients 
                    ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70' 
                    : 'bg-primary hover:bg-primary/90'
                } ${loading ? 'animate-pulse' : ''}`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redefinindo...
                  </div>
                ) : (
                  'Redefinir Senha'
                )}
              </Button>
            </form>
          ) : (
            /* Tela de sucesso */
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center animate-pulse">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-success">
                  Senha Redefinida!
                </h3>
                <p className="text-muted-foreground text-sm">
                  {message}
                </p>
                <p className="text-xs text-muted-foreground">
                  Você será redirecionado para o login em alguns segundos...
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
