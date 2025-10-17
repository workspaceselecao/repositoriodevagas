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

  const handleAdminSelect = (adminId: string) => {
    setSelectedAdmin(adminId)
  }

  const handleOpenTeamsChat = () => {
    const admin = teamsContacts.find(contact => contact.id === selectedAdmin)
    if (admin?.teams_contact) {
      console.log('💬 [Contato] Abrindo chat do Teams com:', admin.nome || admin.email)
      
      // Tentar abrir o Teams de diferentes formas para garantir compatibilidade
      try {
        // Primeiro, tentar abrir diretamente
        const teamsUrl = admin.teams_contact
        window.open(teamsUrl, '_blank', 'noopener,noreferrer')
        
        // Fallback: tentar com protocolo teams://
        setTimeout(() => {
          const teamsProtocolUrl = `teams://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(admin.email)}`
          window.location.href = teamsProtocolUrl
        }, 1000)
        
      } catch (error) {
        console.error('Erro ao abrir Teams:', error)
        // Fallback final: copiar email para área de transferência
        navigator.clipboard.writeText(admin.email).then(() => {
          alert(`Email copiado para área de transferência: ${admin.email}\nCole no Teams para iniciar o chat.`)
        })
      }
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
