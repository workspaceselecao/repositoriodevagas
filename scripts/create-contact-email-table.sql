-- Script SQL para criar a tabela contact_email_config
-- Execute este script no SQL Editor do Supabase

-- Criar a tabela contact_email_config
CREATE TABLE IF NOT EXISTS contact_email_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE contact_email_config ENABLE ROW LEVEL SECURITY;

-- Criar política RLS para admins
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

-- Inserir email padrão se não existir
INSERT INTO contact_email_config (email)
SELECT 'roberio.gomes@atento.com'
WHERE NOT EXISTS (
  SELECT 1 FROM contact_email_config 
  WHERE email = 'roberio.gomes@atento.com'
);

-- Verificar se a tabela foi criada corretamente
SELECT 'Tabela contact_email_config criada com sucesso!' as status;
SELECT * FROM contact_email_config;
