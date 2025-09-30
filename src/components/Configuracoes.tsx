import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Switch } from './ui/switch'
import { Textarea } from './ui/textarea'
import { BackupOptions, BackupLog, Noticia, NoticiaFormData, ContactEmailConfig, ContactEmailFormData, EmailJSConfig, EmailJSFormData } from '../types/database'
import { createManualBackup, getBackupLogs } from '../lib/backup'
import * as XLSX from 'xlsx'
import { getNoticias, createNoticia, updateNoticia, deleteNoticia, toggleNoticiaStatus } from '../lib/noticias'
import { getAllContactEmailConfigs, createContactEmailConfig, updateContactEmailConfig, deleteContactEmailConfig, toggleContactEmailConfigStatus } from '../lib/contactEmail'
import { getAllEmailJSConfigs, createEmailJSConfig, updateEmailJSConfig, deleteEmailJSConfig, toggleEmailJSConfigStatus } from '../lib/emailJSConfig'
import { testEmailConfig } from '../lib/emailService'
import { useAuth } from '../contexts/AuthContext'
import { ThemeSelector } from './ThemeSelector'
import CacheMetricsDisplay from './CacheMetricsDisplay'
import { Badge } from './ui/badge'
import { Download, Database, FileText, Megaphone, Plus, Edit, Trash2, Eye, EyeOff, AlertCircle, Info, Bell, Palette, Mail, Trash } from 'lucide-react'

export default function Configuracoes() {
  const [backupOptions, setBackupOptions] = useState<BackupOptions>({
    type: 'manual',
    data: {
      vagas: true,
      users: false,
      backup_logs: false,
      noticias: false
    },
    format: 'excel'
  })
  const [backupLogs, setBackupLogs] = useState<BackupLog[]>([])
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showCreateNoticiaDialog, setShowCreateNoticiaDialog] = useState(false)
  const [showEditNoticiaDialog, setShowEditNoticiaDialog] = useState(false)
  const [editingNoticia, setEditingNoticia] = useState<Noticia | null>(null)
  const [noticiaForm, setNoticiaForm] = useState<NoticiaFormData>({
    titulo: '',
    conteudo: '',
    tipo: 'info',
    ativa: true,
    prioridade: 'media'
  })
  const [contactEmails, setContactEmails] = useState<ContactEmailConfig[]>([])
  const [contactEmailLoading, setContactEmailLoading] = useState(false)
  const [showCreateEmailDialog, setShowCreateEmailDialog] = useState(false)
  const [showEditEmailDialog, setShowEditEmailDialog] = useState(false)
  const [editingEmail, setEditingEmail] = useState<ContactEmailConfig | null>(null)
  const [emailForm, setEmailForm] = useState<ContactEmailFormData>({
    email: '',
    nome: '',
    ativo: true
  })
  const [emailJSConfigs, setEmailJSConfigs] = useState<EmailJSConfig[]>([])
  const [emailJSLoading, setEmailJSLoading] = useState(false)
  const [showCreateEmailJSDialog, setShowCreateEmailJSDialog] = useState(false)
  const [showEditEmailJSDialog, setShowEditEmailJSDialog] = useState(false)
  const [editingEmailJS, setEditingEmailJS] = useState<EmailJSConfig | null>(null)
  const [emailJSForm, setEmailJSForm] = useState<EmailJSFormData>({
    service_id: '',
    template_id: '',
    public_key: '',
    ativo: true
  })
  const { user } = useAuth()

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      try {
        const [logs, noticiasData, contactEmailsData, emailJSData] = await Promise.all([
          getBackupLogs(),
          getNoticias(),
          getAllContactEmailConfigs(),
          getAllEmailJSConfigs()
        ])
        if (isMounted) {
          setBackupLogs(logs)
          setNoticias(noticiasData)
          setContactEmails(contactEmailsData)
          setEmailJSConfigs(emailJSData)
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      }
    }
    load()
    return () => { isMounted = false }
  }, [])

  const loadBackupLogs = async () => {
    try {
      const logs = await getBackupLogs()
      setBackupLogs(logs)
    } catch (error) {
      console.error('Erro ao carregar logs de backup:', error)
    }
  }

  const loadNoticias = async () => {
    try {
      const noticiasData = await getNoticias()
      setNoticias(noticiasData)
    } catch (error) {
      console.error('Erro ao carregar notícias:', error)
    }
  }

  const loadContactEmails = async () => {
    try {
      const emailsData = await getAllContactEmailConfigs()
      setContactEmails(emailsData)
    } catch (error) {
      console.error('Erro ao carregar emails de contato:', error)
    }
  }

  const loadEmailJSConfigs = async () => {
    try {
      const emailJSData = await getAllEmailJSConfigs()
      setEmailJSConfigs(emailJSData)
    } catch (error) {
      console.error('Erro ao carregar configurações do EmailJS:', error)
    }
  }

  const handleCreateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailForm.email.trim()) {
      setMessage('Por favor, insira um email válido')
      return
    }

    setContactEmailLoading(true)
    setMessage('')

    try {
      const result = await createContactEmailConfig(emailForm)
      if (result) {
        setMessage('Email de contato adicionado com sucesso!')
        setEmailForm({
          email: '',
          nome: '',
          ativo: true
        })
        setShowCreateEmailDialog(false)
        loadContactEmails()
      } else {
        setMessage('Erro ao adicionar email de contato')
      }
    } catch (error: any) {
      console.error('Erro ao criar email de contato:', error)
      setMessage(`Erro ao criar email de contato: ${error.message}`)
    } finally {
      setContactEmailLoading(false)
    }
  }

  const handleEditEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEmail) return

    setContactEmailLoading(true)
    setMessage('')

    try {
      const result = await updateContactEmailConfig(editingEmail.id, emailForm)
      if (result) {
        setMessage('Email de contato atualizado com sucesso!')
        setShowEditEmailDialog(false)
        setEditingEmail(null)
        loadContactEmails()
      } else {
        setMessage('Erro ao atualizar email de contato')
      }
    } catch (error: any) {
      console.error('Erro ao atualizar email de contato:', error)
      setMessage(`Erro ao atualizar email de contato: ${error.message}`)
    } finally {
      setContactEmailLoading(false)
    }
  }

  const handleDeleteEmail = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este email de contato?')) return

    setContactEmailLoading(true)
    setMessage('')

    try {
      const result = await deleteContactEmailConfig(id)
      if (result) {
        setMessage('Email de contato removido com sucesso!')
        loadContactEmails()
      } else {
        setMessage('Erro ao remover email de contato')
      }
    } catch (error: any) {
      console.error('Erro ao remover email de contato:', error)
      setMessage(`Erro ao remover email de contato: ${error.message}`)
    } finally {
      setContactEmailLoading(false)
    }
  }

  const handleToggleEmailStatus = async (id: string) => {
    setContactEmailLoading(true)
    setMessage('')

    try {
      const result = await toggleContactEmailConfigStatus(id)
      if (result) {
        setMessage(`Email ${result.ativo ? 'ativado' : 'desativado'} com sucesso!`)
        loadContactEmails()
      } else {
        setMessage('Erro ao alterar status do email')
      }
    } catch (error: any) {
      console.error('Erro ao alterar status do email:', error)
      setMessage(`Erro ao alterar status do email: ${error.message}`)
    } finally {
      setContactEmailLoading(false)
    }
  }

  const openEditEmailDialog = (email: ContactEmailConfig) => {
    setEditingEmail(email)
    setEmailForm({
      email: email.email,
      nome: email.nome || '',
      ativo: email.ativo
    })
    setShowEditEmailDialog(true)
  }

  // Funções para gerenciar EmailJS
  const handleCreateEmailJS = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailJSForm.service_id.trim() || !emailJSForm.template_id.trim() || !emailJSForm.public_key.trim()) {
      setMessage('Por favor, preencha todos os campos obrigatórios')
      return
    }

    setEmailJSLoading(true)
    setMessage('')

    try {
      const result = await createEmailJSConfig(emailJSForm)
      if (result) {
        setMessage('Configuração do EmailJS adicionada com sucesso!')
        setEmailJSForm({
          service_id: '',
          template_id: '',
          public_key: '',
          ativo: true
        })
        setShowCreateEmailJSDialog(false)
        loadEmailJSConfigs()
      } else {
        setMessage('Erro ao adicionar configuração do EmailJS')
      }
    } catch (error: any) {
      console.error('Erro ao criar configuração do EmailJS:', error)
      setMessage(`Erro ao criar configuração do EmailJS: ${error.message}`)
    } finally {
      setEmailJSLoading(false)
    }
  }

  const handleEditEmailJS = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEmailJS) return

    setEmailJSLoading(true)
    setMessage('')

    try {
      const result = await updateEmailJSConfig(editingEmailJS.id!, emailJSForm)
      if (result) {
        setMessage('Configuração do EmailJS atualizada com sucesso!')
        setShowEditEmailJSDialog(false)
        setEditingEmailJS(null)
        loadEmailJSConfigs()
      } else {
        setMessage('Erro ao atualizar configuração do EmailJS')
      }
    } catch (error: any) {
      console.error('Erro ao atualizar configuração do EmailJS:', error)
      setMessage(`Erro ao atualizar configuração do EmailJS: ${error.message}`)
    } finally {
      setEmailJSLoading(false)
    }
  }

  const handleDeleteEmailJS = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração do EmailJS?')) return

    setEmailJSLoading(true)
    setMessage('')

    try {
      const result = await deleteEmailJSConfig(id)
      if (result) {
        setMessage('Configuração do EmailJS removida com sucesso!')
        loadEmailJSConfigs()
      } else {
        setMessage('Erro ao remover configuração do EmailJS')
      }
    } catch (error: any) {
      console.error('Erro ao remover configuração do EmailJS:', error)
      setMessage(`Erro ao remover configuração do EmailJS: ${error.message}`)
    } finally {
      setEmailJSLoading(false)
    }
  }

  const handleToggleEmailJSStatus = async (id: string) => {
    setEmailJSLoading(true)
    setMessage('')

    try {
      const result = await toggleEmailJSConfigStatus(id)
      if (result) {
        setMessage(`Configuração do EmailJS ${result.ativo ? 'ativada' : 'desativada'} com sucesso!`)
        loadEmailJSConfigs()
      } else {
        setMessage('Erro ao alterar status da configuração do EmailJS')
      }
    } catch (error: any) {
      console.error('Erro ao alterar status da configuração do EmailJS:', error)
      setMessage(`Erro ao alterar status da configuração do EmailJS: ${error.message}`)
    } finally {
      setEmailJSLoading(false)
    }
  }

  const handleTestEmailJS = async (config: EmailJSConfig) => {
    setEmailJSLoading(true)
    setMessage('')

    try {
      const result = await testEmailConfig({
        serviceId: config.service_id,
        templateId: config.template_id,
        publicKey: config.public_key
      })
      
      setMessage(result.message)
    } catch (error: any) {
      console.error('Erro ao testar configuração do EmailJS:', error)
      setMessage(`Erro ao testar configuração: ${error.message}`)
    } finally {
      setEmailJSLoading(false)
    }
  }

  const openEditEmailJSDialog = (config: EmailJSConfig) => {
    setEditingEmailJS(config)
    setEmailJSForm({
      service_id: config.service_id,
      template_id: config.template_id,
      public_key: config.public_key,
      ativo: config.ativo
    })
    setShowEditEmailJSDialog(true)
  }

  const generateExcelFromBackup = async (backupData: any): Promise<Buffer> => {
    const workbook = XLSX.utils.book_new()
    
    // Adicionar cada tabela como uma planilha
    Object.keys(backupData).forEach(tableName => {
      if (backupData[tableName] && Array.isArray(backupData[tableName])) {
        const worksheet = XLSX.utils.json_to_sheet(backupData[tableName])
        XLSX.utils.book_append_sheet(workbook, worksheet, tableName)
      }
    })
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  }

  const generateCSVFromBackup = async (backupData: any): Promise<string> => {
    const csvData: string[] = []
    
    Object.keys(backupData).forEach(tableName => {
      if (backupData[tableName] && Array.isArray(backupData[tableName])) {
        csvData.push(`\n=== ${tableName.toUpperCase()} ===\n`)
        
        if (backupData[tableName].length > 0) {
          // Cabeçalhos
          const headers = Object.keys(backupData[tableName][0])
          csvData.push(headers.join(','))
          
          // Dados
          backupData[tableName].forEach((row: any) => {
            const values = headers.map(header => {
              const value = row[header]
              // Escapar vírgulas e aspas
              if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`
              }
              return value || ''
            })
            csvData.push(values.join(','))
          })
        }
      }
    })
    
    return csvData.join('\n')
  }

  const handleDownloadBackup = async (backupLog: BackupLog) => {
    try {
      if (!backupLog.backup_data) {
        setMessage('Dados do backup não disponíveis')
        return
      }

      // Gerar arquivo baseado no formato do backup
      let fileName = backupLog.file_path || `backup_${new Date().toISOString().split('T')[0]}.xlsx`
      let fileData: any = null

      if (fileName.endsWith('.xlsx')) {
        fileData = await generateExcelFromBackup(backupLog.backup_data)
      } else if (fileName.endsWith('.csv')) {
        fileData = await generateCSVFromBackup(backupLog.backup_data)
      } else {
        fileData = JSON.stringify(backupLog.backup_data, null, 2)
      }

      // Criar blob e fazer download
      const blob = new Blob([fileData], { 
        type: fileName.endsWith('.xlsx') ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
              fileName.endsWith('.csv') ? 'text/csv' : 'application/json'
      })
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setMessage('Download iniciado com sucesso!')
    } catch (error) {
      console.error('Erro ao fazer download do backup:', error)
      setMessage('Erro ao fazer download do backup')
    }
  }


  const handleBackup = async () => {
    if (!user) return

    setLoading(true)
    setMessage('')

    try {
      const backup = await createManualBackup(user.id, backupOptions)
      if (backup) {
        setMessage('Backup criado com sucesso!')
        loadBackupLogs()
      } else {
        setMessage('Erro ao criar backup')
      }
    } catch (error) {
      setMessage('Erro ao criar backup')
    } finally {
      setLoading(false)
    }
  }


  const handleBackupDataChange = (field: 'vagas' | 'users' | 'backup_logs' | 'noticias', checked: boolean) => {
    setBackupOptions(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: checked
      }
    }))
  }

  // Funções para notícias
  const handleCreateNoticia = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setMessage('')

    try {
      const newNoticia = await createNoticia(noticiaForm, user.id)
      if (newNoticia) {
        setMessage('Notícia criada com sucesso!')
        setNoticiaForm({
          titulo: '',
          conteudo: '',
          tipo: 'info',
          ativa: true,
          prioridade: 'media'
        })
        setShowCreateNoticiaDialog(false)
        loadNoticias()
      } else {
        setMessage('Erro ao criar notícia')
      }
    } catch (error: any) {
      console.error('Erro ao criar notícia:', error)
      setMessage(`Erro ao criar notícia: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEditNoticia = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingNoticia) return

    setLoading(true)
    setMessage('')

    try {
      const updatedNoticia = await updateNoticia(editingNoticia.id, noticiaForm)
      if (updatedNoticia) {
        setMessage('Notícia atualizada com sucesso!')
        setShowEditNoticiaDialog(false)
        setEditingNoticia(null)
        loadNoticias()
      } else {
        setMessage('Erro ao atualizar notícia')
      }
    } catch (error: any) {
      console.error('Erro ao atualizar notícia:', error)
      setMessage(`Erro ao atualizar notícia: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNoticia = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta notícia?')) return

    setLoading(true)
    setMessage('')

    try {
      const success = await deleteNoticia(id)
      if (success) {
        setMessage('Notícia excluída com sucesso!')
        loadNoticias()
      } else {
        setMessage('Erro ao excluir notícia')
      }
    } catch (error: any) {
      console.error('Erro ao excluir notícia:', error)
      setMessage(`Erro ao excluir notícia: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleNoticiaStatus = async (id: string, currentStatus: boolean) => {
    setLoading(true)
    setMessage('')

    try {
      const updatedNoticia = await toggleNoticiaStatus(id, !currentStatus)
      if (updatedNoticia) {
        setMessage(`Notícia ${!currentStatus ? 'ativada' : 'desativada'} com sucesso!`)
        loadNoticias()
      } else {
        setMessage('Erro ao alterar status da notícia')
      }
    } catch (error: any) {
      console.error('Erro ao alterar status da notícia:', error)
      setMessage(`Erro ao alterar status: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (noticia: Noticia) => {
    setEditingNoticia(noticia)
    setNoticiaForm({
      titulo: noticia.titulo,
      conteudo: noticia.conteudo,
      tipo: noticia.tipo,
      ativa: noticia.ativa,
      prioridade: noticia.prioridade
    })
    setShowEditNoticiaDialog(true)
  }

  const handleNoticiaInputChange = (field: keyof NoticiaFormData, value: any) => {
    setNoticiaForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent page-title">
          Configurações
        </h1>
        <p className="page-subtitle text-lg">
          Gerencie backups do sistema, notícias e configurações gerais
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.includes('sucesso') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <Tabs defaultValue="backup" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="backup">Configuração Geral</TabsTrigger>
          <TabsTrigger value="noticias">Gerenciar Notícias</TabsTrigger>
          <TabsTrigger value="personalizacao">Personalização Visual</TabsTrigger>
        </TabsList>

        <TabsContent value="backup" className="space-y-6">
          <div className="grid grid-cols-1 gap-8">
        {/* Configuração Geral */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Configuração Geral
            </CardTitle>
            <CardDescription>
              Gerencie configurações gerais do sistema e faça backup dos dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Configuração de Emails de Contato */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Emails de Contato
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure os emails que receberão as mensagens do formulário de contato
                  </p>
                </div>
                <Button
                  onClick={() => setShowCreateEmailDialog(true)}
                  size="sm"
                  className="flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 group"
                >
                  <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
                  Adicionar Email
                </Button>
              </div>
              
              {/* Lista de Emails */}
              <div className="space-y-3">
                {contactEmails.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum email de contato configurado</p>
                    <p className="text-sm">Clique em "Adicionar Email" para começar</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contactEmails.map((email) => (
                      <div
                        key={email.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          email.ativo 
                            ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                            : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{email.email}</span>
                            {email.nome && (
                              <span className="text-sm text-muted-foreground">
                                ({email.nome})
                              </span>
                            )}
                            <Badge variant={email.ativo ? "default" : "secondary"}>
                              {email.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleToggleEmailStatus(email.id)}
                            disabled={contactEmailLoading}
                            variant="outline"
                            size="sm"
                            className="transition-all duration-200 hover:scale-110 hover:shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            {email.ativo ? <EyeOff className="h-4 w-4 transition-transform duration-200" /> : <Eye className="h-4 w-4 transition-transform duration-200" />}
                          </Button>
                          <Button
                            onClick={() => openEditEmailDialog(email)}
                            disabled={contactEmailLoading}
                            variant="outline"
                            size="sm"
                            className="transition-all duration-200 hover:scale-110 hover:shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            <Edit className="h-4 w-4 transition-transform duration-200" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteEmail(email.id)}
                            disabled={contactEmailLoading}
                            variant="destructive"
                            size="sm"
                            className="transition-all duration-200 hover:scale-110 hover:shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            <Trash className="h-4 w-4 transition-transform duration-200" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Configuração do EmailJS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Configuração EmailJS
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure o EmailJS para envio direto de emails do formulário de contato
                  </p>
                </div>
                <Button
                  onClick={() => setShowCreateEmailJSDialog(true)}
                  size="sm"
                  className="flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 group"
                >
                  <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
                  Adicionar Configuração
                </Button>
              </div>
              
              {/* Lista de Configurações EmailJS */}
              <div className="space-y-3">
                {emailJSConfigs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma configuração do EmailJS cadastrada</p>
                    <p className="text-sm">Clique em "Adicionar Configuração" para começar</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {emailJSConfigs.map((config) => (
                      <div
                        key={config.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          config.ativo 
                            ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' 
                            : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Service: {config.service_id}</span>
                            <span className="text-sm text-muted-foreground">
                              Template: {config.template_id}
                            </span>
                            <Badge variant={config.ativo ? "default" : "secondary"}>
                              {config.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Public Key: {config.public_key.substring(0, 20)}...
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleTestEmailJS(config)}
                            disabled={emailJSLoading}
                            variant="outline"
                            size="sm"
                            className="transition-all duration-200 hover:scale-110 hover:shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            <AlertCircle className="h-4 w-4 transition-transform duration-200" />
                          </Button>
                          <Button
                            onClick={() => handleToggleEmailJSStatus(config.id!)}
                            disabled={emailJSLoading}
                            variant="outline"
                            size="sm"
                            className="transition-all duration-200 hover:scale-110 hover:shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            {config.ativo ? <EyeOff className="h-4 w-4 transition-transform duration-200" /> : <Eye className="h-4 w-4 transition-transform duration-200" />}
                          </Button>
                          <Button
                            onClick={() => openEditEmailJSDialog(config)}
                            disabled={emailJSLoading}
                            variant="outline"
                            size="sm"
                            className="transition-all duration-200 hover:scale-110 hover:shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            <Edit className="h-4 w-4 transition-transform duration-200" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteEmailJS(config.id!)}
                            disabled={emailJSLoading}
                            variant="destructive"
                            size="sm"
                            className="transition-all duration-200 hover:scale-110 hover:shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            <Trash className="h-4 w-4 transition-transform duration-200" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Backup do Sistema</h3>
              <div className="space-y-2">
                <Label>Dados para Backup</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="vagas"
                    name="vagas"
                    checked={backupOptions.data?.vagas || false}
                    onChange={(e) => handleBackupDataChange('vagas', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="vagas" className="text-sm">Vagas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="users"
                    name="users"
                    checked={backupOptions.data?.users || false}
                    onChange={(e) => handleBackupDataChange('users', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="users" className="text-sm">Usuários</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="logs"
                    name="logs"
                    checked={backupOptions.data?.backup_logs || false}
                    onChange={(e) => handleBackupDataChange('backup_logs', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="logs" className="text-sm">Logs de Backup</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="noticias"
                    name="noticias"
                    checked={backupOptions.data?.noticias || false}
                    onChange={(e) => handleBackupDataChange('noticias', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="noticias" className="text-sm">Notícias</Label>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Backup do Sistema</h3>
              <div className="space-y-2">
                <Label>Dados para Backup</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="vagas"
                    name="vagas"
                    checked={backupOptions.data?.vagas || false}
                    onChange={(e) => handleBackupDataChange('vagas', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="vagas" className="text-sm">Vagas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="users"
                    name="users"
                    checked={backupOptions.data?.users || false}
                    onChange={(e) => handleBackupDataChange('users', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="users" className="text-sm">Usuários</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="logs"
                    name="logs"
                    checked={backupOptions.data?.backup_logs || false}
                    onChange={(e) => handleBackupDataChange('backup_logs', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="logs" className="text-sm">Logs de Backup</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="noticias"
                    name="noticias"
                    checked={backupOptions.data?.noticias || false}
                    onChange={(e) => handleBackupDataChange('noticias', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="noticias" className="text-sm">Notícias</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Formato do Backup</Label>
                <Select
                  value={backupOptions.format}
                  onValueChange={(value: 'json' | 'excel' | 'csv') =>
                    setBackupOptions(prev => ({ ...prev, format: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleBackup} 
                disabled={loading} 
                className="w-full transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Download className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:rotate-12" />
                {loading ? 'Criando Backup...' : 'Criar Backup'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Backups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Histórico de Backups
          </CardTitle>
          <CardDescription>
            Últimos backups realizados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backupLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum backup realizado ainda
            </div>
          ) : (
            <div className="space-y-3">
              {backupLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      log.status === 'success' ? 'bg-green-500' :
                      log.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <div className="font-medium">
                        Backup {log.backup_type === 'manual' ? 'Manual' : 'Automático'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.status === 'success' ? 'bg-green-100 text-green-800' :
                      log.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {log.status === 'success' ? 'Sucesso' :
                       log.status === 'failed' ? 'Falhou' : 'Pendente'}
                    </span>
                    {log.file_path && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadBackup(log)}
                        title="Baixar backup"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>

        <TabsContent value="noticias" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Gerenciar Notícias</h2>
              <p className="text-gray-600 text-sm">Crie e gerencie notícias, avisos e anúncios do sistema</p>
              {noticias.filter(n => n.ativa).length >= 9 && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                    <div>
                      <p className="text-amber-800 font-medium text-sm">
                        ⚠️ Mural de Notícias Completo!
                      </p>
                      <p className="text-amber-700 text-xs">
                        Você tem {noticias.filter(n => n.ativa).length} notícias ativas. Para adicionar uma nova, 
                        faça backup das notícias atuais e desative ou remova uma notícia existente.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Dialog open={showCreateNoticiaDialog} onOpenChange={setShowCreateNoticiaDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Notícia
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Nova Notícia</DialogTitle>
                  <DialogDescription>
                    Preencha os dados para criar uma nova notícia ou aviso
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateNoticia}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título</Label>
                      <Input
                        id="titulo"
                        value={noticiaForm.titulo}
                        onChange={(e) => handleNoticiaInputChange('titulo', e.target.value)}
                        placeholder="Digite o título da notícia"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="conteudo">Conteúdo</Label>
                      <Textarea
                        id="conteudo"
                        value={noticiaForm.conteudo}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleNoticiaInputChange('conteudo', e.target.value)}
                        placeholder="Digite o conteúdo da notícia (suporte a emojis)"
                        rows={6}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo</Label>
                        <Select
                          value={noticiaForm.tipo}
                          onValueChange={(value: 'info' | 'alerta' | 'anuncio') => 
                            handleNoticiaInputChange('tipo', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="info">ℹ️ Informação</SelectItem>
                            <SelectItem value="alerta">⚠️ Alerta</SelectItem>
                            <SelectItem value="anuncio">📢 Anúncio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prioridade">Prioridade</Label>
                        <Select
                          value={noticiaForm.prioridade}
                          onValueChange={(value: 'baixa' | 'media' | 'alta') => 
                            handleNoticiaInputChange('prioridade', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="baixa">🟢 Baixa</SelectItem>
                            <SelectItem value="media">🟡 Média</SelectItem>
                            <SelectItem value="alta">🔴 Alta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="ativa"
                        checked={noticiaForm.ativa}
                        onCheckedChange={(checked) => handleNoticiaInputChange('ativa', checked)}
                      />
                      <Label htmlFor="ativa">Notícia ativa</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCreateNoticiaDialog(false)}
                      className="transition-all duration-200 hover:scale-105 hover:shadow-sm active:scale-95"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {loading ? 'Criando...' : 'Criar Notícia'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Dialog de Edição */}
          <Dialog open={showEditNoticiaDialog} onOpenChange={setShowEditNoticiaDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Editar Notícia</DialogTitle>
                <DialogDescription>
                  Atualize as informações da notícia
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditNoticia}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-titulo">Título</Label>
                    <Input
                      id="edit-titulo"
                      value={noticiaForm.titulo}
                      onChange={(e) => handleNoticiaInputChange('titulo', e.target.value)}
                      placeholder="Digite o título da notícia"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-conteudo">Conteúdo</Label>
                    <Textarea
                      id="edit-conteudo"
                      value={noticiaForm.conteudo}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleNoticiaInputChange('conteudo', e.target.value)}
                      placeholder="Digite o conteúdo da notícia (suporte a emojis)"
                      rows={6}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-tipo">Tipo</Label>
                      <Select
                        value={noticiaForm.tipo}
                        onValueChange={(value: 'info' | 'alerta' | 'anuncio') => 
                          handleNoticiaInputChange('tipo', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">ℹ️ Informação</SelectItem>
                          <SelectItem value="alerta">⚠️ Alerta</SelectItem>
                          <SelectItem value="anuncio">📢 Anúncio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-prioridade">Prioridade</Label>
                      <Select
                        value={noticiaForm.prioridade}
                        onValueChange={(value: 'baixa' | 'media' | 'alta') => 
                          handleNoticiaInputChange('prioridade', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">🟢 Baixa</SelectItem>
                          <SelectItem value="media">🟡 Média</SelectItem>
                          <SelectItem value="alta">🔴 Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-ativa"
                      checked={noticiaForm.ativa}
                      onCheckedChange={(checked) => handleNoticiaInputChange('ativa', checked)}
                    />
                    <Label htmlFor="edit-ativa">Notícia ativa</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowEditNoticiaDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>


          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Megaphone className="h-5 w-5 mr-2" />
                Lista de Notícias
              </CardTitle>
              <CardDescription>
                {noticias.length} notícia{noticias.length !== 1 ? 's' : ''} cadastrada{noticias.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {noticias.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Megaphone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Nenhuma notícia cadastrada</p>
                  <p className="text-sm">Clique em "Nova Notícia" para criar a primeira</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {noticias.map((noticia) => (
                    <div key={noticia.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          noticia.tipo === 'alerta' ? 'bg-red-100 text-red-800' :
                          noticia.tipo === 'anuncio' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {noticia.tipo === 'alerta' ? <AlertCircle className="h-4 w-4" /> :
                           noticia.tipo === 'anuncio' ? <Bell className="h-4 w-4" /> :
                           <Info className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="font-medium">{noticia.titulo}</div>
                          <div className="text-sm text-gray-600 line-clamp-2">{noticia.conteudo}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              noticia.prioridade === 'alta' ? 'bg-red-100 text-red-800' :
                              noticia.prioridade === 'media' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {noticia.prioridade}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              noticia.ativa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {noticia.ativa ? 'Ativa' : 'Inativa'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleNoticiaStatus(noticia.id, noticia.ativa)}
                        >
                          {noticia.ativa ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(noticia)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteNoticia(noticia.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personalizacao" className="space-y-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Personalização Visual
              </h2>
              <p className="text-muted-foreground text-sm">
                Personalize a aparência da aplicação com diferentes temas e cores
              </p>
            </div>
            
            <ThemeSelector />
            
            {/* Métricas do Cache - apenas para administradores */}
            {user?.role === 'ADMIN' && (
              <CacheMetricsDisplay className="mt-6" />
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogos - Fora da estrutura de abas para evitar problemas de renderização */}
      {/* Dialog para Criar Email de Contato */}
      <Dialog open={showCreateEmailDialog} onOpenChange={setShowCreateEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Email de Contato</DialogTitle>
            <DialogDescription>
              Adicione um novo email que receberá mensagens do formulário de contato
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateEmail}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-email-contact">Email *</Label>
                <Input
                  id="create-email-contact"
                  type="email"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="exemplo@empresa.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-nome-contact">Nome (opcional)</Label>
                <Input
                  id="create-nome-contact"
                  type="text"
                  value={emailForm.nome || ''}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Nome do destinatário"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="create-ativo-contact"
                  checked={emailForm.ativo || true}
                  onCheckedChange={(checked) => setEmailForm(prev => ({ ...prev, ativo: checked }))}
                />
                <Label htmlFor="create-ativo-contact">Email ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateEmailDialog(false)}
                className="transition-all duration-200 hover:scale-105 hover:shadow-sm active:scale-95"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={contactEmailLoading}
                className="transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {contactEmailLoading ? 'Adicionando...' : 'Adicionar Email'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Editar Email de Contato */}
      <Dialog open={showEditEmailDialog} onOpenChange={setShowEditEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Email de Contato</DialogTitle>
            <DialogDescription>
              Edite as informações do email de contato
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditEmail}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email-contact">Email *</Label>
                <Input
                  id="edit-email-contact"
                  type="email"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="exemplo@empresa.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nome-contact">Nome (opcional)</Label>
                <Input
                  id="edit-nome-contact"
                  type="text"
                  value={emailForm.nome || ''}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Nome do destinatário"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-ativo-contact"
                  checked={emailForm.ativo || false}
                  onCheckedChange={(checked) => setEmailForm(prev => ({ ...prev, ativo: checked }))}
                />
                <Label htmlFor="edit-ativo-contact">Email ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowEditEmailDialog(false)}
                className="transition-all duration-200 hover:scale-105 hover:shadow-sm active:scale-95"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={contactEmailLoading}
                className="transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {contactEmailLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Criar Configuração EmailJS */}
      <Dialog open={showCreateEmailJSDialog} onOpenChange={setShowCreateEmailJSDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Configuração EmailJS</DialogTitle>
            <DialogDescription>
              Configure o EmailJS para envio direto de emails
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateEmailJS}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-service-id-emailjs">Service ID *</Label>
                <Input
                  id="create-service-id-emailjs"
                  type="text"
                  value={emailJSForm.service_id}
                  onChange={(e) => setEmailJSForm(prev => ({ ...prev, service_id: e.target.value }))}
                  placeholder="service_xxxxxxx"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-template-id-emailjs">Template ID *</Label>
                <Input
                  id="create-template-id-emailjs"
                  type="text"
                  value={emailJSForm.template_id}
                  onChange={(e) => setEmailJSForm(prev => ({ ...prev, template_id: e.target.value }))}
                  placeholder="template_xxxxxxx"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-public-key-emailjs">Public Key *</Label>
                <Input
                  id="create-public-key-emailjs"
                  type="text"
                  value={emailJSForm.public_key}
                  onChange={(e) => setEmailJSForm(prev => ({ ...prev, public_key: e.target.value }))}
                  placeholder="xxxxxxxxxxxxxxxxxxxx"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="create-ativo-emailjs-config"
                  checked={emailJSForm.ativo || true}
                  onCheckedChange={(checked) => setEmailJSForm(prev => ({ ...prev, ativo: checked }))}
                />
                <Label htmlFor="create-ativo-emailjs-config">Configuração ativa</Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateEmailJSDialog(false)}
                className="transition-all duration-200 hover:scale-105 hover:shadow-sm active:scale-95"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={emailJSLoading}
                className="transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {emailJSLoading ? 'Adicionando...' : 'Adicionar Configuração'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Editar Configuração EmailJS */}
      <Dialog open={showEditEmailJSDialog} onOpenChange={setShowEditEmailJSDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Configuração EmailJS</DialogTitle>
            <DialogDescription>
              Edite as informações da configuração do EmailJS
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditEmailJS}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-service-id-emailjs">Service ID *</Label>
                <Input
                  id="edit-service-id-emailjs"
                  type="text"
                  value={emailJSForm.service_id}
                  onChange={(e) => setEmailJSForm(prev => ({ ...prev, service_id: e.target.value }))}
                  placeholder="service_xxxxxxx"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-template-id-emailjs">Template ID *</Label>
                <Input
                  id="edit-template-id-emailjs"
                  type="text"
                  value={emailJSForm.template_id}
                  onChange={(e) => setEmailJSForm(prev => ({ ...prev, template_id: e.target.value }))}
                  placeholder="template_xxxxxxx"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-public-key-emailjs">Public Key *</Label>
                <Input
                  id="edit-public-key-emailjs"
                  type="text"
                  value={emailJSForm.public_key}
                  onChange={(e) => setEmailJSForm(prev => ({ ...prev, public_key: e.target.value }))}
                  placeholder="xxxxxxxxxxxxxxxxxxxx"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-ativo-emailjs-config"
                  checked={emailJSForm.ativo || false}
                  onCheckedChange={(checked) => setEmailJSForm(prev => ({ ...prev, ativo: checked }))}
                />
                <Label htmlFor="edit-ativo-emailjs-config">Configuração ativa</Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowEditEmailJSDialog(false)}
                className="transition-all duration-200 hover:scale-105 hover:shadow-sm active:scale-95"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={emailJSLoading}
                className="transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {emailJSLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
