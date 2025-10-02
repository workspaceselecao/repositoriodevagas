#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mywaoaofatgwbbtyqfpd.supabase.co'
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkMigration() {
  try {
    console.log('🔍 Verificando se a tabela reports existe...')
    
    // Tentar fazer uma consulta simples na tabela reports
    const { data, error } = await supabase
      .from('reports')
      .select('id')
      .limit(1)
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ Tabela reports não existe!')
        console.log('\n📋 INSTRUÇÕES PARA CRIAR A TABELA:')
        console.log('1. Acesse o Supabase Dashboard: https://supabase.com/dashboard')
        console.log('2. Vá para o seu projeto')
        console.log('3. Clique em "SQL Editor" no menu lateral')
        console.log('4. Copie e cole o conteúdo do arquivo: scripts/migrate-reports-manual.sql')
        console.log('5. Execute o script')
        console.log('\n📄 Ou execute manualmente no SQL Editor:')
        console.log('CREATE TABLE reports (')
        console.log('  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,')
        console.log('  vaga_id UUID NOT NULL REFERENCES vagas(id) ON DELETE CASCADE,')
        console.log('  reported_by UUID NOT NULL REFERENCES users(id),')
        console.log('  assigned_to UUID NOT NULL REFERENCES users(id),')
        console.log('  field_name VARCHAR(100) NOT NULL,')
        console.log('  current_value TEXT,')
        console.log('  suggested_changes TEXT NOT NULL,')
        console.log('  status VARCHAR(20) CHECK (status IN (\'pending\', \'in_progress\', \'completed\', \'rejected\')) DEFAULT \'pending\',')
        console.log('  admin_notes TEXT,')
        console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),')
        console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),')
        console.log('  completed_at TIMESTAMP WITH TIME ZONE')
        console.log(');')
        console.log('\n🔒 Depois execute: ALTER TABLE reports ENABLE ROW LEVEL SECURITY;')
        console.log('\n✅ Após criar a tabela, execute novamente: npm run migrate-reports')
        process.exit(1)
      } else {
        console.error('❌ Erro ao verificar tabela:', error.message)
        process.exit(1)
      }
    } else {
      console.log('✅ Tabela reports existe!')
      console.log('🎉 Sistema de reports está pronto para uso!')
      console.log('\n📋 Próximos passos:')
      console.log('1. Execute: npm run dev')
      console.log('2. Acesse a aplicação')
      console.log('3. Vá para a página Comparativo')
      console.log('4. Teste o botão REPORTAR (apenas para usuários RH)')
      console.log('5. Verifique as notificações em tempo real (apenas para ADMINS)')
    }
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error)
    process.exit(1)
  }
}

// Executar verificação
checkMigration()
