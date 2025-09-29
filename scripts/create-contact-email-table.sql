-- Script SQL para criar as tabelas contact_email_config e emailjs_config
-- Execute este script no SQL Editor do Supabase

-- Remover tabelas existentes se houver (cuidado em produção!)
DROP TABLE IF EXISTS contact_email_config CASCADE;
DROP TABLE IF EXISTS emailjs_config CASCADE;

-- Criar a nova tabela contact_email_config
CREATE TABLE contact_email_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  nome VARCHAR(255), -- Nome opcional para identificar o destinatário
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar a nova tabela emailjs_config
CREATE TABLE emailjs_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id VARCHAR(255) NOT NULL,
  template_id VARCHAR(255) NOT NULL,
  public_key VARCHAR(500) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE contact_email_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE emailjs_config ENABLE ROW LEVEL SECURITY;

-- Criar política RLS para contact_email_config (admins)
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

-- Criar política RLS para contact_email_config (leitura por usuários autenticados)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'contact_email_config' 
        AND policyname = 'Authenticated users can read active emails'
    ) THEN
        CREATE POLICY "Authenticated users can read active emails" ON contact_email_config
          FOR SELECT USING (
            auth.role() = 'authenticated' 
            AND ativo = true
          );
    END IF;
END $$;

-- Criar política RLS para emailjs_config (admins)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'emailjs_config' 
        AND policyname = 'Admin can manage emailjs config'
    ) THEN
        CREATE POLICY "Admin can manage emailjs config" ON emailjs_config
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM users 
              WHERE id::text = auth.uid()::text 
              AND role = 'ADMIN'
            )
          );
    END IF;
END $$;

-- Criar política RLS para emailjs_config (leitura por usuários autenticados)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'emailjs_config' 
        AND policyname = 'Authenticated users can read active emailjs config'
    ) THEN
        CREATE POLICY "Authenticated users can read active emailjs config" ON emailjs_config
          FOR SELECT USING (
            auth.role() = 'authenticated' 
            AND ativo = true
          );
    END IF;
END $$;

-- Inserir emails padrão
INSERT INTO contact_email_config (email, nome, ativo) VALUES
('roberio.gomes@atento.com', 'Roberio Gomes', true)
ON CONFLICT (email) DO NOTHING;

-- Verificar se as tabelas foram criadas corretamente
SELECT 'Tabelas contact_email_config e emailjs_config criadas com sucesso!' as status;
SELECT 'Emails de contato:' as tabela;
SELECT * FROM contact_email_config ORDER BY created_at;
SELECT 'Configurações EmailJS:' as tabela;
SELECT * FROM emailjs_config ORDER BY created_at;
