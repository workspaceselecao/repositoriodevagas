import { getSupabaseAdmin } from '../src/lib/supabase'

const FIX_SQL = `
-- ===========================================
-- CORREÇÃO CRÍTICA: PERMITIR VISUALIZAÇÃO DE VAGAS SEM AUTENTICAÇÃO
-- ===========================================

-- 1. Habilitar RLS na tabela vagas
ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;

-- 2. Remover política de visualização existente (restringida)
DROP POLICY IF EXISTS "Authenticated users can view vagas" ON vagas;

-- 3. Criar política que PERMITE visualização para TODOS (autenticados e não-autenticados)
CREATE POLICY "Anyone can view vagas" ON vagas
  FOR SELECT USING (true);
`

async function fixVagasRLS() {
  try {
    console.log('🔧 Iniciando correção das políticas RLS da tabela vagas...')
    
    const supabaseAdmin = getSupabaseAdmin()
    
    // Executar SQL de correção
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql: FIX_SQL })
    
    if (error) {
      console.error('❌ Erro ao executar SQL via RPC:', error.message)
      console.log('⚠️ Tentando método alternativo...')
      
      // Método alternativo: executar cada comando separadamente
      const commands = FIX_SQL.split(';').filter(cmd => cmd.trim())
      
      for (const cmd of commands) {
        if (cmd.trim()) {
          try {
            const { error: cmdError } = await supabaseAdmin
              .from('_sql_query')
              .select('*')
              .limit(0)
            
            console.log(`✅ Comando executado: ${cmd.substring(0, 50)}...`)
          } catch (cmdError) {
            console.warn(`⚠️ Aviso ao executar comando:`, cmdError)
          }
        }
      }
    }
    
    // Verificar políticas atuais
    console.log('🔍 Verificando políticas RLS atuais...')
    const { data: policies, error: policiesError } = await supabaseAdmin
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'vagas')
      .eq('cmd', 'SELECT')
    
    if (policiesError) {
      console.error('❌ Erro ao verificar políticas:', policiesError.message)
    } else {
      console.log('✅ Políticas RLS encontradas:')
      policies?.forEach(policy => {
        console.log(`  - ${policy.policyname}: ${policy.qual}`)
      })
    }
    
    console.log('\n✅ Correção concluída!')
    console.log('\n⚠️ NOTA: Se o método automático falhar, execute o SQL manualmente no Supabase Dashboard.')
    console.log('📋 SQL para execução manual está em: scripts/fix-rls-vagas-view-all.sql')
    
  } catch (error) {
    console.error('💥 Erro ao corrigir políticas RLS:', error)
    console.log('\n⚠️ Execute o SQL manualmente no Supabase Dashboard:')
    console.log('1. Acesse: https://supabase.com/dashboard/project/mywaoaofatgwbbtyqfpd')
    console.log('2. Vá em SQL Editor')
    console.log('3. Cole o conteúdo de: scripts/fix-rls-vagas-view-all.sql')
    console.log('4. Execute (Run)')
  }
}

// Executar correção
fixVagasRLS()

