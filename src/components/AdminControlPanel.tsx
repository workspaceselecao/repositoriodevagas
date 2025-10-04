import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Switch } from './ui/switch'
import { Button } from './ui/button'
import { CheckCircle, XCircle, AlertTriangle, Shield, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useAdminControl } from '../lib/admin-control'
import { SUPER_ADMIN_EMAIL } from '../lib/user-filter'

interface AdminControlPanelProps {}

export default function AdminControlPanel({}: AdminControlPanelProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warning' | 'info'>('info')
  const { user } = useAuth()
  const { state, isBlocked, updateControl, lastUpdated, updatedBy } = useAdminControl()

  // Verificar se é o admin autorizado
  const isAuthorizedAdmin = user?.email === SUPER_ADMIN_EMAIL && user?.role === 'ADMIN'

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

      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Atualizar controle administrativo
      updateControl(newState, user?.email || 'admin')
      
      if (newState) {
        setMessage('✅ Sistema BLOQUEADO - Dados do banco não serão carregados')
        setMessageType('success')
      } else {
        setMessage('🔓 Sistema LIBERADO - Dados do banco serão carregados normalmente')
        setMessageType('success')
      }
      
      // Limpar mensagem após 5 segundos
      setTimeout(() => {
        setMessage('')
      }, 5000)
      
    } catch (error) {
      console.error('Erro ao alterar estado:', error)
      setMessage('Erro ao alterar estado do sistema')
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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Painel de Controle Administrativo
          </h1>
          <p className="text-gray-600 mb-6">
            Controle o carregamento de dados do sistema
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
                      ? 'Dados do banco não estão sendo carregados' 
                      : 'Dados do banco estão sendo carregados normalmente'
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

        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Controle de Carregamento de Dados</CardTitle>
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
                      ? 'Sistema BLOQUEADO - Desative para liberar o carregamento de dados do banco'
                      : 'Sistema LIBERADO - Ative para bloquear o carregamento de dados do banco'
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

              {/* Current Value Display */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    VITE_BLOCK_DB_LOADING:
                  </span>
                  <code className={`px-2 py-1 rounded text-sm font-mono ${
                    isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {isBlocked.toString()}
                  </code>
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

              {/* Loading State */}
              {isLoading && (
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Processando...
                  </div>
                </div>
              )}

              {/* Message Display */}
              {message && (
                <Card className={messageType === 'error' ? 'border-red-200 bg-red-50' : 
                                messageType === 'success' ? 'border-green-200 bg-green-50' : 
                                messageType === 'warning' ? 'border-yellow-200 bg-yellow-50' : 
                                'border-blue-200 bg-blue-50'}>
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

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Instruções:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>BLOQUEADO:</strong> Impede o carregamento de dados do banco</li>
                  <li>• <strong>LIBERADO:</strong> Permite o carregamento normal de dados</li>
                  <li>• As mudanças são aplicadas imediatamente</li>
                  <li>• Use com cuidado em ambiente de produção</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Painel de Controle Administrativo - Repositório de Vagas</p>
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
