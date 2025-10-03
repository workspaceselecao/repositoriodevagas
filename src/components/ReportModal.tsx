import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Vaga, User, ReportFormData } from '../types/database'
import { createReport, getAllAdmins } from '../lib/reports'
import { useAuth } from '../contexts/AuthContext'
import { AlertCircle, Send, X } from 'lucide-react'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  vaga: Vaga | null
}

// Campos disponíveis para reporte
const REPORT_FIELDS = [
  { key: 'site', label: 'Site' },
  { key: 'categoria', label: 'Categoria' },
  { key: 'cargo', label: 'Cargo' },
  { key: 'cliente', label: 'Cliente' },
  { key: 'titulo', label: 'Título' },
  { key: 'descricao_vaga', label: 'Descrição da vaga' },
  { key: 'responsabilidades_atribuicoes', label: 'Responsabilidades e atribuições' },
  { key: 'requisitos_qualificacoes', label: 'Requisitos e qualificações' },
  { key: 'salario', label: 'Salário' },
  { key: 'horario_trabalho', label: 'Horário de Trabalho' },
  { key: 'jornada_trabalho', label: 'Jornada de Trabalho' },
  { key: 'beneficios', label: 'Benefícios' },
  { key: 'local_trabalho', label: 'Local de Trabalho' },
  { key: 'etapas_processo', label: 'Etapas do processo' }
]

export default function ReportModal({ isOpen, onClose, vaga }: ReportModalProps) {
  const { user } = useAuth()
  const [admins, setAdmins] = useState<User[]>([])
  const [selectedAdmin, setSelectedAdmin] = useState<string>('')
  const [selectedField, setSelectedField] = useState<string>('')
  const [suggestedChanges, setSuggestedChanges] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [loadingAdmins, setLoadingAdmins] = useState(false)
  const [message, setMessage] = useState('')

  // Carregar admins quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadAdmins()
    }
  }, [isOpen])

  const loadAdmins = async () => {
    setLoadingAdmins(true)
    try {
      console.log('👥 Carregando lista de admins...')
      const adminsData = await getAllAdmins()
      console.log('✅ Admins carregados:', adminsData)
      setAdmins(adminsData)
    } catch (error) {
      console.error('❌ Erro ao carregar admins:', error)
      setMessage('Erro ao carregar lista de administradores')
    } finally {
      setLoadingAdmins(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !vaga || !selectedAdmin || !selectedField || !suggestedChanges.trim()) {
      console.log('❌ Validação falhou:', { 
        hasUser: !!user, 
        hasVaga: !!vaga, 
        hasAdmin: !!selectedAdmin, 
        hasField: !!selectedField, 
        hasChanges: !!suggestedChanges.trim() 
      })
      setMessage('Por favor, preencha todos os campos obrigatórios')
      return
    }
    
    console.log('✅ Validação passou, usuário:', user)

    setLoading(true)
    setMessage('')

    // Timeout de segurança para evitar loop infinito
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout de segurança ativado')
      setLoading(false)
      setMessage('Timeout: O envio está demorando muito. Tente novamente.')
    }, 30000) // 30 segundos

    try {
      console.log('🚀 Iniciando envio do report...')
      
      const reportData: ReportFormData = {
        vaga_id: vaga.id,
        assigned_to: selectedAdmin,
        field_name: selectedField,
        suggested_changes: suggestedChanges.trim()
      }

      console.log('📋 Dados do report:', reportData)
      console.log('👤 Usuário atual:', user)

      const report = await createReport(reportData)
      
      clearTimeout(timeoutId) // Limpar timeout se sucesso
      
      if (report) {
        console.log('✅ Report criado com sucesso!')
        setMessage('Report enviado com sucesso! O administrador será notificado.')
        setTimeout(() => {
          handleClose()
        }, 2000)
      } else {
        console.log('❌ Report retornou null')
        setMessage('Erro ao enviar report - resposta vazia')
      }
    } catch (error: any) {
      clearTimeout(timeoutId) // Limpar timeout se erro
      console.error('❌ Erro ao criar report:', error)
      let errorMessage = 'Erro ao enviar report'
      
      if (error?.message) {
        errorMessage = `Erro ao enviar report: ${error.message}`
      } else if (error?.code) {
        errorMessage = `Erro ao enviar report (código: ${error.code})`
      }
      
      setMessage(errorMessage)
    } finally {
      console.log('🏁 Finalizando envio do report...')
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedAdmin('')
    setSelectedField('')
    setSuggestedChanges('')
    setMessage('')
    onClose()
  }

  const getCurrentFieldValue = () => {
    if (!vaga || !selectedField) return ''
    return (vaga as any)[selectedField] || 'Não informado'
  }

  const getFieldLabel = () => {
    const field = REPORT_FIELDS.find(f => f.key === selectedField)
    return field ? field.label : selectedField
  }

  if (!vaga) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Reportar Problema na Oportunidade
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações da Oportunidade */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Oportunidade Selecionada</CardTitle>
              <CardDescription>
                {vaga.titulo || vaga.cargo} - {vaga.cliente}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Seleção do Admin */}
          <div className="space-y-2">
            <Label htmlFor="admin">Administrador Responsável *</Label>
            <Select 
              value={selectedAdmin} 
              onValueChange={setSelectedAdmin}
              disabled={loadingAdmins}
            >
              <SelectTrigger aria-label="Selecionar administrador responsável">
                <SelectValue placeholder={loadingAdmins ? "Carregando..." : "Selecione um administrador"} />
              </SelectTrigger>
              <SelectContent>
                {admins.map(admin => (
                  <SelectItem key={admin.id} value={admin.id}>
                    {admin.name} ({admin.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seleção do Campo */}
          <div className="space-y-2">
            <Label htmlFor="field">Campo a ser Reportado *</Label>
            <Select 
              value={selectedField} 
              onValueChange={setSelectedField}
            >
              <SelectTrigger aria-label="Selecionar campo a ser reportado">
                <SelectValue placeholder="Selecione o campo que deseja reportar" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_FIELDS.map(field => (
                  <SelectItem key={field.key} value={field.key}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Valor Atual do Campo */}
          {selectedField && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Valor Atual: {getFieldLabel()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">
                    {getCurrentFieldValue()}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sugestões de Alteração */}
          <div className="space-y-2">
            <Label htmlFor="changes">Descreva as Alterações Necessárias *</Label>
            <p id="changes-description" className="text-sm text-gray-600">
              Descreva detalhadamente quais informações devem ser alteradas e como devem ficar após a correção.
            </p>
            <Textarea
              id="changes"
              value={suggestedChanges}
              onChange={(e) => setSuggestedChanges(e.target.value)}
              placeholder="Descreva detalhadamente quais informações devem ser alteradas e como..."
              rows={4}
              className="resize-none"
              aria-label="Descrever alterações necessárias"
              aria-describedby="changes-description"
            />
          </div>

          {/* Mensagem de Status */}
          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.includes('sucesso') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedAdmin || !selectedField || !suggestedChanges.trim()}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Reportar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
