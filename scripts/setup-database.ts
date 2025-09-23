import { createClient } from '@supabase/supabase-js'

// Script para verificar e configurar o banco de dados
async function setupDatabase() {
  console.log('🗄️ Configurando Banco de Dados')
  console.log('=' .repeat(40))
  
  const supabaseUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co'
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
  
  try {
    console.log('🔍 Verificando tabelas existentes...')
    
    // Verificar se a tabela users existe
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (usersError) {
      if (usersError.code === 'PGRST116') {
        console.log('❌ Tabela users não existe')
        console.log('')
        console.log('📋 Para criar as tabelas:')
        console.log('1. Acesse: https://supabase.com/dashboard/project/mywaoaofatgwbbtyqfpd')
        console.log('2. Vá para SQL Editor')
        console.log('3. Cole o conteúdo de database/schema.sql')
        console.log('4. Execute o script')
        console.log('5. Execute: npm run create-user')
        return
      } else {
        console.log('⚠️ Erro ao verificar tabela users:', usersError.message)
      }
    } else {
      console.log('✅ Tabela users existe')
    }
    
    // Verificar se a tabela vagas existe
    const { data: vagasData, error: vagasError } = await supabase
      .from('vagas')
      .select('count')
      .limit(1)
    
    if (vagasError) {
      if (vagasError.code === 'PGRST116') {
        console.log('❌ Tabela vagas não existe')
      } else {
        console.log('⚠️ Erro ao verificar tabela vagas:', vagasError.message)
      }
    } else {
      console.log('✅ Tabela vagas existe')
    }
    
    // Verificar se a tabela backup_logs existe
    const { data: backupData, error: backupError } = await supabase
      .from('backup_logs')
      .select('count')
      .limit(1)
    
    if (backupError) {
      if (backupError.code === 'PGRST116') {
        console.log('❌ Tabela backup_logs não existe')
      } else {
        console.log('⚠️ Erro ao verificar tabela backup_logs:', backupError.message)
      }
    } else {
      console.log('✅ Tabela backup_logs existe')
    }
    
    console.log('')
    console.log('📋 Status do banco de dados:')
    console.log('- Se todas as tabelas existem: ✅ Banco configurado')
    console.log('- Se alguma tabela não existe: ❌ Execute o schema SQL')
    
  } catch (error) {
    console.log('❌ Erro ao verificar banco:', error.message)
  }
}

setupDatabase()
