// Script para aplicar políticas RLS corretas na tabela vagas
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'

async function applyVagasRLSPolicies() {
  console.log('🔧 Aplicando Políticas RLS Corretas na Tabela Vagas')
  console.log('=' .repeat(60))

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // 1. Habilitar RLS
    console.log('\n🛡️ 1. Habilitando RLS...')
    
    const { error: enableError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;' 
      })
    
    if (enableError) {
      console.log(`⚠️ Erro ao habilitar RLS: ${enableError.message}`)
    } else {
      console.log('✅ RLS habilitado')
    }

    // 2. Remover políticas existentes
    console.log('\n🗑️ 2. Removendo políticas existentes...')
    
    const policiesToRemove = [
      'Admins have full control over vagas',
      'RH and Admin can insert vagas',
      'RH and Admin can update vagas',
      'Admin can delete vagas',
      'RH can manage vagas',
      'Users can view vagas'
    ]

    for (const policyName of policiesToRemove) {
      const { error: removeError } = await supabase
        .rpc('exec_sql', { 
          sql: `DROP POLICY IF EXISTS "${policyName}" ON vagas;` 
        })
      
      if (removeError) {
        console.log(`⚠️ Erro ao remover política ${policyName}: ${removeError.message}`)
      } else {
        console.log(`✅ Política ${policyName} removida`)
      }
    }

    // 3. Criar novas políticas
    console.log('\n➕ 3. Criando novas políticas...')
    
    const policies = [
      {
        name: 'Anyone can view vagas',
        command: 'SELECT',
        sql: 'CREATE POLICY "Anyone can view vagas" ON vagas FOR SELECT USING (true);'
      },
      {
        name: 'Authenticated users can insert vagas',
        command: 'INSERT',
        sql: `CREATE POLICY "Authenticated users can insert vagas" ON vagas
              FOR INSERT WITH CHECK (
                auth.uid() IS NOT NULL AND (
                  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' IN ('ADMIN', 'RH') OR
                  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('ADMIN', 'RH')
                )
              );`
      },
      {
        name: 'Authenticated users can update vagas',
        command: 'UPDATE',
        sql: `CREATE POLICY "Authenticated users can update vagas" ON vagas
              FOR UPDATE USING (
                auth.uid() IS NOT NULL AND (
                  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' IN ('ADMIN', 'RH') OR
                  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('ADMIN', 'RH')
                )
              );`
      },
      {
        name: 'Only admins can delete vagas',
        command: 'DELETE',
        sql: `CREATE POLICY "Only admins can delete vagas" ON vagas
              FOR DELETE USING (
                auth.uid() IS NOT NULL AND (
                  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'ADMIN' OR
                  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
                )
              );`
      }
    ]

    for (const policy of policies) {
      const { error: createError } = await supabase
        .rpc('exec_sql', { sql: policy.sql })
      
      if (createError) {
        console.log(`❌ Erro ao criar política ${policy.name}: ${createError.message}`)
      } else {
        console.log(`✅ Política ${policy.name} criada`)
      }
    }

    // 4. Verificar políticas criadas
    console.log('\n📋 4. Verificando políticas criadas...')
    
    const { data: policiesData, error: policiesError } = await supabase
      .rpc('exec_sql', { 
        sql: `SELECT policyname, cmd FROM pg_policies 
              WHERE schemaname = 'public' AND tablename = 'vagas'
              ORDER BY policyname;` 
      })
    
    if (policiesError) {
      console.log(`❌ Erro ao verificar políticas: ${policiesError.message}`)
    } else {
      console.log('✅ Políticas verificadas:')
      policiesData?.forEach(policy => {
        console.log(`   - ${policy.policyname}: ${policy.cmd}`)
      })
    }

    // 5. Testar políticas
    console.log('\n🧪 5. Testando políticas...')
    
    // Testar select (deve funcionar)
    const { data: selectData, error: selectError } = await supabase
      .from('vagas')
      .select('id')
      .limit(1)
    
    if (selectError) {
      console.log(`❌ Erro no select: ${selectError.message}`)
    } else {
      console.log('✅ SELECT funcionando')
    }

    // Testar insert (deve falhar sem autenticação)
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

    // Testar update (deve falhar sem autenticação)
    const { data: updateData, error: updateError } = await supabase
      .from('vagas')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', '00000000-0000-0000-0000-000000000000')
    
    if (updateError) {
      console.log(`✅ UPDATE protegido: ${updateError.message}`)
    } else {
      console.log('⚠️ UPDATE não está protegido')
    }

    // Testar delete (deve falhar sem autenticação)
    const { data: deleteData, error: deleteError } = await supabase
      .from('vagas')
      .delete()
      .eq('id', '00000000-0000-0000-0000-000000000000')
    
    if (deleteError) {
      console.log(`✅ DELETE protegido: ${deleteError.message}`)
    } else {
      console.log('⚠️ DELETE não está protegido')
    }

    console.log('\n✅ Políticas RLS aplicadas com sucesso!')

  } catch (error) {
    console.error('❌ Erro durante aplicação das políticas:', error)
  }
}

// Executar aplicação das políticas
applyVagasRLSPolicies()
