import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Mail, Send, User, MessageSquare, Phone, MessageCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getRecipientEmails } from '../lib/contactEmail'
import { sendContactEmail, testEmailConfig } from '../lib/emailService'
import { getAllContactEmailConfigs } from '../lib/contactEmail'

interface ContactFormData {
  nome: string
  email: string
  telefone: string
  assunto: string
  mensagem: string
}

export default function Contato() {
  const [formData, setFormData] = useState<ContactFormData>({
    nome: '',
    email: '',
    telefone: '',
    assunto: '',
    mensagem: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [recipientEmails, setRecipientEmails] = useState<string[]>(['roberio.gomes@atento.com']) // Emails padrão
  const [teamsContact, setTeamsContact] = useState<string>('') // Contato Teams
  const { user } = useAuth()

  // Preencher email automaticamente se o usuário estiver logado
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email
      }))
    }
  }, [user])

  // Carregar emails destinatários e contato Teams
  useEffect(() => {
    const loadContactData = async () => {
      console.log('🔧 [Contato] Carregando dados de contato...')
      try {
        const [emails, contactConfigs] = await Promise.all([
          getRecipientEmails(),
          getAllContactEmailConfigs()
        ])
        
        console.log('📧 [Contato] Emails destinatários carregados:', emails)
        setRecipientEmails(emails)
        
        // Encontrar email com sufixo @atento.com para Teams
        const atentoEmail = contactConfigs.find(config => 
          config.ativo && config.email.endsWith('@atento.com')
        )
        
        if (atentoEmail) {
          // Criar link Teams automático baseado no email @atento.com
          const teamsLink = `mailto:${atentoEmail.email}?subject=Contato via Repositório de Vagas`
          console.log('💬 [Contato] Link Teams criado automaticamente para:', atentoEmail.email)
          console.log('💬 [Contato] Link Teams:', teamsLink)
          setTeamsContact(teamsLink)
        }
        
        console.log('✅ [Contato] Dados de contato carregados com sucesso')
      } catch (error) {
        console.error('❌ [Contato] Erro ao carregar dados de contato:', error)
        // Manter configurações padrão em caso de erro
      }
    }

    loadContactData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      assunto: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('📝 [Contato] Iniciando envio do formulário via Resend...')
    console.log('📝 [Contato] Dados do formulário:', formData)
    console.log('📝 [Contato] Emails destinatários:', recipientEmails)
    
    // Validação básica
    if (!formData.nome || !formData.email || !formData.assunto || !formData.mensagem) {
      console.error('❌ [Contato] Validação falhou - campos obrigatórios não preenchidos')
      setMessage('Por favor, preencha todos os campos obrigatórios.')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')
    setMessageType('')

    try {
      console.log('📧 [Contato] Enviando via Resend...')
      
      // Envio via Resend
      const emailData = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        assunto: formData.assunto,
        mensagem: formData.mensagem,
        destinatarios: recipientEmails
      }

      console.log('📤 [Contato] Dados para envio:', emailData)
      
      const result = await sendContactEmail(emailData)
      
      console.log('📨 [Contato] Resultado do envio:', result)
      
      if (result.success) {
        console.log('✅ [Contato] Email enviado com sucesso!')
        setMessage(result.message)
        setMessageType('success')
        
        // Limpar formulário após sucesso
        setFormData({
          nome: '',
          email: user?.email || '',
          telefone: '',
          assunto: '',
          mensagem: ''
        })
      } else {
        console.error('❌ [Contato] Erro no envio:', result.message)
        setMessage(result.message)
        setMessageType('error')
      }
      
    } catch (error: any) {
      console.error('💥 [Contato] Erro ao enviar mensagem:', error)
      console.error('💥 [Contato] Detalhes do erro:', {
        message: error.message,
        stack: error.stack
      })
      setMessage('Erro ao enviar mensagem. Tente novamente.')
      setMessageType('error')
    } finally {
      console.log('🏁 [Contato] Finalizando envio do formulário')
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Entre em Contato
          </CardTitle>
          <CardDescription>
            Envie sua mensagem diretamente através do sistema. O email será enviado automaticamente via Resend para nossa equipe.
            {recipientEmails.length > 1 && (
              <span className="block mt-2 text-sm text-blue-600 dark:text-blue-400">
                📧 Sua mensagem será enviada para {recipientEmails.length} destinatários configurados pelos administradores.
              </span>
            )}
            {teamsContact && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Contato direto com administrador @atento.com</span>
                </div>
                <a 
                  href={teamsContact} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm font-medium underline">Contato direto @atento.com: Clique aqui</span>
                </a>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome *
                </Label>
                <Input
                  id="nome"
                  name="nome"
                  type="text"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone
              </Label>
              <Input
                id="telefone"
                name="telefone"
                type="tel"
                value={formData.telefone}
                onChange={handleInputChange}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assunto" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Assunto *
              </Label>
              <Select value={formData.assunto} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o assunto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="duvida">Dúvida sobre vagas</SelectItem>
                  <SelectItem value="sugestao">Sugestão de melhoria</SelectItem>
                  <SelectItem value="problema">Reportar problema</SelectItem>
                  <SelectItem value="parceria">Proposta de parceria</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensagem" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Mensagem *
              </Label>
              <Textarea
                id="mensagem"
                name="mensagem"
                value={formData.mensagem}
                onChange={handleInputChange}
                placeholder="Descreva sua mensagem aqui..."
                rows={6}
                required
              />
            </div>

            {message && (
              <div className={`p-4 rounded-md ${
                messageType === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
