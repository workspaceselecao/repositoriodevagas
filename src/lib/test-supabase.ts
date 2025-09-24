// Função para testar conectividade com Supabase
import { supabase } from './supabase'

export interface TestResult {
  success: boolean
  message: string
  details?: any
}

export async function testSupabaseConnection(): Promise<TestResult> {
  try {
    console.log('🔍 Testando conexão com Supabase...')
    
    // Teste 1: Verificar se o cliente Supabase está configurado
    if (!supabase) {
      return {
        success: false,
        message: 'Cliente Supabase não está configurado'
      }
    }

    // Teste 2: Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      return {
        success: false,
        message: `Erro de autenticação: ${authError.message}`,
        details: authError
      }
    }

    if (!user) {
      return {
        success: false,
        message: 'Usuário não está autenticado'
      }
    }

    console.log('✅ Usuário autenticado:', user.email)

    // Teste 3: Verificar se a tabela vagas existe e é acessível
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'vagas')

    if (tableError) {
      return {
        success: false,
        message: `Erro ao verificar tabela: ${tableError.message}`,
        details: tableError
      }
    }

    if (!tables || tables.length === 0) {
      return {
        success: false,
        message: 'Tabela "vagas" não encontrada'
      }
    }

    console.log('✅ Tabela vagas encontrada')

    // Teste 4: Verificar estrutura da tabela
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'vagas')
      .eq('table_schema', 'public')
      .order('ordinal_position')

    if (columnError) {
      return {
        success: false,
        message: `Erro ao verificar colunas: ${columnError.message}`,
        details: columnError
      }
    }

    console.log('✅ Colunas da tabela vagas:', columns)

    // Teste 5: Verificar permissões (tentar uma consulta simples)
    const { data: testData, error: testError } = await supabase
      .from('vagas')
      .select('id')
      .limit(1)

    if (testError) {
      return {
        success: false,
        message: `Erro de permissão: ${testError.message}`,
        details: testError
      }
    }

    console.log('✅ Permissões de leitura OK')

    // Teste 6: Verificar se as colunas obrigatórias existem
    const requiredColumns = ['site', 'categoria', 'cargo', 'cliente', 'celula']
    const existingColumns = columns?.map(col => col.column_name) || []
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col))

    if (missingColumns.length > 0) {
      return {
        success: false,
        message: `Colunas obrigatórias não encontradas: ${missingColumns.join(', ')}`,
        details: { existingColumns, missingColumns }
      }
    }

    // Verificar se existe coluna produto (problema conhecido)
    const hasProdutoColumn = existingColumns.includes('produto')
    const hasCelulaColumn = existingColumns.includes('celula')

    if (hasProdutoColumn && !hasCelulaColumn) {
      return {
        success: false,
        message: '❌ MIGRAÇÃO NECESSÁRIA: Tabela ainda usa coluna "produto". Execute o script de migração no Supabase SQL Editor.',
        details: { 
          hasProdutoColumn, 
          hasCelulaColumn,
          action: 'Execute: scripts/migrate-produto-to-celula.sql no Supabase'
        }
      }
    }

    if (hasProdutoColumn && hasCelulaColumn) {
      return {
        success: false,
        message: '⚠️ AMBIGUIDADE: Ambas as colunas "produto" e "celula" existem. Execute o script de limpeza.',
        details: { 
          hasProdutoColumn, 
          hasCelulaColumn,
          action: 'Execute: scripts/check-database-columns.sql no Supabase'
        }
      }
    }

    return {
      success: true,
      message: 'Conexão com Supabase OK - Tudo funcionando!',
      details: {
        user: user.email,
        columns: existingColumns,
        hasProdutoColumn,
        hasCelulaColumn
      }
    }

  } catch (error: any) {
    console.error('❌ Erro no teste de conexão:', error)
    return {
      success: false,
      message: `Erro inesperado: ${error.message}`,
      details: error
    }
  }
}

// Função para testar inserção de dados
export async function testInsertVaga(testData: any): Promise<TestResult> {
  try {
    console.log('🧪 Testando inserção de dados...')
    
    const { data, error } = await supabase
      .from('vagas')
      .insert(testData)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        message: `Erro na inserção: ${error.message}`,
        details: error
      }
    }

    // Limpar dados de teste
    await supabase
      .from('vagas')
      .delete()
      .eq('id', data.id)

    return {
      success: true,
      message: 'Teste de inserção bem-sucedido!',
      details: data
    }

  } catch (error: any) {
    return {
      success: false,
      message: `Erro no teste de inserção: ${error.message}`,
      details: error
    }
  }
}
