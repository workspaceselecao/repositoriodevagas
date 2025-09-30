-- Script para verificar se o campo teams_contact existe e está funcionando
-- Execute este script no SQL Editor do Supabase

-- Verificar se a coluna existe
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contact_email_config' 
ORDER BY ordinal_position;

-- Verificar dados atuais
SELECT 
    id,
    email,
    nome,
    teams_contact,
    ativo,
    created_at,
    updated_at
FROM contact_email_config
ORDER BY created_at;

-- Testar inserção com teams_contact
INSERT INTO contact_email_config (email, nome, teams_contact, ativo)
VALUES (
    'teste@exemplo.com',
    'Teste Teams',
    'https://teams.microsoft.com/l/chat/teste',
    true
);

-- Verificar se foi inserido corretamente
SELECT * FROM contact_email_config WHERE email = 'teste@exemplo.com';

-- Limpar teste
DELETE FROM contact_email_config WHERE email = 'teste@exemplo.com';
