-- ============================================================
-- WELLHUB SCRAPER - SETUP COMPLETO DO SUPABASE
-- Rodar TUDO no SQL Editor do Supabase (uma vez só)
-- ============================================================

-- 1. TABELA PRINCIPAL: academias scrapeadas
CREATE TABLE IF NOT EXISTS scraped_academias (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wellhub_id    text NOT NULL,
  nome          text NOT NULL DEFAULT '',
  telefone      text DEFAULT '',
  endereco      text DEFAULT '',
  estado        text DEFAULT '',
  latitude      double precision,
  longitude     double precision,
  atividades    text DEFAULT '',
  plano         text DEFAULT '',
  preco         text DEFAULT '',
  avaliacao     text DEFAULT '',
  imagem_url    text DEFAULT '',
  link          text DEFAULT '',
  scraped_at    timestamptz DEFAULT now(),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Evitar duplicatas pelo wellhub_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_scraped_wellhub_id
  ON scraped_academias(wellhub_id);

-- Indices para busca rapida
CREATE INDEX IF NOT EXISTS idx_scraped_estado
  ON scraped_academias(estado);
CREATE INDEX IF NOT EXISTS idx_scraped_nome
  ON scraped_academias(nome);
CREATE INDEX IF NOT EXISTS idx_scraped_telefone
  ON scraped_academias(telefone);
CREATE INDEX IF NOT EXISTS idx_scraped_created
  ON scraped_academias(created_at DESC);

-- 2. TABELA DE LOGS: historico de scrapes
CREATE TABLE IF NOT EXISTS scrape_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estado        text,
  cidade        text,
  tipo_busca    text DEFAULT 'estado',
  total_encontrado integer DEFAULT 0,
  total_com_telefone integer DEFAULT 0,
  pontos_varridos integer DEFAULT 0,
  duracao_segundos integer DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- 3. VIEW: resumo por estado
CREATE OR REPLACE VIEW resumo_por_estado AS
SELECT
  estado,
  COUNT(*) as total_academias,
  COUNT(CASE WHEN telefone != '' AND telefone IS NOT NULL THEN 1 END) as com_telefone,
  COUNT(CASE WHEN telefone = '' OR telefone IS NULL THEN 1 END) as sem_telefone,
  MAX(scraped_at) as ultimo_scrape
FROM scraped_academias
GROUP BY estado
ORDER BY total_academias DESC;

-- 4. VIEW: academias com telefone
CREATE OR REPLACE VIEW academias_com_telefone AS
SELECT
  nome, telefone, endereco, estado, link, scraped_at
FROM scraped_academias
WHERE telefone != '' AND telefone IS NOT NULL
ORDER BY estado, nome;

-- 5. RLS: liberar acesso (sem autenticacao necessaria)
ALTER TABLE scraped_academias ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_logs ENABLE ROW LEVEL SECURITY;

-- Permitir tudo para anon (scraper nao precisa login)
CREATE POLICY "anon_select_academias" ON scraped_academias FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_academias" ON scraped_academias FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_academias" ON scraped_academias FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_delete_academias" ON scraped_academias FOR DELETE TO anon USING (true);

CREATE POLICY "anon_select_logs" ON scrape_logs FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_logs" ON scrape_logs FOR INSERT TO anon WITH CHECK (true);

-- Permitir para authenticated tambem
CREATE POLICY "auth_all_academias" ON scraped_academias FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_logs" ON scrape_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. FUNCAO: buscar academias com filtro
CREATE OR REPLACE FUNCTION buscar_academias(
  p_estado text DEFAULT NULL,
  p_termo text DEFAULT NULL,
  p_apenas_com_telefone boolean DEFAULT false,
  p_limit integer DEFAULT 1000,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  wellhub_id text,
  nome text,
  telefone text,
  endereco text,
  estado text,
  link text,
  scraped_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id, a.wellhub_id, a.nome, a.telefone, a.endereco, a.estado, a.link, a.scraped_at
  FROM scraped_academias a
  WHERE
    (p_estado IS NULL OR a.estado = p_estado)
    AND (p_termo IS NULL OR a.nome ILIKE '%' || p_termo || '%')
    AND (NOT p_apenas_com_telefone OR (a.telefone != '' AND a.telefone IS NOT NULL))
  ORDER BY a.estado, a.nome
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- 7. FUNCAO: estatisticas gerais
CREATE OR REPLACE FUNCTION stats_scraper()
RETURNS TABLE (
  total_academias bigint,
  total_com_telefone bigint,
  total_estados bigint,
  ultimo_scrape timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint,
    COUNT(CASE WHEN telefone != '' AND telefone IS NOT NULL THEN 1 END)::bigint,
    COUNT(DISTINCT estado)::bigint,
    MAX(scraped_at)
  FROM scraped_academias;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PRONTO! Agora va em Settings > API e copie:
-- - Project URL (ex: https://xxx.supabase.co)
-- - anon public key
-- Cole no scraper clicando em "Supabase" no header
-- ============================================================
