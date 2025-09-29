import { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { updateUserPassword, validateCurrentPassword } from '../lib/auth'
import { validatePasswordStrength, getPasswordStrength, passwordsMatch } from '../lib/password-utils'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Shield, Lock } from 'lucide-react'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function ChangePasswordModal({ isOpen, onClose, onSuccess }: ChangePasswordModalProps) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'validate' | 'change'>('validate') // 'validate' ou 'change'
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [shakeError, setShakeError] = useState(false)
  const { config } = useTheme()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpar mensagens quando o usuário digita
    if (message) {
      setMessage('')
      setShakeError(false)
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleValidateCurrentPassword = async () => {
    if (!formData.currentPassword) {
      setMessage('Por favor, digite sua senha atual.')
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const result = await validateCurrentPassword(formData.currentPassword)
      
      if (result.success) {
        setStep('change')
        setMessage('')
      } else {
        setMessage(result.message)
        setShakeError(true)
        setTimeout(() => setShakeError(false), 500)
      }
    } catch (error) {
      setMessage('Erro inesperado. Tente novamente.')
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    // Validações
    if (!formData.newPassword) {
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

    if (!passwordsMatch(formData.newPassword, formData.confirmPassword)) {
      setMessage('As senhas não coincidem.')
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
      return
    }

    const validation = validatePasswordStrength(formData.newPassword)
    if (!validation.isValid) {
      setMessage(`Senha muito fraca. ${validation.errors.join(', ')}`)
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const result = await updateUserPassword(formData.newPassword)
      
      if (result.success) {
        setIsSuccess(true)
        setMessage(result.message)
        
        // Fechar modal após sucesso
        setTimeout(() => {
          onSuccess?.()
          handleClose()
        }, 2000)
      } else {
        setMessage(result.message)
        setShakeError(true)
        setTimeout(() => setShakeError(false), 500)
      }
    } catch (error) {
      setMessage('Erro inesperado. Tente novamente.')
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    // Reset do estado
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    })
    setStep('validate')
    setMessage('')
    setIsSuccess(false)
    setShakeError(false)
    setLoading(false)
    
    onClose()
  }

  const passwordStrength = formData.newPassword ? getPasswordStrength(formData.newPassword) : null
  const passwordsMatchResult = formData.newPassword && formData.confirmPassword ? passwordsMatch(formData.newPassword, formData.confirmPassword) : null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Alterar Senha
          </DialogTitle>
          <DialogDescription>
            {step === 'validate' 
              ? 'Digite sua senha atual para continuar'
              : 'Digite sua nova senha segura'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'validate' ? (
            /* Etapa 1: Validar senha atual */
            <>
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Senha Atual
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Digite sua senha atual"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    className={`pr-12 ${loading ? 'opacity-50' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                    disabled={loading}
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Mensagem de erro */}
              {message && (
                <div className={`flex items-center gap-2 p-3 rounded-lg border transition-all duration-300 ${
                  shakeError ? 'animate-shake' : ''
                } ${
                  config.effects.glassmorphism 
                    ? 'bg-destructive/20 backdrop-blur-sm border-destructive/30' 
                    : 'bg-destructive/10 border-destructive/20'
                }`}>
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  <span className="text-destructive text-sm font-medium">
                    {message}
                  </span>
                </div>
              )}
            </>
          ) : (
            /* Etapa 2: Nova senha */
            <>
              {/* Campo Nova Senha */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Digite sua nova senha"
                    autoComplete="new-password"
                    required
                    disabled={loading}
                    className={`pr-12 ${loading ? 'opacity-50' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                    disabled={loading}
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Indicador de força da senha */}
                {formData.newPassword && passwordStrength && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Força:</span>
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Confirmar Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirme sua nova senha"
                    autoComplete="new-password"
                    required
                    disabled={loading}
                    className={`pr-12 ${loading ? 'opacity-50' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                    disabled={loading}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                <div className={`flex items-center gap-2 p-3 rounded-lg border transition-all duration-300 ${
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
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${
                    isSuccess ? 'text-success' : 'text-destructive'
                  }`}>
                    {message}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          
          {step === 'validate' ? (
            <Button
              type="button"
              onClick={handleValidateCurrentPassword}
              disabled={loading || !formData.currentPassword}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Validando...
                </div>
              ) : (
                'Continuar'
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleChangePassword}
              disabled={loading || !formData.newPassword || !formData.confirmPassword || passwordsMatchResult === false}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Alterando...
                </div>
              ) : (
                'Alterar Senha'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
