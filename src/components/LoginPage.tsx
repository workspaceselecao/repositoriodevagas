import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { ThemeToggle } from './ThemeToggle'
import Logo from './Logo'
import { LoginFormData } from '../types/database'
import { Lock, Mail, Eye, EyeOff, CheckCircle, AlertCircle, KeyRound } from 'lucide-react'

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [shakeError, setShakeError] = useState(false)
  const { login } = useAuth()
  const { config } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setShakeError(false)
    setLoading(true)

    try {
      console.log('[LoginPage] 🚀 Iniciando processo de login...')
      const success = await login(formData)
      
      if (success) {
        console.log('[LoginPage] ✅ Login bem-sucedido, redirecionando...')
        // Redirecionamento imediato após login bem-sucedido
        navigate('/dashboard', { replace: true })
      } else {
        console.log('[LoginPage] ❌ Login falhou')
        setError('Email ou senha incorretos')
        setShakeError(true)
        setTimeout(() => setShakeError(false), 500)
        setLoading(false)
      }
    } catch (error: any) {
      console.error('[LoginPage] ❌ Erro no login:', error)
      // Verificar se é erro de email não confirmado
      if (error.message === 'CONFIRM_EMAIL') {
        setError('Seu cadastro ainda não foi confirmado. Verifique sua caixa de entrada e clique no link de confirmação enviado por email.')
      } else {
        setError('Erro ao fazer login. Tente novamente.')
      }
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Animação de entrada
  useEffect(() => {
    document.body.classList.add('animate-fade-in')
    return () => document.body.classList.remove('animate-fade-in')
  }, [])

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
          {/* Logo RepoVagas */}
          <div className="flex justify-center">
            <div className="transition-all duration-300 hover:scale-105">
              <Logo 
                variant="icon" 
                width={80} 
                height={80} 
                className="drop-shadow-lg" 
              />
            </div>
          </div>
          
          {/* Título com marca RepoVagas */}
          <div className="space-y-2">
            <CardTitle className={`text-4xl font-bold font-logo transition-all duration-300 page-title ${
              config.effects.gradients 
                ? 'bg-gradient-to-r from-repovagas-primary via-repovagas-primary/80 to-repovagas-primary/60 bg-clip-text text-transparent' 
                : 'text-repovagas-primary'
            }`}>
              Repositório de Vagas
            </CardTitle>
            <CardDescription className="page-subtitle text-lg font-body text-repovagas-text-secondary">
              Seu repositório de oportunidades profissionais
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div className="space-y-3">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium field-title">
                  <Mail className="h-4 w-4 icon-primary" />
                  Email
                </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Digite seu email"
                  autoComplete="email"
                  required
                  className={`w-full h-12 px-4 transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary ${
                    config.effects.glassmorphism 
                      ? 'bg-white/20 backdrop-blur-sm border-white/30' 
                      : 'bg-background'
                  }`}
                />
                {formData.email && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-success animate-bounce-in" />
                )}
              </div>
            </div>
            
            {/* Campo Senha */}
            <div className="space-y-3">
                <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium field-title">
                  <Lock className="h-4 w-4 icon-primary" />
                  Senha
                </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  required
                  className={`w-full h-12 px-4 pr-12 transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary ${
                    config.effects.glassmorphism 
                      ? 'bg-white/20 backdrop-blur-sm border-white/30' 
                      : 'bg-background'
                  }`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110 active:scale-95 hover:rotate-12"
                >
                  {showPassword ? <EyeOff className="h-5 w-5 transition-transform duration-200" /> : <Eye className="h-5 w-5 transition-transform duration-200" />}
                </button>
              </div>
            </div>
            
            {/* Lembrar sessão e Esqueci senha */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Lembrar sessão
                </Label>
              </div>
              
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-sm"
              >
                <KeyRound className="h-3 w-3 transition-transform duration-200 hover:rotate-12" />
                Esqueci minha senha
              </button>
            </div>
            
            {/* Mensagem de erro */}
            {error && (
              <div className={`flex items-center gap-2 p-4 rounded-xl border transition-all duration-300 ${
                shakeError ? 'animate-shake' : ''
              } ${
                error.includes('confirmado') 
                  ? (config.effects.glassmorphism 
                      ? 'bg-blue-500/20 backdrop-blur-sm border-blue-500/30' 
                      : 'bg-blue-500/10 border-blue-500/20')
                  : (config.effects.glassmorphism 
                      ? 'bg-destructive/20 backdrop-blur-sm border-destructive/30' 
                      : 'bg-destructive/10 border-destructive/20')
              }`}>
                {error.includes('confirmado') ? (
                  <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                )}
                <span className={`text-sm font-medium ${
                  error.includes('confirmado') ? 'text-blue-700' : 'text-destructive'
                }`}>{error}</span>
              </div>
            )}
            
            {/* Botão de login */}
            <Button
              type="submit"
              disabled={loading}
              className={`w-full h-14 text-base font-semibold transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-xl ${
                loading ? "btn-active" : "btn-text"
              } ${
                config.effects.gradients 
                  ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70' 
                  : 'bg-primary hover:bg-primary/90'
              } ${loading ? 'animate-pulse' : ''}`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
