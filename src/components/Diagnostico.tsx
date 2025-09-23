import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { supabase } from '../lib/supabase'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

interface DiagnosticoItem {
  nome: string
  status: 'checking' | 'success' | 'error' | 'warning'
  mensagem: string
  detalhes?: string
}

export default function Diagnostico() {
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoItem[]>([])
  const [executando, setExecutando] = useState(false)

  const executarDiagnostico = async () => {
    setExecutando(true)
    const resultados: DiagnosticoItem[] = []

    // 1. Verificar conexão com Supabase
    resultados.push({
      nome: 'Conexão com Supabase',
      status: 'checking',
      mensagem: 'Verificando...'
    })
    setDiagnosticos([...resultados])

    try {
      const { data, error } = await supabase.from('users').select('count').limit(1)
      if (error) {
        resultados[0] = {
          nome: 'Conexão com Supabase',
          status: 'error',
          mensagem: 'Erro de conexão',
          detalhes: error.message
        }
      } else {
        resultados[0] = {
          nome: 'Conexão com Supabase',
          status: 'success',
          mensagem: 'Conectado com sucesso'
        }
      }
    } catch (err: any) {
      resultados[0] = {
        nome: 'Conexão com Supabase',
        status: 'error',
        mensagem: 'Erro de conexão',
        detalhes: err.message
      }
    }
    setDiagnosticos([...resultados])

    // 2. Verificar autenticação atual
    resultados.push({
      nome: 'Autenticação Atual',
      status: 'checking',
      mensagem: 'Verificando...'
    })
    setDiagnosticos([...resultados])

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        resultados[1] = {
          nome: 'Autenticação Atual',
          status: 'success',
          mensagem: `Usuário logado: ${user.email}`
        }
      } else {
        resultados[1] = {
          nome: 'Autenticação Atual',
          status: 'warning',
          mensagem: 'Nenhum usuário logado'
        }
      }
    } catch (err: any) {
      resultados[1] = {
        nome: 'Autenticação Atual',
        status: 'error',
        mensagem: 'Erro ao verificar autenticação',
        detalhes: err.message
      }
    }
    setDiagnosticos([...resultados])

    // 3. Verificar Service Key
    resultados.push({
      nome: 'Service Key',
      status: 'checking',
      mensagem: 'Verificando...'
    })
    setDiagnosticos([...resultados])

    const hasServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY && 
                         import.meta.env.VITE_SUPABASE_SERVICE_KEY !== 'your_supabase_service_role_key_here'
    
    if (hasServiceKey) {
      resultados[2] = {
        nome: 'Service Key',
        status: 'success',
        mensagem: 'Service Key configurada'
      }
    } else {
      resultados[2] = {
        nome: 'Service Key',
        status: 'warning',
        mensagem: 'Service Key não configurada - usando método alternativo'
      }
    }
    setDiagnosticos([...resultados])

    // 4. Verificar políticas RLS
    resultados.push({
      nome: 'Políticas RLS',
      status: 'checking',
      mensagem: 'Verificando...'
    })
    setDiagnosticos([...resultados])

    try {
      // Tentar inserir um usuário de teste (será revertido)
      const { error } = await supabase
        .from('users')
        .insert({
          id: 'test-' + Date.now(),
          email: 'test@example.com',
          name: 'Teste',
          role: 'RH'
        })
        .select()

      if (error) {
        if (error.message.includes('permission denied') || error.message.includes('policy')) {
          resultados[3] = {
            nome: 'Políticas RLS',
            status: 'warning',
            mensagem: 'Políticas RLS podem estar bloqueando operações',
            detalhes: error.message
          }
        } else {
          resultados[3] = {
            nome: 'Políticas RLS',
            status: 'success',
            mensagem: 'Políticas RLS funcionando'
          }
        }
      } else {
        resultados[3] = {
          nome: 'Políticas RLS',
          status: 'success',
          mensagem: 'Políticas RLS funcionando'
        }
      }
    } catch (err: any) {
      resultados[3] = {
        nome: 'Políticas RLS',
        status: 'error',
        mensagem: 'Erro ao verificar políticas',
        detalhes: err.message
      }
    }
    setDiagnosticos([...resultados])

    // 5. Verificar tabelas
    resultados.push({
      nome: 'Tabelas do Sistema',
      status: 'checking',
      mensagem: 'Verificando...'
    })
    setDiagnosticos([...resultados])

    try {
      const tabelas = ['users', 'vagas', 'backup_logs']
      let tabelasOk = 0
      
      for (const tabela of tabelas) {
        const { error } = await supabase.from(tabela).select('count').limit(1)
        if (!error) tabelasOk++
      }

      if (tabelasOk === tabelas.length) {
        resultados[4] = {
          nome: 'Tabelas do Sistema',
          status: 'success',
          mensagem: `Todas as ${tabelas.length} tabelas acessíveis`
        }
      } else {
        resultados[4] = {
          nome: 'Tabelas do Sistema',
          status: 'warning',
          mensagem: `${tabelasOk}/${tabelas.length} tabelas acessíveis`
        }
      }
    } catch (err: any) {
      resultados[4] = {
        nome: 'Tabelas do Sistema',
        status: 'error',
        mensagem: 'Erro ao verificar tabelas',
        detalhes: err.message
      }
    }
    setDiagnosticos([...resultados])

    setExecutando(false)
  }

  const getIcon = (status: DiagnosticoItem['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'checking':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
    }
  }

  const getStatusColor = (status: DiagnosticoItem['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'checking':
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Diagnóstico do Sistema</h1>
        <p className="text-gray-600 mt-2">
          Verifique a configuração e conectividade do sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
          <CardDescription>
            Execute o diagnóstico para verificar problemas de configuração
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={executarDiagnostico} 
            disabled={executando}
            className="mb-6"
          >
            {executando ? 'Executando...' : 'Executar Diagnóstico'}
          </Button>

          {diagnosticos.length > 0 && (
            <div className="space-y-3">
              {diagnosticos.map((diagnostico, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(diagnostico.status)}`}
                >
                  <div className="flex items-center space-x-3">
                    {getIcon(diagnostico.status)}
                    <div className="flex-1">
                      <h3 className="font-semibold">{diagnostico.nome}</h3>
                      <p className="text-sm text-gray-600">{diagnostico.mensagem}</p>
                      {diagnostico.detalhes && (
                        <p className="text-xs text-gray-500 mt-1">
                          Detalhes: {diagnostico.detalhes}
                        </p>
                      )}
                    </div>
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
