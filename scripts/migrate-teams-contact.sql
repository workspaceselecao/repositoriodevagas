-- Migração para adicionar campo teams_contact à tabela contact_email_config
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna teams_contact se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contact_email_config' 
        AND column_name = 'teams_contact'
    ) THEN
        ALTER TABLE contact_email_config 
        ADD COLUMN teams_contact TEXT;
        
        -- Comentário para documentar a coluna
        COMMENT ON COLUMN contact_email_config.teams_contact IS 'Link do Teams para contato direto';
        
        RAISE NOTICE 'Coluna teams_contact adicionada com sucesso à tabela contact_email_config';
    ELSE
        RAISE NOTICE 'Coluna teams_contact já existe na tabela contact_email_config';
    END IF;
END $$;

-- Verificar se a migração foi aplicada
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contact_email_config' 
AND column_name = 'teams_contact';
