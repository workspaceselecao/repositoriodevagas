import { supabaseAdmin } from '../src/lib/supabase'

async function fixRLSRecursion() {
  console.log('🔧 Corrigindo políticas RLS que causam recursão infinita...')

  try {
    // 1. Remover políticas problemáticas da tabela users
    console.log('🗑️ Removendo políticas problemáticas da tabela users...')
    
    const policiesToRemove = [
      'Users can view their own data',
      'Admins can view all users',
      'Admins have full control over users'
    ]

    for (const policyName of policiesToRemove) {
      try {
        await supabaseAdmin.rpc('exec_sql', {
          sql: `DROP POLICY IF EXISTS "${policyName}" ON users;`
        })
        console.log(`✅ Política "${policyName}" removida`)
      } catch (error) {
        console.warn(`⚠️ Erro ao remover política "${policyName}":`, error)
      }
    }

    // 2. Criar políticas RLS corrigidas para users
    console.log('🆕 Criando políticas RLS corrigidas para users...')

    // Política para usuários verem seus próprios dados (sem recursão)
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE POLICY "users_select_own" ON users
          FOR SELECT USING (auth.uid()::text = id::text);
      `
    })
    console.log('✅ Política "users_select_own" criada')

    // Política para admins verem todos os usuários (usando auth.jwt() em vez de consultar users)
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE POLICY "users_select_admin" ON users
          FOR SELECT USING (
            auth.jwt() ->> 'role' = 'ADMIN' OR
            (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
          );
      `
    })
    console.log('✅ Política "users_select_admin" criada')

    // Política para admins terem controle total (usando auth.jwt())
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE POLICY "users_all_admin" ON users
          FOR ALL USING (
            auth.jwt() ->> 'role' = 'ADMIN' OR
            (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
          );
      `
    })
    console.log('✅ Política "users_all_admin" criada')

    // 3. Corrigir políticas de outras tabelas que consultam users
    console.log('🔧 Corrigindo políticas de outras tabelas...')

    // Lista de políticas que precisam ser corrigidas
    const tablePolicies = [
      { table: 'vagas', policy: 'Admins have full control over vagas' },
      { table: 'backup_logs', policy: 'Admins have full control over backup_logs' },
      { table: 'contact_email_config', policy: 'Admins have full control over contact_email_config' },
      { table: 'emailjs_config', policy: 'Admins have full control over emailjs_config' },
      { table: 'system_control', policy: 'Admins have full control over system_control' },
      { table: 'admin_sovereignty', policy: 'Admins have full control over admin_sovereignty' },
      { table: 'admin_audit_log', policy: 'Admins have full control over admin_audit_log' }
    ]

    for (const { table, policy } of tablePolicies) {
      try {
        // Remover política existente
        await supabaseAdmin.rpc('exec_sql', {
          sql: `DROP POLICY IF EXISTS "${policy}" ON ${table};`
        })

        // Criar nova política sem recursão
        await supabaseAdmin.rpc('exec_sql', {
          sql: `
            CREATE POLICY "${policy}" ON ${table}
              FOR ALL USING (
                auth.jwt() ->> 'role' = 'ADMIN' OR
                (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
              );
          `
        })
        console.log(`✅ Política corrigida para ${table}`)
      } catch (error) {
        console.warn(`⚠️ Erro ao corrigir política para ${table}:`, error)
      }
    }

    // 4. Corrigir políticas específicas de vagas
    console.log('🔧 Corrigindo políticas específicas de vagas...')

    const vagasPolicies = [
      {
        name: 'RH and Admin can insert vagas',
        sql: `
          CREATE POLICY "RH and Admin can insert vagas" ON vagas
            FOR INSERT WITH CHECK (
              auth.jwt() ->> 'role' IN ('RH', 'ADMIN') OR
              (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('RH', 'ADMIN')
            );
        `
      },
      {
        name: 'RH and Admin can update vagas',
        sql: `
          CREATE POLICY "RH and Admin can update vagas" ON vagas
            FOR UPDATE USING (
              auth.jwt() ->> 'role' IN ('RH', 'ADMIN') OR
              (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('RH', 'ADMIN')
            );
        `
      },
      {
        name: 'Admin can delete vagas',
        sql: `
          CREATE POLICY "Admin can delete vagas" ON vagas
            FOR DELETE USING (
              auth.jwt() ->> 'role' = 'ADMIN' OR
              (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
            );
        `
      }
    ]

    for (const { name, sql } of vagasPolicies) {
      try {
        // Remover política existente
        await supabaseAdmin.rpc('exec_sql', {
          sql: `DROP POLICY IF EXISTS "${name}" ON vagas;`
        })

        // Criar nova política
        await supabaseAdmin.rpc('exec_sql', { sql })
        console.log(`✅ Política "${name}" corrigida`)
      } catch (error) {
        console.warn(`⚠️ Erro ao corrigir política "${name}":`, error)
      }
    }

    // 5. Corrigir política de backup_logs
    try {
      await supabaseAdmin.rpc('exec_sql', {
        sql: `DROP POLICY IF EXISTS "Admin can manage backup logs" ON backup_logs;`
      })

      await supabaseAdmin.rpc('exec_sql', {
        sql: `
          CREATE POLICY "Admin can manage backup logs" ON backup_logs
            FOR ALL USING (
              auth.jwt() ->> 'role' = 'ADMIN' OR
              (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
            );
        `
      })
      console.log('✅ Política de backup_logs corrigida')
    } catch (error) {
      console.warn('⚠️ Erro ao corrigir política de backup_logs:', error)
    }

    // 6. Corrigir políticas de configuração
    const configPolicies = [
      { table: 'contact_email_config', name: 'Admin can manage contact email config' },
      { table: 'emailjs_config', name: 'Admin can manage emailjs config' },
      { table: 'system_control', name: 'Admin can manage system control' }
    ]

    for (const { table, name } of configPolicies) {
      try {
        await supabaseAdmin.rpc('exec_sql', {
          sql: `DROP POLICY IF EXISTS "${name}" ON ${table};`
        })

        await supabaseAdmin.rpc('exec_sql', {
          sql: `
            CREATE POLICY "${name}" ON ${table}
              FOR ALL USING (
                auth.jwt() ->> 'role' = 'ADMIN' OR
                (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
              );
          `
        })
        console.log(`✅ Política de ${table} corrigida`)
      } catch (error) {
        console.warn(`⚠️ Erro ao corrigir política de ${table}:`, error)
      }
    }

    console.log('✅ Correção das políticas RLS concluída!')
    console.log('🔄 As políticas agora usam auth.jwt() em vez de consultar a tabela users')
    console.log('📝 Isso deve resolver os erros de recursão infinita')

  } catch (error) {
    console.error('❌ Erro ao corrigir políticas RLS:', error)
    throw error
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixRLSRecursion()
    .then(() => {
      console.log('🎉 Script de correção executado com sucesso!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Erro na execução:', error)
      process.exit(1)
    })
}

export { fixRLSRecursion }
