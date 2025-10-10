import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Mail, Send, User, MessageSquare, Phone, MessageCircle, Users, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getRecipientEmails } from '../lib/contactEmail'
import { sendContactEmail, testEmailConfig } from '../lib/emailService'
import { getAllContactEmailConfigs } from '../lib/contactEmail'
import { ContactEmailConfig } from '../types/database'

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
  const [teamsContacts, setTeamsContacts] = useState<ContactEmailConfig[]>([]) // Lista de admins com Teams
  const [selectedAdmin, setSelectedAdmin] = useState<string>('') // Admin selecionado no dropdown
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
        
        // Filtrar admins ativos que têm email válido (para criar link Teams)
        const adminsWithTeams = contactConfigs
          .filter(config => config.ativo && config.email)
          .map(config => {
            // Se não houver teams_contact configurado, criar automaticamente baseado no email
            if (!config.teams_contact && config.email.endsWith('@atento.com')) {
              return {
                ...config,
                teams_contact: `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(config.email)}`
              }
            }
            return config
          })
          .filter(config => config.teams_contact) // Apenas admins com link Teams disponível
        
        console.log('💬 [Contato] Admins com Teams carregados:', adminsWithTeams)
        setTeamsContacts(adminsWithTeams)
        
        // Selecionar o primeiro admin por padrão, se houver
        if (adminsWithTeams.length > 0) {
          setSelectedAdmin(adminsWithTeams[0].id)
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

  const handleAdminSelect = (adminId: string) => {
    setSelectedAdmin(adminId)
  }

  const handleOpenTeamsChat = () => {
    const admin = teamsContacts.find(contact => contact.id === selectedAdmin)
    if (admin?.teams_contact) {
      console.log('💬 [Contato] Abrindo chat do Teams com:', admin.nome || admin.email)
      window.open(admin.teams_contact, '_blank', 'noopener,noreferrer')
    }
  }

  const getSelectedAdmin = () => {
    return teamsContacts.find(contact => contact.id === selectedAdmin)
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
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      {/* Card destacado para chat direto no Teams */}
      {teamsContacts.length > 0 && (
        <Card className="border-2 border-blue-500 dark:border-blue-600 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Resposta Instantânea via Teams
              </span>
            </CardTitle>
            <CardDescription className="text-base">
              Precisa de uma resposta rápida? Fale diretamente com um de nossos administradores através do Microsoft Teams.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="admin-select" className="flex items-center gap-2 text-base font-semibold">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Escolha o Administrador
              </Label>
              <Select value={selectedAdmin} onValueChange={handleAdminSelect}>
                <SelectTrigger 
                  id="admin-select" 
                  className="w-full border-2 border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-900 h-12 text-base"
                >
                  <SelectValue placeholder="Selecione um administrador" />
                </SelectTrigger>
                <SelectContent>
                  {teamsContacts.map(contact => (
                    <SelectItem key={contact.id} value={contact.id} className="text-base py-3">
                      <div className="flex items-center gap-3">
                        <MessageCircle className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="font-medium">
                            {contact.nome || contact.email}
                          </div>
                          {contact.nome && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {contact.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {getSelectedAdmin() && (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  onClick={handleOpenTeamsChat}
                  className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                  size="lg"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Iniciar Chat no Teams
                </Button>
              </div>
            )}

            <div className="flex items-start gap-2 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-300 dark:border-blue-700">
              <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Dica:</strong> O chat será aberto automaticamente no Microsoft Teams. 
                {getSelectedAdmin() && (
                  <span className="block mt-1">
                    Você será conectado com <strong>{getSelectedAdmin()?.nome || getSelectedAdmin()?.email}</strong>.
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card do formulário de contato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Enviar Email de Contato
          </CardTitle>
          <CardDescription>
            Ou envie sua mensagem por email. A mensagem será enviada automaticamente via Resend para nossa equipe.
            {recipientEmails.length > 1 && (
              <span className="block mt-2 text-sm text-blue-600 dark:text-blue-400">
                📧 Sua mensagem será enviada para {recipientEmails.length} destinatários configurados.
              </span>
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
