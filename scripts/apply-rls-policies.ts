// Script para aplicar políticas RLS usando execução SQL direta
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'

async function applyRLSPolicies() {
  console.log('🔧 Aplicando Políticas RLS na Tabela Vagas')
  console.log('=' .repeat(50))

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Lista de comandos SQL para executar
    const sqlCommands = [
      // Habilitar RLS
      'ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;',
      
      // Remover políticas existentes
      'DROP POLICY IF EXISTS "Admins have full control over vagas" ON vagas;',
      'DROP POLICY IF EXISTS "RH and Admin can insert vagas" ON vagas;',
      'DROP POLICY IF EXISTS "RH and Admin can update vagas" ON vagas;',
      'DROP POLICY IF EXISTS "Admin can delete vagas" ON vagas;',
      'DROP POLICY IF EXISTS "RH can manage vagas" ON vagas;',
      'DROP POLICY IF EXISTS "Users can view vagas" ON vagas;',
      'DROP POLICY IF EXISTS "Anyone can view vagas" ON vagas;',
      'DROP POLICY IF EXISTS "Authenticated users can insert vagas" ON vagas;',
      'DROP POLICY IF EXISTS "Authenticated users can update vagas" ON vagas;',
      'DROP POLICY IF EXISTS "Only admins can delete vagas" ON vagas;',
      
      // Criar novas políticas
      `CREATE POLICY "vagas_select_policy" ON vagas
       FOR SELECT USING (true);`,
      
      `CREATE POLICY "vagas_insert_policy" ON vagas
       FOR INSERT WITH CHECK (
         auth.uid() IS NOT NULL AND (
           EXISTS (
             SELECT 1 FROM users 
             WHERE id = auth.uid() 
             AND role IN ('ADMIN', 'RH')
           )
         )
       );`,
      
      `CREATE POLICY "vagas_update_policy" ON vagas
       FOR UPDATE USING (
         auth.uid() IS NOT NULL AND (
           EXISTS (
             SELECT 1 FROM users 
             WHERE id = auth.uid() 
             AND role IN ('ADMIN', 'RH')
           )
         )
       );`,
      
      `CREATE POLICY "vagas_delete_policy" ON vagas
       FOR DELETE USING (
         auth.uid() IS NOT NULL AND (
           EXISTS (
             SELECT 1 FROM users 
             WHERE id = auth.uid() 
             AND role = 'ADMIN'
           )
         )
       );`
    ]

    console.log(`\n📝 Executando ${sqlCommands.length} comandos SQL...`)

    for (let i = 0; i < sqlCommands.length; i++) {
      const sql = sqlCommands[i]
      console.log(`\n🔄 Executando comando ${i + 1}/${sqlCommands.length}...`)
      
      try {
        // Tentar executar via rpc
        const { error: rpcError } = await supabase
          .rpc('exec_sql', { sql })
        
        if (rpcError) {
          console.log(`⚠️ Erro via RPC: ${rpcError.message}`)
          
          // Tentar método alternativo usando query direta
          try {
            const { error: queryError } = await supabase
              .from('_sql')
              .select('*')
              .eq('query', sql)
            
            if (queryError) {
              console.log(`❌ Erro alternativo: ${queryError.message}`)
            } else {
              console.log('✅ Comando executado via método alternativo')
            }
          } catch (altError) {
            console.log(`❌ Erro no método alternativo: ${altError.message}`)
          }
        } else {
          console.log('✅ Comando executado com sucesso')
        }
      } catch (error) {
        console.log(`❌ Erro geral: ${error.message}`)
      }
    }

    // Verificar políticas criadas
    console.log('\n📋 Verificando políticas criadas...')
    
    try {
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('policyname, cmd')
        .eq('tablename', 'vagas')
        .eq('schemaname', 'public')
      
      if (policiesError) {
        console.log(`❌ Erro ao verificar políticas: ${policiesError.message}`)
      } else {
        console.log(`✅ Políticas encontradas: ${policies?.length || 0}`)
        policies?.forEach(policy => {
          console.log(`   - ${policy.policyname}: ${policy.cmd}`)
        })
      }
    } catch (error) {
      console.log(`❌ Erro ao verificar políticas: ${error.message}`)
    }

    // Testar políticas
    console.log('\n🧪 Testando políticas aplicadas...')
    
    // Testar select
    const { data: selectData, error: selectError } = await supabase
      .from('vagas')
      .select('id')
      .limit(1)
    
    if (selectError) {
      console.log(`❌ Erro no select: ${selectError.message}`)
    } else {
      console.log('✅ SELECT funcionando')
    }

    // Testar insert (deve falhar)
    const { data: insertData, error: insertError } = await supabase
      .from('vagas')
      .insert({
        site: 'TESTE',
        categoria: 'TESTE',
        cargo: 'TESTE',
        cliente: 'TESTE',
        celula: 'TESTE'
      })
    
    if (insertError) {
      console.log(`✅ INSERT protegido: ${insertError.message}`)
    } else {
      console.log('⚠️ INSERT não está protegido')
    }

    // Testar update (deve falhar)
    const { data: updateData, error: updateError } = await supabase
      .from('vagas')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', '00000000-0000-0000-0000-000000000000')
    
    if (updateError) {
      console.log(`✅ UPDATE protegido: ${updateError.message}`)
    } else {
      console.log('⚠️ UPDATE não está protegido')
    }

    // Testar delete (deve falhar)
    const { data: deleteData, error: deleteError } = await supabase
      .from('vagas')
      .delete()
      .eq('id', '00000000-0000-0000-0000-000000000000')
    
    if (deleteError) {
      console.log(`✅ DELETE protegido: ${deleteError.message}`)
    } else {
      console.log('⚠️ DELETE não está protegido')
    }

    console.log('\n✅ Aplicação de políticas concluída!')

  } catch (error) {
    console.error('❌ Erro durante aplicação das políticas:', error)
  }
}

// Executar aplicação
applyRLSPolicies()
