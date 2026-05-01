-- Supabase Schema for Painel Gestor Pro
-- This script sets up the tables and handles RLS policies safely.

-- 1. Enable RLS on all tables
-- 2. Create policies with DROP POLICY IF EXISTS to avoid duplicate errors.

-- Forms Table
CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'ativo',
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access for now" ON forms;
CREATE POLICY "Allow full access for now" ON forms FOR ALL USING (true);

-- Contributors Table
CREATE TABLE IF NOT EXISTS contributors (
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

DROP POLICY IF EXISTS "Allow full access for now" ON contributors;
CREATE POLICY "Allow full access for now" ON contributors FOR ALL USING (true);

-- Health Wallets Table
CREATE TABLE IF NOT EXISTS health_wallets (
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

DROP POLICY IF EXISTS "Allow full access for now" ON health_wallets;
CREATE POLICY "Allow full access for now" ON health_wallets FOR ALL USING (true);

-- Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_name TEXT NOT NULL,
  subject TEXT,
  priority TEXT,
  status TEXT DEFAULT 'pendente',
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access for now" ON complaints;
CREATE POLICY "Allow full access for now" ON complaints FOR ALL USING (true);

-- Production Records Table
CREATE TABLE IF NOT EXISTS production_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity TEXT NOT NULL,
  sector TEXT,
  officer TEXT,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'em_andamento',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE production_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access for now" ON production_records;
CREATE POLICY "Allow full access for now" ON production_records FOR ALL USING (true);

-- Settings Table (for dynamic lists)
CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY DEFAULT 'current',
  neighborhoods TEXT[],
  officers TEXT[],
  streets TEXT[],
  years TEXT[],
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access for now" ON app_settings;
CREATE POLICY "Allow full access for now" ON app_settings FOR ALL USING (true);


-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT UNIQUE,
  role TEXT,
  permissions TEXT[],
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access for now" ON users;
CREATE POLICY "Allow full access for now" ON users FOR ALL USING (true);


-- Printed Matter Table
CREATE TABLE IF NOT EXISTS printed_matter (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  size TEXT,
  type TEXT,
  date DATE,
  filename TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE printed_matter ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access for now" ON printed_matter;
CREATE POLICY "Allow full access for now" ON printed_matter FOR ALL USING (true);
