import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { resetPasswordForEmail } from '../lib/auth'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { ThemeToggle } from './ThemeToggle'
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [shakeError, setShakeError] = useState(false)
  const { config } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setShakeError(false)
    setLoading(true)

    try {
      const result = await resetPasswordForEmail(email)
      
      if (result.success) {
        setIsSuccess(true)
        setMessage(result.message)
        
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          navigate('/login')
        }, 3000)
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

  const handleBackToLogin = () => {
    navigate('/login')
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
          {/* Botão Voltar */}
          <div className="flex justify-start">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToLogin}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Login
            </Button>
          </div>
          
          {/* Logo animado */}
          <div className="flex justify-center">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 hover:rotate-6 ${
              config.effects.gradients 
                ? 'bg-gradient-to-br from-primary via-primary/80 to-primary/60' 
                : 'bg-primary'
            }`}>
              <Mail className="h-10 w-10 text-primary-foreground animate-bounce-in" />
            </div>
          </div>
          
          {/* Título com gradiente */}
          <div className="space-y-2">
            <CardTitle className={`text-3xl font-bold transition-all duration-300 ${
              config.effects.gradients 
                ? 'bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent' 
                : 'text-primary'
            }`}>
              Recuperar Senha
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              {isSuccess 
                ? 'Email enviado com sucesso!'
                : 'Digite seu email para receber um link de recuperação'
              }
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 px-8 pb-8">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Email */}
              <div className="space-y-3">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    required
                    disabled={loading}
                    className={`w-full h-12 px-4 transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary ${
                      config.effects.glassmorphism 
                        ? 'bg-white/20 backdrop-blur-sm border-white/30' 
                        : 'bg-background'
                    } ${loading ? 'opacity-50' : ''}`}
                  />
                  {email && !loading && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-success animate-bounce-in" />
                  )}
                </div>
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
              
              {/* Botão de envio */}
              <Button
                type="submit"
                disabled={loading || !email}
                className={`w-full h-14 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  config.effects.gradients 
                    ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70' 
                    : 'bg-primary hover:bg-primary/90'
                } ${loading ? 'animate-pulse' : ''}`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </div>
                ) : (
                  'Enviar Link de Recuperação'
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
                  Email Enviado!
                </h3>
                <p className="text-muted-foreground text-sm">
                  {message}
                </p>
                <p className="text-xs text-muted-foreground">
                  Você será redirecionado para o login em alguns segundos...
                </p>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={handleBackToLogin}
                  className="w-full"
                >
                  Voltar ao Login
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Não recebeu o email? Verifique sua caixa de spam ou{' '}
                  <button
                    onClick={() => {
                      setIsSuccess(false)
                      setMessage('')
                      setEmail('')
                    }}
                    className="text-primary hover:underline"
                  >
                    tente novamente
                  </button>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
