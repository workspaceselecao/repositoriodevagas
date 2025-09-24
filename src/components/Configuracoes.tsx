import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { BackupOptions, BackupLog } from '../types/database'
import { createManualBackup, getBackupLogs } from '../lib/backup'
import { useAuth } from '../contexts/AuthContext'
import { Download, Database, FileText } from 'lucide-react'

export default function Configuracoes() {
  const [backupOptions, setBackupOptions] = useState<BackupOptions>({
    type: 'manual',
    data: {
      vagas: true,
      users: false,
      backup_logs: false
    },
    format: 'excel'
  })
  const [backupLogs, setBackupLogs] = useState<BackupLog[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    loadBackupLogs()
  }, [])

  const loadBackupLogs = async () => {
    try {
      const logs = await getBackupLogs()
      setBackupLogs(logs)
    } catch (error) {
      console.error('Erro ao carregar logs de backup:', error)
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


  const handleBackupDataChange = (field: 'vagas' | 'users' | 'backup_logs', checked: boolean) => {
    setBackupOptions(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: checked
      }
    }))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-2">
          Gerencie backups do sistema e configurações gerais
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

      <div className="grid grid-cols-1 gap-8">
        {/* Backup do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Backup do Sistema
            </CardTitle>
            <CardDescription>
              Faça backup dos dados do sistema em diferentes formatos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Dados para Backup</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="vagas"
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
                    checked={backupOptions.data?.backup_logs || false}
                    onChange={(e) => handleBackupDataChange('backup_logs', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="logs" className="text-sm">Logs de Backup</Label>
                </div>
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

            <Button onClick={handleBackup} disabled={loading} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              {loading ? 'Criando Backup...' : 'Criar Backup'}
            </Button>
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
                      <Button size="sm" variant="outline">
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
    </div>
  )
}
