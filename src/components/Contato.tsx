import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Mail, Send, User, MessageSquare, Phone } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getRecipientEmails } from '../lib/contactEmail'

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

  // Carregar emails destinatários configurados pelos admins
  useEffect(() => {
    const loadRecipientEmails = async () => {
      try {
        const emails = await getRecipientEmails()
        setRecipientEmails(emails)
      } catch (error) {
        console.error('Erro ao carregar emails destinatários:', error)
        // Manter emails padrão em caso de erro
      }
    }
    
    loadRecipientEmails()
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
    
    // Validação básica
    if (!formData.nome || !formData.email || !formData.assunto || !formData.mensagem) {
      setMessage('Por favor, preencha todos os campos obrigatórios.')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')
    setMessageType('')

    try {
      // Criar o link mailto com os dados do formulário
      const assunto = encodeURIComponent(formData.assunto)
      const corpo = encodeURIComponent(
        `Nome: ${formData.nome}\n` +
        `Email: ${formData.email}\n` +
        `Telefone: ${formData.telefone || 'Não informado'}\n\n` +
        `Mensagem:\n${formData.mensagem}`
      )
      
      // Criar links mailto para todos os destinatários
      const mailtoLinks = recipientEmails.map(email => 
        `mailto:${email}?subject=${assunto}&body=${corpo}`
      )
      
      // Abrir o primeiro cliente de email (usuário pode escolher outros depois)
      window.open(mailtoLinks[0], '_blank')
      
      // Se houver múltiplos destinatários, mostrar informação adicional
      if (recipientEmails.length > 1) {
        setMessage(`Cliente de email aberto com sucesso! Sua mensagem será enviada para ${recipientEmails.length} destinatários: ${recipientEmails.join(', ')}`)
      } else {
        setMessage('Cliente de email aberto com sucesso! Sua mensagem será enviada quando você clicar em enviar.')
      }
      setMessageType('success')
      
      // Limpar formulário após sucesso
      setFormData({
        nome: '',
        email: user?.email || '',
        telefone: '',
        assunto: '',
        mensagem: ''
      })
      
    } catch (error: any) {
      console.error('Erro ao abrir cliente de email:', error)
      setMessage('Erro ao abrir cliente de email. Tente novamente.')
      setMessageType('error')
    } finally {
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
            Envie sua mensagem diretamente para nossa equipe. Seu cliente de email será aberto automaticamente.
            {recipientEmails.length > 1 && (
              <span className="block mt-2 text-sm text-blue-600 dark:text-blue-400">
                📧 Sua mensagem será enviada para {recipientEmails.length} destinatários configurados pelos administradores.
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
                  Processando...
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
