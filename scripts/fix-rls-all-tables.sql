-- ============================================================
-- CORREÇÃO COMPLETA DAS POLÍTICAS RLS PARA TODAS AS TABELAS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================================

-- ============================================================
-- NOTÍCIAS: Criar políticas RLS
-- ============================================================
DO $$
BEGIN
    -- Remover políticas antigas se existirem
    DROP POLICY IF EXISTS "noticias_public_read" ON noticias;
    DROP POLICY IF EXISTS "noticias_authenticated_all" ON noticias;
    DROP POLICY IF EXISTS "noticias_unified" ON noticias;
    DROP POLICY IF EXISTS "Admins have full control over noticias" ON noticias;
    
    -- Criar política para SELECT (público pode ver notícias ativas)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'noticias' 
        AND policyname = 'Noticias public read'
    ) THEN
        CREATE POLICY "Noticias public read" ON noticias
          FOR SELECT USING (ativa = true);
    END IF;
    
    -- Criar política para ADMIN (controle total)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'noticias' 
        AND policyname = 'Noticias admin all'
    ) THEN
        CREATE POLICY "Noticias admin all" ON noticias
          FOR ALL USING (
            auth.uid() IS NOT NULL AND
            EXISTS (
              SELECT 1 FROM users 
              WHERE id::text = auth.uid()::text 
              AND role = 'ADMIN'
            )
          );
    END IF;
END $$;

-- ============================================================
-- CONTACT_EMAIL_CONFIG: Corrigir políticas RLS
-- ============================================================
DO $$
BEGIN
    -- Remover políticas duplicadas
    DROP POLICY IF EXISTS "Admins have full control over contact_email_config" ON contact_email_config;
    
    -- Criar política única e correta
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'contact_email_config' 
        AND policyname = 'Contact email admin all'
    ) THEN
        CREATE POLICY "Contact email admin all" ON contact_email_config
          FOR ALL USING (
            auth.uid() IS NOT NULL AND
            EXISTS (
              SELECT 1 FROM users 
              WHERE id::text = auth.uid()::text 
              AND role = 'ADMIN'
            )
          );
    END IF;
END $$;

-- ============================================================
-- USERS: Corrigir políticas RLS
-- ============================================================
DO $$
BEGIN
    -- Remover políticas antigas problemáticas
    DROP POLICY IF EXISTS "Users can view their own data" ON users;
    DROP POLICY IF EXISTS "Admins can view all users" ON users;
    DROP POLICY IF EXISTS "Admins have full control over users" ON users;
    
    -- Criar política para usuários verem seus próprios dados
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Users select own'
    ) THEN
        CREATE POLICY "Users select own" ON users
          FOR SELECT USING (auth.uid()::text = id::text);
    END IF;
    
    -- Criar política para ADMIN ver todos os usuários
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Users admin select'
    ) THEN
        CREATE POLICY "Users admin select" ON users
          FOR SELECT USING (
            auth.uid() IS NOT NULL AND
            EXISTS (
              SELECT 1 FROM users u
              WHERE u.id::text = auth.uid()::text 
              AND u.role = 'ADMIN'
            )
          );
    END IF;
    
    -- Criar política para ADMIN controle total (INSERT, UPDATE, DELETE)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Users admin all'
    ) THEN
        CREATE POLICY "Users admin all" ON users
          FOR ALL USING (
            auth.uid() IS NOT NULL AND
            EXISTS (
              SELECT 1 FROM users u
              WHERE u.id::text = auth.uid()::text 
              AND u.role = 'ADMIN'
            )
          );
    END IF;
END $$;

-- ============================================================
-- VAGAS: Corrigir políticas RLS (complementando a existente)
-- ============================================================
DO $$
BEGIN
    -- Garantir que existe a política de visualização pública
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vagas' 
        AND policyname = 'Anyone can view vagas'
    ) THEN
        CREATE POLICY "Anyone can view vagas" ON vagas
          FOR SELECT USING (true);
    END IF;
    
    -- Criar política para INSERT apenas para ADMIN/RH
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vagas' 
        AND policyname = 'Vagas authenticated insert'
    ) THEN
        CREATE POLICY "Vagas authenticated insert" ON vagas
          FOR INSERT WITH CHECK (
            auth.uid() IS NOT NULL AND
            EXISTS (
              SELECT 1 FROM users 
              WHERE id::text = auth.uid()::text 
              AND role IN ('ADMIN', 'RH')
            )
          );
    END IF;
    
    -- Criar política para UPDATE apenas para ADMIN/RH
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vagas' 
        AND policyname = 'Vagas authenticated update'
    ) THEN
        CREATE POLICY "Vagas authenticated update" ON vagas
          FOR UPDATE USING (
            auth.uid() IS NOT NULL AND
            EXISTS (
              SELECT 1 FROM users 
              WHERE id::text = auth.uid()::text 
              AND role IN ('ADMIN', 'RH')
            )
          );
    END IF;
    
    -- Criar política para DELETE apenas para ADMIN/RH
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vagas' 
        AND policyname = 'Vagas authenticated delete'
    ) THEN
        CREATE POLICY "Vagas authenticated delete" ON vagas
          FOR DELETE USING (
            auth.uid() IS NOT NULL AND
            EXISTS (
              SELECT 1 FROM users 
              WHERE id::text = auth.uid()::text 
              AND role IN ('ADMIN', 'RH')
            )
          );
    END IF;
END $$;

-- ============================================================
-- Verificar políticas criadas
-- ============================================================
SELECT 
  tablename, 
  policyname, 
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('noticias', 'contact_email_config', 'users', 'vagas')
ORDER BY tablename, cmd;

-- ============================================================
-- RESUMO
-- ============================================================
SELECT 
  '✅ Políticas RLS corrigidas para:' as status,
  'noticias, contact_email_config, users, vagas' as tables;

