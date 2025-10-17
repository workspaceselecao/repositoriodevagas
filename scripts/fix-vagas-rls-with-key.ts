// Script para corrigir políticas RLS usando a chave de acesso fornecida
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co'
const supabaseServiceKey = 'sbp_baef59d729c3b75d73ed3c96eefb031be73b4bef'

async function fixVagasRLSWithAccessKey() {
  console.log('🔧 Corrigindo Políticas RLS com Chave de Acesso')
  console.log('=' .repeat(60))

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // 1. Verificar conectividade
    console.log('\n📡 1. Testando conectividade...')
    
    const { data: testData, error: testError } = await supabase
      .from('vagas')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.log(`❌ Erro de conectividade: ${testError.message}`)
      return
    } else {
      console.log('✅ Conectividade OK')
    }

    // 2. Verificar políticas atuais
    console.log('\n📋 2. Verificando políticas atuais...')
    
    try {
      const { data: policies, error: policiesError } = await supabase
        .rpc('exec_sql', { 
          sql: `SELECT policyname, cmd FROM pg_policies 
                WHERE schemaname = 'public' AND tablename = 'vagas'
                ORDER BY policyname;` 
        })
      
      if (policiesError) {
        console.log(`⚠️ Não foi possível verificar políticas: ${policiesError.message}`)
      } else {
        console.log(`✅ Políticas encontradas: ${policies?.length || 0}`)
        policies?.forEach(policy => {
          console.log(`   - ${policy.policyname}: ${policy.cmd}`)
        })
      }
    } catch (error) {
      console.log(`⚠️ Erro ao verificar políticas: ${error.message}`)
    }

    // 3. Aplicar correções SQL
    console.log('\n🔧 3. Aplicando correções SQL...')
    
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

    for (let i = 0; i < sqlCommands.length; i++) {
      const sql = sqlCommands[i]
      console.log(`\n🔄 Executando comando ${i + 1}/${sqlCommands.length}...`)
      
      try {
        const { error: execError } = await supabase
          .rpc('exec_sql', { sql })
        
        if (execError) {
          console.log(`⚠️ Erro: ${execError.message}`)
        } else {
          console.log('✅ Comando executado com sucesso')
        }
      } catch (error) {
        console.log(`❌ Erro geral: ${error.message}`)
      }
    }

    // 4. Testar políticas aplicadas
    console.log('\n🧪 4. Testando políticas aplicadas...')
    
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

    // 5. Resumo final
    console.log('\n📊 5. Resumo Final:')
    console.log(`   - SELECT: ${selectError ? '❌' : '✅'}`)
    console.log(`   - INSERT: ${insertError ? '✅ Protegido' : '⚠️ Não protegido'}`)
    console.log(`   - UPDATE: ${updateError ? '✅ Protegido' : '⚠️ Não protegido'}`)
    console.log(`   - DELETE: ${deleteError ? '✅ Protegido' : '⚠️ Não protegido'}`)

    if (!insertError || !updateError || !deleteError) {
      console.log('\n⚠️ ATENÇÃO: Algumas operações ainda não estão protegidas!')
      console.log('   Recomendação: Verificar políticas RLS no Supabase Dashboard.')
    } else {
      console.log('\n🎉 TODAS AS OPERAÇÕES ESTÃO PROTEGIDAS CORRETAMENTE!')
    }

    console.log('\n✅ Correção concluída!')

  } catch (error) {
    console.error('❌ Erro durante correção:', error)
  }
}

// Executar correção
fixVagasRLSWithAccessKey()
