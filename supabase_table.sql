-- Rodar no Supabase SQL Editor para criar a tabela

CREATE TABLE IF NOT EXISTS scraped_academias (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  wellhub_id    text NOT NULL,
  nome          text NOT NULL,
  telefone      text DEFAULT '',
  endereco      text DEFAULT '',
  estado        text DEFAULT '',
  cidade_busca  text DEFAULT '',
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

  UNIQUE(user_id, wellhub_id)
);

ALTER TABLE scraped_academias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scraped data"
  ON scraped_academias FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scraped data"
  ON scraped_academias FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scraped data"
  ON scraped_academias FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Permitir insert anonimo (para o scraper sem login)
CREATE POLICY "Allow anon insert"
  ON scraped_academias FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon select"
  ON scraped_academias FOR SELECT TO anon
  USING (true);

-- Index para busca rapida
CREATE INDEX IF NOT EXISTS idx_scraped_academias_estado ON scraped_academias(estado);
CREATE INDEX IF NOT EXISTS idx_scraped_academias_wellhub_id ON scraped_academias(wellhub_id);
