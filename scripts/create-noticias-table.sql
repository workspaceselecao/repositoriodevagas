-- Script para criar tabela de notícias
-- Execute no Supabase SQL Editor

-- Tabela de notícias
CREATE TABLE IF NOT EXISTS noticias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT NOT NULL,
  tipo VARCHAR(20) CHECK (tipo IN ('info', 'alerta', 'anuncio')) NOT NULL,
  ativa BOOLEAN DEFAULT true,
  prioridade VARCHAR(10) CHECK (prioridade IN ('baixa', 'media', 'alta')) DEFAULT 'media',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_noticias_tipo ON noticias(tipo);
CREATE INDEX IF NOT EXISTS idx_noticias_ativa ON noticias(ativa);
CREATE INDEX IF NOT EXISTS idx_noticias_prioridade ON noticias(prioridade);
CREATE INDEX IF NOT EXISTS idx_noticias_created_at ON noticias(created_at);
CREATE INDEX IF NOT EXISTS idx_noticias_created_by ON noticias(created_by);

-- Trigger para atualizar updated_at automaticamente
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_noticias_updated_at' 
        AND tgrelid = 'noticias'::regclass
    ) THEN
        CREATE TRIGGER update_noticias_updated_at BEFORE UPDATE ON noticias
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- RLS (Row Level Security) para proteger os dados
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para noticias
DO $$
BEGIN
    -- Política para leitura: todos os usuários autenticados podem ler notícias
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'noticias' 
        AND policyname = 'Usuários podem ler notícias'
    ) THEN
        CREATE POLICY "Usuários podem ler notícias" ON noticias
          FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    -- Política para inserção: apenas admins podem criar notícias
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'noticias' 
        AND policyname = 'Apenas admins podem criar notícias'
    ) THEN
        CREATE POLICY "Apenas admins podem criar notícias" ON noticias
          FOR INSERT WITH CHECK (
            auth.uid() IN (
              SELECT id FROM users WHERE role = 'ADMIN'
            )
          );
    END IF;

    -- Política para atualização: apenas admins podem atualizar notícias
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'noticias' 
        AND policyname = 'Apenas admins podem atualizar notícias'
    ) THEN
        CREATE POLICY "Apenas admins podem atualizar notícias" ON noticias
          FOR UPDATE USING (
            auth.uid() IN (
              SELECT id FROM users WHERE role = 'ADMIN'
            )
          );
    END IF;

    -- Política para exclusão: apenas admins podem excluir notícias
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'noticias' 
        AND policyname = 'Apenas admins podem excluir notícias'
    ) THEN
        CREATE POLICY "Apenas admins podem excluir notícias" ON noticias
          FOR DELETE USING (
            auth.uid() IN (
              SELECT id FROM users WHERE role = 'ADMIN'
            )
          );
    END IF;
END $$;

-- Inserir algumas notícias de exemplo
INSERT INTO noticias (titulo, conteudo, tipo, prioridade, created_by) VALUES
(
  '🎉 Bem-vindos ao Sistema de Repositório de Vagas!',
  'Este é o novo sistema para gerenciamento de vagas de emprego. Aqui você pode criar, editar e acompanhar todas as oportunidades disponíveis.',
  'info',
  'alta',
  (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1)
),
(
  '⚠️ Importante: Atualização do Sistema',
  'Em breve teremos uma nova versão do sistema com melhorias significativas. Fiquem atentos às notícias!',
  'alerta',
  'media',
  (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1)
),
(
  '📢 Novo: Sistema de Notícias',
  'Agora vocês podem visualizar notícias, avisos e anúncios diretamente no dashboard principal.',
  'anuncio',
  'media',
  (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1)
)
ON CONFLICT DO NOTHING;

SELECT 'Tabela de notícias criada com sucesso!' as status;
