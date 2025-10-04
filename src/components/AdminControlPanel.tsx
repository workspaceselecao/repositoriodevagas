import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Switch } from './ui/switch'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { CheckCircle, XCircle, AlertTriangle, Shield, ArrowLeft, Crown, Users, Database, Settings, Activity, Zap, Trash2, Eye, Lock, Unlock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useAdminControl } from '../lib/admin-control'
import { useAdminBypass } from '../lib/admin-bypass'
import { SUPER_ADMIN_EMAIL } from '../lib/user-filter'

interface AdminControlPanelProps {}

export default function AdminControlPanel({}: AdminControlPanelProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warning' | 'info'>('info')
  const [activeTab, setActiveTab] = useState('control')
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false)
  const [emergencyAction, setEmergencyAction] = useState('')
  const [emergencyReason, setEmergencyReason] = useState('')
  
  const { user } = useAuth()
  const { state, isBlocked, updateControl, lastUpdated, updatedBy, loading } = useAdminControl()
  const { 
    powers, 
    auditLogs, 
    loading: sovereigntyLoading, 
    activatePower, 
    deactivatePower, 
    hasPower,
    bypass,
    logAdminAction
  } = useAdminBypass()

  // Verificar se é o admin autorizado
  const isAuthorizedAdmin = user?.role === 'ADMIN'

  // Carregar estado atual do bloqueio
  useEffect(() => {
    loadCurrentState()
  }, [])

  const loadCurrentState = async () => {
    try {
      setIsLoading(true)
      
      setMessage(`Estado atual: ${isBlocked ? 'BLOQUEADO' : 'LIBERADO'}`)
      setMessageType('info')
      
    } catch (error) {
      console.error('Erro ao carregar estado:', error)
      setMessage('Erro ao carregar estado atual')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleChange = async (newState: boolean) => {
    try {
      setIsLoading(true)
      setMessage('')

      // Atualizar controle administrativo
      await updateControl(newState, user?.email || 'admin', `Sistema ${newState ? 'bloqueado' : 'liberado'} pelo SuperUsuário`)
      
      if (newState) {
        setMessage('✅ Sistema BLOQUEADO - Operações de escrita não são permitidas')
        setMessageType('success')
      } else {
        setMessage('🔓 Sistema LIBERADO - Operações de escrita são permitidas normalmente')
        setMessageType('success')
      }
      
      // Limpar mensagem após 5 segundos
      setTimeout(() => {
        setMessage('')
      }, 5000)
      
    } catch (error) {
      console.error('Erro ao alterar estado:', error)
      setMessage(`Erro ao alterar estado do sistema: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  const getToggleText = () => {
    return isBlocked ? 'DESEJA LIBERAR?' : 'DESEJA BLOQUEAR?'
  }

  const getToggleIcon = () => {
    return isBlocked ? <XCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />
  }

  const getStatusColor = () => {
    return isBlocked ? 'text-red-600' : 'text-green-600'
  }

  const getStatusBg = () => {
    return isBlocked ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
  }

  // Funções para operações soberanas
  const handleActivatePower = async (actionType: string, targetResource?: string) => {
    try {
      setIsLoading(true)
      await activatePower(actionType, targetResource, {}, undefined)
      setMessage(`✅ Poder '${actionType}' ativado com sucesso`)
      setMessageType('success')
    } catch (error) {
      setMessage(`❌ Erro ao ativar poder: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeactivatePower = async (powerId: string) => {
    try {
      setIsLoading(true)
      await deactivatePower(powerId)
      setMessage('✅ Poder desativado com sucesso')
      setMessageType('success')
    } catch (error) {
      setMessage(`❌ Erro ao desativar poder: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmergencyAction = async () => {
    if (!emergencyAction || !emergencyReason) {
      setMessage('❌ Ação e motivo são obrigatórios')
      setMessageType('error')
      return
    }

    try {
      setIsLoading(true)
      const result = await bypass.emergencyBypass(
        async () => {
          // Executar ação de emergência baseada no tipo
          switch (emergencyAction) {
            case 'force_refresh':
              window.location.reload()
              break
            case 'clear_cache':
              localStorage.clear()
              sessionStorage.clear()
              break
            case 'reset_system':
              await bypass.updateSystemControlWithBypass({ is_blocked: false })
              break
            default:
              throw new Error('Ação de emergência não reconhecida')
          }
        },
        'emergency_action',
        emergencyReason
      )

      if (result.success) {
        setMessage('✅ Ação de emergência executada com sucesso')
        setMessageType('success')
        setShowEmergencyDialog(false)
        setEmergencyAction('')
        setEmergencyReason('')
      } else {
        setMessage(`❌ Erro na ação de emergência: ${result.error}`)
        setMessageType('error')
      }
    } catch (error) {
      setMessage(`❌ Erro na ação de emergência: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar autorização
  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Você não tem permissão para acessar este painel de controle.
            </p>
            <p className="text-sm text-gray-500">
              Apenas administradores autorizados podem gerenciar o sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Crown className="h-16 w-16 mx-auto text-purple-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Painel de Controle Soberano
          </h1>
          <p className="text-gray-600 mb-6">
            Controle total e soberano sobre toda a aplicação
          </p>
          
          {/* Botão Voltar */}
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-4 rounded-lg border ${getStatusBg()}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-semibold ${getStatusColor()}`}>
                    {isBlocked ? 'SISTEMA BLOQUEADO' : 'SISTEMA LIBERADO'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {isBlocked 
                      ? 'Operações de escrita estão bloqueadas' 
                      : 'Operações de escrita estão liberadas'
                    }
                  </p>
                </div>
                <div className={`p-2 rounded-full ${isBlocked ? 'bg-red-100' : 'bg-green-100'}`}>
                  {getToggleIcon()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="control">Controle</TabsTrigger>
            <TabsTrigger value="powers">Poderes</TabsTrigger>
            <TabsTrigger value="bypass">Bypass</TabsTrigger>
            <TabsTrigger value="audit">Auditoria</TabsTrigger>
            <TabsTrigger value="emergency">Emergência</TabsTrigger>
          </TabsList>

          {/* Tab: Controle */}
          <TabsContent value="control">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Controle de Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Toggle Control */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {getToggleText()}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {isBlocked 
                          ? 'Sistema BLOQUEADO - Desative para liberar operações de escrita'
                          : 'Sistema LIBERADO - Ative para bloquear operações de escrita'
                        }
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`text-sm font-medium ${!isBlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                        DESEJA BLOQUEAR?
                      </span>
                      
                      <Switch
                        checked={isBlocked}
                        onCheckedChange={handleToggleChange}
                        disabled={isLoading}
                        className="data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-green-600"
                      />
                      
                      <span className={`text-sm font-medium ${isBlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                        DESEJA LIBERAR?
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => handleToggleChange(true)}
                      variant={isBlocked ? "default" : "outline"}
                      disabled={isLoading || isBlocked}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Bloquear Sistema
                    </Button>
                    
                    <Button
                      onClick={() => handleToggleChange(false)}
                      variant={!isBlocked ? "default" : "outline"}
                      disabled={isLoading || !isBlocked}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Liberar Sistema
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Poderes */}
          <TabsContent value="powers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Poderes Administrativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Poderes Disponíveis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { type: 'bypass_rls', name: 'Bypass de RLS', description: 'Contornar políticas de segurança', resource: 'all' },
                      { type: 'user_management', name: 'Gerenciamento de Usuários', description: 'Controlar usuários com privilégios elevados', resource: 'users' },
                      { type: 'data_management', name: 'Gerenciamento de Dados', description: 'Controlar dados com privilégios elevados', resource: 'vagas' },
                      { type: 'system_control', name: 'Controle do Sistema', description: 'Controlar configurações do sistema', resource: 'system' },
                      { type: 'audit_access', name: 'Acesso à Auditoria', description: 'Acessar logs de auditoria completos', resource: 'audit' },
                      { type: 'emergency_override', name: 'Sobrescrita de Emergência', description: 'Sobrescrita de emergência em situações críticas', resource: 'all' }
                    ].map((power) => (
                      <Card key={power.type} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{power.name}</h4>
                            <p className="text-sm text-gray-600">{power.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {hasPower(power.type, power.resource === 'all' ? undefined : power.resource) ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <Lock className="h-3 w-3 mr-1" />
                                Ativo
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleActivatePower(power.type, power.resource === 'all' ? undefined : power.resource)}
                                disabled={isLoading}
                              >
                                <Unlock className="h-3 w-3 mr-1" />
                                Ativar
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Poderes Ativos */}
                  {powers.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Poderes Ativos</h4>
                      <div className="space-y-2">
                        {powers.map((power) => (
                          <div key={power.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div>
                              <span className="font-medium">{power.name}</span>
                              <p className="text-sm text-gray-600">{power.description}</p>
                              {power.expires_at && (
                                <p className="text-xs text-gray-500">
                                  Expira: {new Date(power.expires_at).toLocaleString('pt-BR')}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeactivatePower(power.id)}
                              disabled={isLoading}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Desativar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Bypass */}
          <TabsContent value="bypass">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Operações de Bypass
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Usuários</h4>
                    <p className="text-sm text-gray-600 mb-3">Operações com bypass de RLS para usuários</p>
                    <div className="space-y-2">
                      <Button size="sm" variant="outline" disabled={!hasPower('user_management')}>
                        <Users className="h-3 w-3 mr-1" />
                        Criar Usuário
                      </Button>
                      <Button size="sm" variant="outline" disabled={!hasPower('user_management')}>
                        <Users className="h-3 w-3 mr-1" />
                        Editar Usuário
                      </Button>
                      <Button size="sm" variant="outline" disabled={!hasPower('user_management')}>
                        <Trash2 className="h-3 w-3 mr-1" />
                        Excluir Usuário
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Dados</h4>
                    <p className="text-sm text-gray-600 mb-3">Operações com bypass de RLS para dados</p>
                    <div className="space-y-2">
                      <Button size="sm" variant="outline" disabled={!hasPower('data_management')}>
                        <Database className="h-3 w-3 mr-1" />
                        Criar Vaga
                      </Button>
                      <Button size="sm" variant="outline" disabled={!hasPower('data_management')}>
                        <Database className="h-3 w-3 mr-1" />
                        Editar Vaga
                      </Button>
                      <Button size="sm" variant="outline" disabled={!hasPower('data_management')}>
                        <Trash2 className="h-3 w-3 mr-1" />
                        Excluir Vaga
                      </Button>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Auditoria */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Logs de Auditoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                {auditLogs.length > 0 ? (
                  <div className="space-y-3">
                    {auditLogs.slice(0, 20).map((log) => (
                      <div key={log.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{log.action}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        {log.resource_type && (
                          <p className="text-sm text-gray-600">
                            Recurso: {log.resource_type}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Nenhum log de auditoria encontrado</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Emergência */}
          <TabsContent value="emergency">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Ações de Emergência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-2">⚠️ ATENÇÃO</h4>
                    <p className="text-sm text-red-800">
                      As ações de emergência são irreversíveis e devem ser usadas apenas em situações críticas.
                      Todas as ações são registradas nos logs de auditoria.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      disabled={!hasPower('emergency_override') || isLoading}
                      onClick={() => {
                        setEmergencyAction('force_refresh')
                        setShowEmergencyDialog(true)
                      }}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Forçar Atualização
                    </Button>

                    <Button
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      disabled={!hasPower('emergency_override') || isLoading}
                      onClick={() => {
                        setEmergencyAction('clear_cache')
                        setShowEmergencyDialog(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpar Cache
                    </Button>

                    <Button
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      disabled={!hasPower('emergency_override') || isLoading}
                      onClick={() => {
                        setEmergencyAction('reset_system')
                        setShowEmergencyDialog(true)
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Reset Sistema
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Loading State */}
        {(isLoading || loading || sovereigntyLoading) && (
          <div className="text-center mt-6">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              {loading ? 'Carregando estado...' : sovereigntyLoading ? 'Carregando poderes...' : 'Processando...'}
            </div>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <Card className={`mt-6 ${messageType === 'error' ? 'border-red-200 bg-red-50' : 
                              messageType === 'success' ? 'border-green-200 bg-green-50' : 
                              messageType === 'warning' ? 'border-yellow-200 bg-yellow-50' : 
                              'border-blue-200 bg-blue-50'}`}>
            <CardContent className="pt-4">
              <p className={messageType === 'error' ? 'text-red-800' : 
                            messageType === 'success' ? 'text-green-800' : 
                            messageType === 'warning' ? 'text-yellow-800' : 
                            'text-blue-800'}>
                {message}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Emergency Dialog */}
        <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Ação de Emergência
              </DialogTitle>
              <DialogDescription>
                Esta ação será executada imediatamente e registrada nos logs de auditoria.
                Descreva o motivo para esta ação de emergência.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Ação: {emergencyAction}</Label>
              </div>
              <div>
                <Label htmlFor="emergency-reason">Motivo (obrigatório)</Label>
                <Textarea
                  id="emergency-reason"
                  value={emergencyReason}
                  onChange={(e) => setEmergencyReason(e.target.value)}
                  placeholder="Descreva o motivo para esta ação de emergência..."
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEmergencyDialog(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEmergencyAction}
                disabled={isLoading || !emergencyReason}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? 'Executando...' : 'Executar Ação'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Painel de Controle Soberano - Repositório de Vagas</p>
          <p>Usuário: {user?.email} | Role: {user?.role}</p>
          {lastUpdated && (
            <p className="mt-2 text-xs">
              Última alteração: {new Date(lastUpdated).toLocaleString('pt-BR')} por {updatedBy}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
