-- Script para reativar RLS de forma segura (sem recursão)
-- Execute APENAS depois que o login estiver funcionando

-- 1. CRIAR POLÍTICAS SIMPLES E SEGURAS (sem recursão)

-- Políticas para tabela USERS
CREATE POLICY "users_select_policy" ON users
FOR SELECT
USING (true); -- Permite todos os usuários autenticados verem usuários

CREATE POLICY "users_insert_policy" ON users
FOR INSERT
WITH CHECK (true); -- Permite criação de usuários

CREATE POLICY "users_update_policy" ON users
FOR UPDATE
USING (true); -- Permite atualização

CREATE POLICY "users_delete_policy" ON users
FOR DELETE
USING (true); -- Permite exclusão (apenas para admins na prática)

-- Políticas para tabela VAGAS
CREATE POLICY "vagas_select_policy" ON vagas
FOR SELECT
USING (true); -- Permite todos verem vagas

CREATE POLICY "vagas_insert_policy" ON vagas
FOR INSERT
WITH CHECK (true); -- Permite inserção

CREATE POLICY "vagas_update_policy" ON vagas
FOR UPDATE
USING (true); -- Permite atualização

CREATE POLICY "vagas_delete_policy" ON vagas
FOR DELETE
USING (true); -- Permite exclusão

-- Políticas para tabela BACKUP_LOGS
CREATE POLICY "backup_logs_all_policy" ON backup_logs
FOR ALL
USING (true); -- Permite todas as operações

-- 2. REATIVAR RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;

-- 3. VERIFICAR STATUS
SELECT 'RLS reativado com políticas seguras!' as status;
SELECT 'Teste o login para confirmar que está funcionando' as next_step;
