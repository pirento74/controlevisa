-- Script para recriar as tabelas com a estrutura correta no Supabase.
-- ATENÇÃO: Isso apagará os dados das tabelas abaixo (exceto os usuários, que não estou apagando para você não perder o acesso).

-- Remove as políticas antes de apagar
DROP POLICY IF EXISTS "Allow full access for now" ON forms;
DROP POLICY IF EXISTS "Allow full access for now" ON contributors;
DROP POLICY IF EXISTS "Allow full access for now" ON health_wallets;
DROP POLICY IF EXISTS "Allow full access for now" ON complaints;
DROP POLICY IF EXISTS "Allow full access for now" ON production_records;
DROP POLICY IF EXISTS "Allow full access for now" ON app_settings;
DROP POLICY IF EXISTS "Allow full access for now" ON printed_matter;

-- Apaga as tabelas problemáticas
DROP TABLE IF EXISTS forms CASCADE;
DROP TABLE IF EXISTS contributors CASCADE;
DROP TABLE IF EXISTS health_wallets CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS production_records CASCADE;
DROP TABLE IF EXISTS app_settings CASCADE;
DROP TABLE IF EXISTS printed_matter CASCADE;

-- 1. Cria a Tabela Forms
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'ativo',
  upload TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access for now" ON forms FOR ALL USING (true);

-- 2. Cria a Tabela Contributors (Contribuintes)
CREATE TABLE contributors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  document TEXT,
  type TEXT,
  status TEXT,
  process_number TEXT,
  entry_date DATE,
  trade_name TEXT,
  activity TEXT,
  category TEXT,
  razao_social TEXT,
  cnpj TEXT,
  responsible TEXT,
  cpf TEXT,
  technical_responsible TEXT,
  technical_council TEXT,
  street TEXT,
  block TEXT,
  quadra TEXT,
  number TEXT,
  neighborhood TEXT,
  responsible_officers TEXT,
  previous_year TEXT,
  dam_issuance DATE,
  dam_value TEXT,
  license_number TEXT,
  license_issuance DATE,
  observation TEXT,
  contact TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE contributors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access for now" ON contributors FOR ALL USING (true);

-- 3. Cria a Tabela Health Wallets (Carteiras de Saúde)
CREATE TABLE health_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_name TEXT NOT NULL,
  rg TEXT,
  gender TEXT,
  birth_date DATE,
  category TEXT,
  expiration DATE,
  status TEXT DEFAULT 'ativo',
  workplace TEXT,
  role TEXT,
  street TEXT,
  neighborhood TEXT,
  issue_date DATE,
  exam_date DATE,
  contact TEXT,
  observation TEXT,
  upload TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE health_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access for now" ON health_wallets FOR ALL USING (true);

-- 4. Cria a Tabela Complaints (Reclamações)
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reclamante_name TEXT NOT NULL,
  reclamante_contact TEXT,
  reclamante_street TEXT,
  reclamante_number TEXT,
  reclamante_block TEXT,
  reclamante_quadra TEXT,
  reclamante_neighborhood TEXT,
  reclamado_name TEXT,
  reclamado_street TEXT,
  reclamado_number TEXT,
  reclamado_block TEXT,
  reclamado_quadra TEXT,
  reclamado_neighborhood TEXT,
  subject TEXT,
  priority TEXT,
  upload TEXT,
  status TEXT DEFAULT 'pendente',
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access for now" ON complaints FOR ALL USING (true);

-- 5. Cria a Tabela Production Records (Produção)
CREATE TABLE production_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity TEXT NOT NULL,
  sector TEXT,
  officer TEXT,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'em_andamento',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE production_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access for now" ON production_records FOR ALL USING (true);

-- 6. Cria a Tabela Settings (Configurações do App)
CREATE TABLE app_settings (
  id TEXT PRIMARY KEY DEFAULT 'current',
  neighborhoods TEXT[],
  officers TEXT[],
  streets TEXT[],
  functions TEXT[],
  activities TEXT[],
  years TEXT[],
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access for now" ON app_settings FOR ALL USING (true);

-- 7. Cria a Tabela Printed Matter (Impressos)
CREATE TABLE printed_matter (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  size TEXT,
  type TEXT,
  date DATE,
  filename TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE printed_matter ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access for now" ON printed_matter FOR ALL USING (true);
