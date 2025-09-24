import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!')
  console.log('Verifique se o arquivo .env.local existe e contém:')
  console.log('VITE_SUPABASE_URL=...')
  console.log('VITE_SUPABASE_ANON_KEY=...')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabaseStatus() {
  console.log('🔍 Verificando estrutura da tabela vagas...')
  console.log('URL:', supabaseUrl)
  console.log('Key:', supabaseKey.substring(0, 20) + '...')
  
  try {
    // Verificar colunas da tabela
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'vagas')
      .eq('table_schema', 'public')
      .order('ordinal_position')

    if (columnError) {
      console.error('❌ Erro ao verificar colunas:', columnError)
      return
    }

    console.log('\n📋 Colunas da tabela vagas:')
    columns?.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`)
    })

    // Verificar se existe coluna produto
    const hasProduto = columns?.some(col => col.column_name === 'produto') || false
    const hasCelula = columns?.some(col => col.column_name === 'celula') || false

    console.log(`\n🔍 Status das colunas:`)
    console.log(`  - Coluna 'produto' existe: ${hasProduto}`)
    console.log(`  - Coluna 'celula' existe: ${hasCelula}`)

    if (hasProduto && !hasCelula) {
      console.log('\n⚠️  MIGRAÇÃO NECESSÁRIA: Tabela ainda usa coluna "produto"')
      console.log('📝 Execute o script: scripts/migrate-produto-to-celula.sql')
    } else if (hasCelula && !hasProduto) {
      console.log('\n✅ Schema correto: Usando coluna "celula"')
    } else if (hasCelula && hasProduto) {
      console.log('\n⚠️  AMBIGUIDADE: Ambas as colunas existem')
      console.log('📝 Execute o script: scripts/check-database-columns.sql')
    } else {
      console.log('\n❌ ERRO: Nenhuma das colunas existe')
      console.log('📝 Execute o script: database/schema.sql')
    }

    // Testar inserção se schema estiver correto
    if (hasCelula && !hasProduto) {
      console.log('\n🧪 Testando inserção de dados...')
      
      const testData = {
        site: 'TESTE',
        categoria: 'TESTE',
        cargo: 'TESTE',
        cliente: 'TESTE',
        celula: 'TESTE',
        titulo: 'Teste de inserção'
      }

      const { data, error } = await supabase
        .from('vagas')
        .insert(testData)
        .select()
        .single()

      if (error) {
        console.error('❌ Erro na inserção de teste:', error)
      } else {
        console.log('✅ Inserção de teste bem-sucedida!')
        
        // Limpar dados de teste
        await supabase
          .from('vagas')
          .delete()
          .eq('id', data.id)
        
        console.log('🧹 Dados de teste removidos')
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

checkDatabaseStatus()
