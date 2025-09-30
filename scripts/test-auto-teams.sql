-- Script para testar a funcionalidade automática do Teams
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar emails @atento.com existentes
SELECT 
    id,
    email,
    nome,
    teams_contact,
    ativo,
    created_at
FROM contact_email_config
WHERE email LIKE '%@atento.com'
ORDER BY created_at;

-- 2. Se não houver email @atento.com, criar um de teste
INSERT INTO contact_email_config (email, nome, ativo)
VALUES (
    'admin@atento.com',
    'Admin Atento',
    true
)
ON CONFLICT (email) DO NOTHING;

-- 3. Verificar se foi criado/atualizado
SELECT 
    id,
    email,
    nome,
    teams_contact,
    ativo,
    created_at
FROM contact_email_config
WHERE email LIKE '%@atento.com'
ORDER BY created_at;

-- 4. Testar a lógica: o link Teams deve ser gerado automaticamente
-- Link esperado: https://teams.microsoft.com/l/chat/0/0?users=admin@atento.com
-- (ou o email @atento.com que estiver ativo)

-- 5. Verificar todos os emails ativos
SELECT 
    email,
    nome,
    CASE 
        WHEN email LIKE '%@atento.com' THEN 'Teams Automático'
        WHEN teams_contact IS NOT NULL THEN 'Teams Manual'
        ELSE 'Sem Teams'
    END as tipo_teams,
    ativo
FROM contact_email_config
WHERE ativo = true
ORDER BY 
    CASE 
        WHEN email LIKE '%@atento.com' THEN 1
        WHEN teams_contact IS NOT NULL THEN 2
        ELSE 3
    END;
