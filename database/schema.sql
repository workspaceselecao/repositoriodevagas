-- Schema para o sistema de Repositório de Vagas
-- Baseado na estrutura do arquivo REPOSITORIO.json

-- Tabela de usuários com sistema de roles
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('ADMIN', 'RH')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela principal de vagas
CREATE TABLE IF NOT EXISTS vagas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site VARCHAR(255) NOT NULL,
  categoria VARCHAR(255) NOT NULL,
  cargo VARCHAR(255) NOT NULL,
  cliente VARCHAR(255) NOT NULL,
  titulo VARCHAR(255),
  celula VARCHAR(255) NOT NULL,
  descricao_vaga TEXT,
  responsabilidades_atribuicoes TEXT,
  requisitos_qualificacoes TEXT,
  salario VARCHAR(255),
  horario_trabalho VARCHAR(255),
  jornada_trabalho VARCHAR(255),
  beneficios TEXT,
  local_trabalho TEXT,
  etapas_processo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- Tabela para logs de backup
CREATE TABLE IF NOT EXISTS backup_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  backup_type VARCHAR(50) NOT NULL, -- 'manual', 'automatic', 'export'
  backup_data JSONB,
  file_path VARCHAR(500),
  status VARCHAR(20) CHECK (status IN ('success', 'failed', 'pending')) NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para configuração de emails de contato (múltiplos destinatários)
CREATE TABLE IF NOT EXISTS contact_email_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  nome VARCHAR(255), -- Nome opcional para identificar o destinatário
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_vagas_cliente ON vagas(cliente);
CREATE INDEX IF NOT EXISTS idx_vagas_site ON vagas(site);
CREATE INDEX IF NOT EXISTS idx_vagas_categoria ON vagas(categoria);
CREATE INDEX IF NOT EXISTS idx_vagas_cargo ON vagas(cargo);
CREATE INDEX IF NOT EXISTS idx_vagas_celula ON vagas(celula);
CREATE INDEX IF NOT EXISTS idx_vagas_titulo ON vagas(titulo);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at (com verificação de existência)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_users_updated_at' 
        AND tgrelid = 'users'::regclass
    ) THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_vagas_updated_at' 
        AND tgrelid = 'vagas'::regclass
    ) THEN
        CREATE TRIGGER update_vagas_updated_at BEFORE UPDATE ON vagas
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Nota: O usuário ADMIN será criado via Supabase Auth
-- Email: roberio.gomes@atento.com
-- Senha: admin123
-- Role: ADMIN

-- RLS (Row Level Security) para proteger os dados
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_email_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para users (com verificação de existência)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Users can view their own data'
    ) THEN
        CREATE POLICY "Users can view their own data" ON users
          FOR SELECT USING (auth.uid()::text = id::text);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Admins can view all users'
    ) THEN
        CREATE POLICY "Admins can view all users" ON users
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM users 
              WHERE id::text = auth.uid()::text 
              AND role = 'ADMIN'
            )
          );
    END IF;
END $$;

-- Políticas RLS para vagas (com verificação de existência)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vagas' 
        AND policyname = 'Authenticated users can view vagas'
    ) THEN
        CREATE POLICY "Authenticated users can view vagas" ON vagas
          FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vagas' 
        AND policyname = 'RH and Admin can insert vagas'
    ) THEN
        CREATE POLICY "RH and Admin can insert vagas" ON vagas
          FOR INSERT WITH CHECK (
            EXISTS (
              SELECT 1 FROM users 
              WHERE id::text = auth.uid()::text 
              AND role IN ('RH', 'ADMIN')
            )
          );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vagas' 
        AND policyname = 'RH and Admin can update vagas'
    ) THEN
        CREATE POLICY "RH and Admin can update vagas" ON vagas
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM users 
              WHERE id::text = auth.uid()::text 
              AND role IN ('RH', 'ADMIN')
            )
          );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vagas' 
        AND policyname = 'Admin can delete vagas'
    ) THEN
        CREATE POLICY "Admin can delete vagas" ON vagas
          FOR DELETE USING (
            EXISTS (
              SELECT 1 FROM users 
              WHERE id::text = auth.uid()::text 
              AND role = 'ADMIN'
            )
          );
    END IF;
END $$;

-- Políticas RLS para backup_logs (com verificação de existência)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'backup_logs' 
        AND policyname = 'Admin can manage backup logs'
    ) THEN
        CREATE POLICY "Admin can manage backup logs" ON backup_logs
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM users 
              WHERE id::text = auth.uid()::text 
              AND role = 'ADMIN'
            )
          );
    END IF;
END $$;

-- Políticas RLS para contact_email_config (com verificação de existência)
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

-- ========================================
-- INSTRUÇÕES DE USO:
-- ========================================
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Crie o usuário ADMIN via Authentication → Users:
--    - Email: roberio.gomes@atento.com
--    - Senha: admin123
-- 3. Execute o script de população: scripts/populate-database.ts
-- 4. Configure as URLs de redirecionamento em Authentication → URL Configuration
-- ========================================