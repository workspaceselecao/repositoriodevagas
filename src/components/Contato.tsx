import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { MessageCircle, Users, Zap } from 'lucide-react'
import { getAllContactEmailConfigs } from '../lib/contactEmail'
import { ContactEmailConfig } from '../types/database'

export default function Contato() {
  const [teamsContacts, setTeamsContacts] = useState<ContactEmailConfig[]>([]) // Lista de admins com Teams
  const [selectedAdmin, setSelectedAdmin] = useState<string>('') // Admin selecionado no dropdown

  // Carregar contatos Teams
  useEffect(() => {
    const loadContactData = async () => {
      console.log('🔧 [Contato] Carregando contatos Teams...')
      try {
        const contactConfigs = await getAllContactEmailConfigs()
        
        // Filtrar admins ativos que têm email válido (para criar link Teams)
        const adminsWithTeams = contactConfigs
          .filter(config => config.ativo && config.email)
          .map(config => {
            // Se não houver teams_contact configurado, criar automaticamente baseado no email
            // Usar deep link do Teams Desktop que abre diretamente o chat específico
            if (!config.teams_contact && config.email) {
              const encodedEmail = encodeURIComponent(config.email.trim())
              return {
                ...config,
                teams_contact: `msteams://teams.microsoft.com/l/chat/0/0?users=${encodedEmail}&message=`
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

  const handleAdminSelect = (adminId: string) => {
    setSelectedAdmin(adminId)
  }

  const handleOpenTeamsChat = () => {
    const admin = teamsContacts.find(contact => contact.id === selectedAdmin)
    if (!admin) {
      console.error('❌ [Contato] Admin não encontrado')
      return
    }

    console.log('💬 [Contato] Abrindo chat do Teams com:', admin.nome || admin.email)

    // Verificar se há um teams_contact configurado
    if (admin.teams_contact) {
      // Se já existe uma URL configurada, tentar usar ela primeiro
      const existingUrl = admin.teams_contact.trim()
      
      // Verificar se é uma URL completa ou precisa ser construída
      if (existingUrl.startsWith('http://') || existingUrl.startsWith('https://')) {
        // URL completa - usar diretamente
        console.log('🌐 [Contato] Usando URL configurada:', existingUrl)
        window.open(existingUrl, '_blank', 'noopener,noreferrer')
        return
      } else if (existingUrl.startsWith('msteams://')) {
        // Deep link do Teams - usar diretamente
        console.log('📱 [Contato] Usando deep link configurado:', existingUrl)
        window.location.href = existingUrl
        return
      }
    }

    // Se não houver teams_contact configurado ou estiver em formato incorreto,
    // construir a URL correta baseada no email
    if (!admin.email) {
      console.error('❌ [Contato] Email não disponível para criar link do Teams')
      alert('Email não disponível para contato via Teams')
      return
    }

    try {
      const email = admin.email.trim()
      const encodedEmail = encodeURIComponent(email)
      
      // Formato correto para abrir chat específico no Teams
      // Prioridade 1: Deep link do Teams Desktop (mais confiável)
      const teamsDesktopUrl = `msteams://teams.microsoft.com/l/chat/0/0?users=${encodedEmail}&message=`
      
      // Formato alternativo: URL Web do Teams (fallback)
      const teamsWebUrl = `https://teams.microsoft.com/l/chat/0/0?users=${encodedEmail}&message=`
      
      console.log('🔗 [Contato] Tentando abrir Teams Desktop:', teamsDesktopUrl)
      
      // Tentar abrir primeiro o Teams Desktop
      const desktopLink = document.createElement('a')
      desktopLink.href = teamsDesktopUrl
      desktopLink.style.display = 'none'
      document.body.appendChild(desktopLink)
      desktopLink.click()
      document.body.removeChild(desktopLink)
      
      // Fallback: Se o Teams Desktop não abrir em 1 segundo, tentar Web
      setTimeout(() => {
        console.log('🌐 [Contato] Tentando abrir Teams Web como fallback:', teamsWebUrl)
        window.open(teamsWebUrl, '_blank', 'noopener,noreferrer')
      }, 1000)
      
    } catch (error) {
      console.error('❌ [Contato] Erro ao abrir Teams:', error)
      
      // Fallback final: copiar email para área de transferência
      navigator.clipboard.writeText(admin.email).then(() => {
        alert(`Não foi possível abrir o Teams automaticamente.\n\nEmail copiado para área de transferência: ${admin.email}\n\nCole no Teams para iniciar o chat.`)
      }).catch(() => {
        alert(`Não foi possível abrir o Teams automaticamente.\n\nEmail do contato: ${admin.email}\n\nCopie manualmente e cole no Teams para iniciar o chat.`)
      })
    }
  }

  const getSelectedAdmin = () => {
    return teamsContacts.find(contact => contact.id === selectedAdmin)
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      {/* Card principal para contato via Teams */}
      {teamsContacts.length > 0 ? (
        <Card className="border-2 border-blue-500 dark:border-blue-600 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Contato via Microsoft Teams
              </span>
            </CardTitle>
            <CardDescription className="text-base">
              Entre em contato diretamente com nossos administradores através do Microsoft Teams para uma resposta rápida e eficiente.
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
                <strong>Como funciona:</strong> O chat será aberto automaticamente no Microsoft Teams. 
                {getSelectedAdmin() && (
                  <span className="block mt-1">
                    Você será conectado diretamente com <strong>{getSelectedAdmin()?.nome || getSelectedAdmin()?.email}</strong>.
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Contato
            </CardTitle>
            <CardDescription>
              Não há administradores disponíveis para contato no momento. Entre em contato com a equipe de TI para mais informações.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
