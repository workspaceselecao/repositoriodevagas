-- Script para limpar emails duplicados e testar funcionalidade Teams
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar emails duplicados
SELECT 
    email,
    COUNT(*) as quantidade,
    STRING_AGG(id::text, ', ') as ids
FROM contact_email_config
GROUP BY email
HAVING COUNT(*) > 1;

-- 2. Remover duplicatas (manter apenas o mais recente)
WITH duplicates AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
    FROM contact_email_config
)
DELETE FROM contact_email_config 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- 3. Verificar resultado
SELECT 
    id,
    email,
    nome,
    teams_contact,
    ativo,
    created_at
FROM contact_email_config
ORDER BY created_at;

-- 4. Atualizar um email existente com Teams (se necessário)
UPDATE contact_email_config 
SET 
    teams_contact = 'https://teams.microsoft.com/l/chat/0/19:meeting_placeholder',
    updated_at = NOW()
WHERE email = 'roberio.gomes@atento.com'
AND teams_contact IS NULL;

-- 5. Verificar se a atualização funcionou
SELECT 
    email,
    nome,
    teams_contact,
    ativo
FROM contact_email_config
WHERE email = 'roberio.gomes@atento.com';
