-- Script SQL para criar a tabela contact_email_config com suporte a múltiplos destinatários
-- Execute este script no SQL Editor do Supabase

-- Remover tabela existente se houver (cuidado em produção!)
DROP TABLE IF EXISTS contact_email_config CASCADE;

-- Criar a nova tabela contact_email_config
CREATE TABLE contact_email_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  nome VARCHAR(255), -- Nome opcional para identificar o destinatário
  ativo BOOLEAN DEFAULT true,
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

-- Criar política RLS para leitura por usuários autenticados (para o formulário de contato)
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

-- Inserir emails padrão
INSERT INTO contact_email_config (email, nome, ativo) VALUES
('roberio.gomes@atento.com', 'Roberio Gomes', true)
ON CONFLICT (email) DO NOTHING;

-- Verificar se a tabela foi criada corretamente
SELECT 'Tabela contact_email_config criada com sucesso!' as status;
SELECT * FROM contact_email_config ORDER BY created_at;
