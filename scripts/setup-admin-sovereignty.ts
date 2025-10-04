import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_KEY são obrigatórias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupAdminSovereignty() {
  console.log('🚀 Configurando sistema de soberania administrativa...')

  try {
    // 1. Aplicar políticas RLS soberanas
    console.log('📋 Aplicando políticas RLS soberanas...')
    
    const policiesSQL = `
      -- Políticas soberanas para administradores
      DO $$
      BEGIN
          -- Política para users
          IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'users' 
              AND policyname = 'Admins have full control over users'
          ) THEN
              CREATE POLICY "Admins have full control over users" ON users
                FOR ALL USING (
                  EXISTS (
                    SELECT 1 FROM users 
                    WHERE id::text = auth.uid()::text 
                    AND role = 'ADMIN'
                  )
                );
          END IF;

          -- Política para vagas
          IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'vagas' 
              AND policyname = 'Admins have full control over vagas'
          ) THEN
              CREATE POLICY "Admins have full control over vagas" ON vagas
                FOR ALL USING (
                  EXISTS (
                    SELECT 1 FROM users 
                    WHERE id::text = auth.uid()::text 
                    AND role = 'ADMIN'
                  )
                );
          END IF;

          -- Política para backup_logs
          IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'backup_logs' 
              AND policyname = 'Admins have full control over backup_logs'
          ) THEN
              CREATE POLICY "Admins have full control over backup_logs" ON backup_logs
                FOR ALL USING (
                  EXISTS (
                    SELECT 1 FROM users 
                    WHERE id::text = auth.uid()::text 
                    AND role = 'ADMIN'
                  )
                );
          END IF;

          -- Política para contact_email_config
          IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'contact_email_config' 
              AND policyname = 'Admins have full control over contact_email_config'
          ) THEN
              CREATE POLICY "Admins have full control over contact_email_config" ON contact_email_config
                FOR ALL USING (
                  EXISTS (
                    SELECT 1 FROM users 
                    WHERE id::text = auth.uid()::text 
                    AND role = 'ADMIN'
                  )
                );
          END IF;

          -- Política para emailjs_config
          IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'emailjs_config' 
              AND policyname = 'Admins have full control over emailjs_config'
          ) THEN
              CREATE POLICY "Admins have full control over emailjs_config" ON emailjs_config
                FOR ALL USING (
                  EXISTS (
                    SELECT 1 FROM users 
                    WHERE id::text = auth.uid()::text 
                    AND role = 'ADMIN'
                  )
                );
          END IF;

          -- Política para system_control
          IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'system_control' 
              AND policyname = 'Admins have full control over system_control'
          ) THEN
              CREATE POLICY "Admins have full control over system_control" ON system_control
                FOR ALL USING (
                  EXISTS (
                    SELECT 1 FROM users 
                    WHERE id::text = auth.uid()::text 
                    AND role = 'ADMIN'
                  )
                );
          END IF;

          -- Política para admin_sovereignty
          IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'admin_sovereignty' 
              AND policyname = 'Admins have full control over admin_sovereignty'
          ) THEN
              CREATE POLICY "Admins have full control over admin_sovereignty" ON admin_sovereignty
                FOR ALL USING (
                  EXISTS (
                    SELECT 1 FROM users 
                    WHERE id::text = auth.uid()::text 
                    AND role = 'ADMIN'
                  )
                );
          END IF;

          -- Política para admin_audit_log
          IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'admin_audit_log' 
              AND policyname = 'Admins have full control over admin_audit_log'
          ) THEN
              CREATE POLICY "Admins have full control over admin_audit_log" ON admin_audit_log
                FOR ALL USING (
                  EXISTS (
                    SELECT 1 FROM users 
                    WHERE id::text = auth.uid()::text 
                    AND role = 'ADMIN'
                  )
                );
          END IF;
      END $$;
    `

    const { error: policiesError } = await supabase.rpc('exec_sql', { sql: policiesSQL })
    
    if (policiesError) {
      console.error('❌ Erro ao aplicar políticas RLS:', policiesError)
      throw policiesError
    }

    console.log('✅ Políticas RLS soberanas aplicadas com sucesso')

    // 2. Verificar se as tabelas existem
    console.log('🔍 Verificando tabelas necessárias...')
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['admin_sovereignty', 'admin_audit_log'])
      .eq('table_schema', 'public')

    if (tablesError) {
      console.error('❌ Erro ao verificar tabelas:', tablesError)
      throw tablesError
    }

    const existingTables = tables?.map(t => t.table_name) || []
    
    if (!existingTables.includes('admin_sovereignty')) {
      console.log('📋 Criando tabela admin_sovereignty...')
      
      const createSovereigntyTable = `
        CREATE TABLE IF NOT EXISTS admin_sovereignty (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          admin_id UUID REFERENCES users(id) NOT NULL,
          action_type VARCHAR(100) NOT NULL,
          target_resource VARCHAR(100),
          action_details JSONB,
          is_active BOOLEAN DEFAULT true,
          expires_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE admin_sovereignty ENABLE ROW LEVEL SECURITY;
        
        CREATE INDEX IF NOT EXISTS idx_admin_sovereignty_admin_id ON admin_sovereignty(admin_id);
        CREATE INDEX IF NOT EXISTS idx_admin_sovereignty_active ON admin_sovereignty(is_active);
      `

      const { error: sovereigntyError } = await supabase.rpc('exec_sql', { sql: createSovereigntyTable })
      
      if (sovereigntyError) {
        console.error('❌ Erro ao criar tabela admin_sovereignty:', sovereigntyError)
        throw sovereigntyError
      }
    }

    if (!existingTables.includes('admin_audit_log')) {
      console.log('📋 Criando tabela admin_audit_log...')
      
      const createAuditTable = `
        CREATE TABLE IF NOT EXISTS admin_audit_log (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          admin_id UUID REFERENCES users(id) NOT NULL,
          action VARCHAR(100) NOT NULL,
          resource_type VARCHAR(100),
          resource_id UUID,
          old_values JSONB,
          new_values JSONB,
          ip_address INET,
          user_agent TEXT,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
        
        CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
        CREATE INDEX IF NOT EXISTS idx_admin_audit_log_timestamp ON admin_audit_log(timestamp);
      `

      const { error: auditError } = await supabase.rpc('exec_sql', { sql: createAuditTable })
      
      if (auditError) {
        console.error('❌ Erro ao criar tabela admin_audit_log:', auditError)
        throw auditError
      }
    }

    console.log('✅ Tabelas verificadas/criadas com sucesso')

    // 3. Ativar poderes básicos para administradores existentes
    console.log('👑 Ativando poderes básicos para administradores...')
    
    const { data: admins, error: adminsError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('role', 'ADMIN')

    if (adminsError) {
      console.error('❌ Erro ao buscar administradores:', adminsError)
      throw adminsError
    }

    if (admins && admins.length > 0) {
      for (const admin of admins) {
        console.log(`👤 Configurando poderes para: ${admin.email}`)
        
        // Ativar poderes básicos
        const basicPowers = [
          { action_type: 'system_control', target_resource: 'system' },
          { action_type: 'user_management', target_resource: 'users' },
          { action_type: 'data_management', target_resource: 'vagas' },
          { action_type: 'audit_access', target_resource: 'audit' }
        ]

        for (const power of basicPowers) {
          const { error: powerError } = await supabase
            .from('admin_sovereignty')
            .upsert({
              admin_id: admin.id,
              action_type: power.action_type,
              target_resource: power.target_resource,
              action_details: { auto_granted: true },
              is_active: true
            }, {
              onConflict: 'admin_id,action_type,target_resource'
            })

          if (powerError) {
            console.warn(`⚠️ Erro ao ativar poder ${power.action_type} para ${admin.email}:`, powerError)
          }
        }
      }
    }

    console.log('✅ Poderes básicos ativados com sucesso')

    // 4. Criar log inicial
    console.log('📝 Criando log inicial...')
    
    const { error: logError } = await supabase
      .from('admin_audit_log')
      .insert({
        admin_id: admins?.[0]?.id || '00000000-0000-0000-0000-000000000000',
        action: 'system_setup',
        resource_type: 'system',
        old_values: null,
        new_values: { 
          sovereignty_system: 'enabled',
          timestamp: new Date().toISOString()
        },
        ip_address: '127.0.0.1',
        user_agent: 'setup-script'
      })

    if (logError) {
      console.warn('⚠️ Erro ao criar log inicial:', logError)
    }

    console.log('🎉 Sistema de soberania administrativa configurado com sucesso!')
    console.log('')
    console.log('📋 Resumo das configurações:')
    console.log('   ✅ Políticas RLS soberanas aplicadas')
    console.log('   ✅ Tabelas de soberania criadas/verificadas')
    console.log('   ✅ Poderes básicos ativados para administradores')
    console.log('   ✅ Sistema de auditoria configurado')
    console.log('')
    console.log('🔐 Poderes disponíveis:')
    console.log('   • system_control: Controle do sistema')
    console.log('   • user_management: Gerenciamento de usuários')
    console.log('   • data_management: Gerenciamento de dados')
    console.log('   • audit_access: Acesso à auditoria')
    console.log('   • bypass_rls: Bypass de RLS (pode ser ativado manualmente)')
    console.log('   • emergency_override: Sobrescrita de emergência (pode ser ativado manualmente)')
    console.log('')
    console.log('🌐 Acesse o painel de controle em: /admin/control-panel')

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error)
    process.exit(1)
  }
}

// Executar configuração
setupAdminSovereignty()
