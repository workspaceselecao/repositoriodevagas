// Script simplificado para corrigir políticas RLS
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMDMyNCwiZXhwIjoyMDc0MTc2MzI0fQ.oUhs-CNusuqxKFIwjc1zv0Nh4TJ6opnmzt8_V1Lfq7U'

async function fixVagasRLSSimple() {
  console.log('🔧 Corrigindo Políticas RLS da Tabela Vagas (Método Simples)')
  console.log('=' .repeat(70))

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // 1. Testar operações atuais
    console.log('\n🧪 1. Testando operações atuais...')
    
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

    // 2. Verificar se há problemas específicos
    console.log('\n🔍 2. Verificando problemas específicos...')
    
    // Verificar se há dados na tabela
    const { data: countData, error: countError } = await supabase
      .from('vagas')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.log(`❌ Erro ao contar vagas: ${countError.message}`)
    } else {
      console.log(`✅ Total de vagas: ${countData?.length || 0}`)
    }

    // 3. Testar com diferentes filtros
    console.log('\n🔍 3. Testando diferentes filtros...')
    
    // Testar filtro por site
    const { data: siteData, error: siteError } = await supabase
      .from('vagas')
      .select('id, site')
      .eq('site', 'SÃO BENTO')
      .limit(3)
    
    if (siteError) {
      console.log(`❌ Erro no filtro por site: ${siteError.message}`)
    } else {
      console.log(`✅ Filtro por site funcionando: ${siteData?.length || 0} registros`)
    }

    // Testar filtro por cliente
    const { data: clientData, error: clientError } = await supabase
      .from('vagas')
      .select('id, cliente')
      .eq('cliente', 'VIVO')
      .limit(3)
    
    if (clientError) {
      console.log(`❌ Erro no filtro por cliente: ${clientError.message}`)
    } else {
      console.log(`✅ Filtro por cliente funcionando: ${clientData?.length || 0} registros`)
    }

    // 4. Verificar configuração atual
    console.log('\n⚙️ 4. Verificando configuração atual...')
    console.log(`📡 URL: ${supabaseUrl}`)
    console.log(`🔑 Service Key: ${supabaseServiceKey.substring(0, 20)}...`)

    // 5. Resumo do status
    console.log('\n📊 5. Resumo do Status:')
    console.log(`   - SELECT: ${selectError ? '❌' : '✅'}`)
    console.log(`   - INSERT: ${insertError ? '✅ Protegido' : '⚠️ Não protegido'}`)
    console.log(`   - UPDATE: ${updateError ? '✅ Protegido' : '⚠️ Não protegido'}`)
    console.log(`   - DELETE: ${deleteError ? '✅ Protegido' : '⚠️ Não protegido'}`)

    if (!updateError || !deleteError) {
      console.log('\n⚠️ ATENÇÃO: UPDATE e/ou DELETE não estão protegidos por RLS!')
      console.log('   Isso pode ser um problema de segurança.')
      console.log('   Recomendação: Verificar políticas RLS no Supabase Dashboard.')
    } else {
      console.log('\n✅ Todas as operações estão protegidas corretamente!')
    }

    console.log('\n✅ Diagnóstico concluído!')

  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error)
  }
}

// Executar diagnóstico
fixVagasRLSSimple()
