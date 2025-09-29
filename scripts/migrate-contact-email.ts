import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://mywaoaofatgwbbtyqfpd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15d2FvYW9mYXRnd2JidHlxZnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4NzQsImV4cCI6MjA1MDU1MDg3NH0.8QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrateContactEmailConfig() {
  console.log('Iniciando migração para adicionar tabela contact_email_config...')
  
  try {
    // Criar a tabela contact_email_config
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS contact_email_config (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (createTableError) {
      console.error('Erro ao criar tabela contact_email_config:', createTableError)
      return false
    }

    // Habilitar RLS
    const { error: enableRlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE contact_email_config ENABLE ROW LEVEL SECURITY;'
    })

    if (enableRlsError) {
      console.error('Erro ao habilitar RLS:', enableRlsError)
      return false
    }

    // Criar política RLS
    const { error: createPolicyError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_policies 
                WHERE tablename = 'contact_email_config' 
                AND policyname = 'Admin can manage contact email config'
            ) THEN
                CREATE POLICY "Admin can manage contact email config" ON contact_email_config
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
    })

    if (createPolicyError) {
      console.error('Erro ao criar política RLS:', createPolicyError)
      return false
    }

    // Inserir email padrão se não existir
    const { data: existingConfig } = await supabase
      .from('contact_email_config')
      .select('*')
      .single()

    if (!existingConfig) {
      const { error: insertError } = await supabase
        .from('contact_email_config')
        .insert({
          email: 'roberio.gomes@atento.com'
        })

      if (insertError) {
        console.error('Erro ao inserir email padrão:', insertError)
        return false
      }
      
      console.log('Email padrão inserido: roberio.gomes@atento.com')
    }

    console.log('Migração concluída com sucesso!')
    return true

  } catch (error) {
    console.error('Erro durante a migração:', error)
    return false
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  migrateContactEmailConfig()
    .then(success => {
      if (success) {
        console.log('✅ Migração executada com sucesso!')
        process.exit(0)
      } else {
        console.log('❌ Migração falhou!')
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('❌ Erro ao executar migração:', error)
      process.exit(1)
    })
}

export { migrateContactEmailConfig }
