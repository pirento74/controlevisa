-- Arquivo SQL para configuração no DBeaver / PostgreSQL local
-- Este script irá criar todas as tabelas necessárias para o sistema de Controle da VISA.

-- Extensão recomendada para o uso de UUIDs (opcional em versões mais recentes onde gen_random_uuid() é nativo)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Usuários (Users)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50),
  password VARCHAR(255),
  permissions JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Formulários (Forms)
CREATE TABLE IF NOT EXISTS forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50),
  date DATE,
  upload VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Gestão de Contribuintes (Contributors)
CREATE TABLE IF NOT EXISTS contributors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  document VARCHAR(255),
  type VARCHAR(50),
  status VARCHAR(50),
  process_number VARCHAR(100),
  entry_date VARCHAR(50),
  trade_name VARCHAR(255),
  activity VARCHAR(255),
  category VARCHAR(255),
  razao_social VARCHAR(255),
  cnpj VARCHAR(50),
  responsible VARCHAR(255),
  cpf VARCHAR(50),
  rg VARCHAR(50),
  ssp VARCHAR(50),
  phone VARCHAR(50),
  cep VARCHAR(20),
  house_number VARCHAR(50),
  complement VARCHAR(255),
  neighborhood VARCHAR(255),
  street VARCHAR(255),
  function VARCHAR(255),
  technical_responsible VARCHAR(255),
  technical_council VARCHAR(255),
  block VARCHAR(50),
  quadra VARCHAR(50),
  number VARCHAR(50),
  responsible_officers VARCHAR(255),
  previous_year VARCHAR(50),
  dam_issuance VARCHAR(50),
  dam_value VARCHAR(50),
  license_number VARCHAR(100),
  license_issuance VARCHAR(50),
  license_validity VARCHAR(50),
  observation TEXT,
  contact VARCHAR(100),
  upload VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Carteiras de Saúde (Health Wallets)
CREATE TABLE IF NOT EXISTS health_wallets (
   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
   patient_name VARCHAR(255) NOT NULL,
   gender VARCHAR(50),
   birth_date VARCHAR(50),
   category VARCHAR(255),
   expiration VARCHAR(50),
   status VARCHAR(50),
   street VARCHAR(255),
   rg VARCHAR(50),
   cpf VARCHAR(50),
   blood_type VARCHAR(10),
   health_center VARCHAR(255),
   address VARCHAR(255),
   city VARCHAR(255),
   phone VARCHAR(50),
   photo VARCHAR(255),
   workplace VARCHAR(255),
   role VARCHAR(255),
   neighborhood VARCHAR(255),
   house_number VARCHAR(50),
   upload VARCHAR(255),
   issue_date VARCHAR(50),
   exam_date VARCHAR(50),
   contact VARCHAR(100),
   observation TEXT,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela de Central de Reclamações (Complaints)
CREATE TABLE IF NOT EXISTS complaints (
   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
   reclamante_name VARCHAR(255),
   reclamante_contact VARCHAR(255),
   reclamante_street VARCHAR(255),
   reclamante_number VARCHAR(50),
   reclamante_block VARCHAR(50),
   reclamante_quadra VARCHAR(50),
   reclamante_neighborhood VARCHAR(255),
   reclamado_name VARCHAR(255),
   reclamado_street VARCHAR(255),
   reclamado_number VARCHAR(50),
   reclamado_block VARCHAR(50),
   reclamado_quadra VARCHAR(50),
   reclamado_neighborhood VARCHAR(255),
   subject TEXT,
   priority VARCHAR(50),
   status VARCHAR(50),
   date VARCHAR(50),
   neighborhood VARCHAR(255),
   street VARCHAR(255),
   address_number VARCHAR(50),
   complement VARCHAR(255),
   description TEXT,
   inspection_officer VARCHAR(255),
   evidence_photo VARCHAR(255),
   upload VARCHAR(255),
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela de Controle de Produção (Production Records)
CREATE TABLE IF NOT EXISTS production_records (
   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
   activity VARCHAR(255),
   officer VARCHAR(255),
   date VARCHAR(50),
   status VARCHAR(50),
   quantity TEXT,
   location TEXT,
   neighborhood TEXT,
   observation TEXT,
   upload TEXT,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabela de Impressos (Printed Matter)
CREATE TABLE IF NOT EXISTS printed_matter (
   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
   name VARCHAR(255),
   size VARCHAR(50),
   type VARCHAR(255),
   date VARCHAR(50),
   filename VARCHAR(255),
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabela de Configurações e Dados Estáticos do App (Gestão de Dados)
CREATE TABLE IF NOT EXISTS gestao_de_dados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  neighborhoods JSONB DEFAULT '[]'::jsonb,
  officers JSONB DEFAULT '[]'::jsonb,
  streets JSONB DEFAULT '[]'::jsonb,
  years JSONB DEFAULT '[]'::jsonb,
  functions JSONB DEFAULT '[]'::jsonb,
  activities JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir os registros padrões se ainda não existirem:
INSERT INTO gestao_de_dados (neighborhoods)
SELECT '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM gestao_de_dados);

-- Inserir um administrador inicial (a senha é "123456" em hash bcrypt como exemplo, você pode gerar a sua através do app)
-- INSERT INTO users (name, email, role, password, permissions)
-- VALUES ('Administrador', 'admin@example.com', 'admin', '$2b$10$0k4zD5Q2PzzO8TqL8XU6.eTf2h3YcR.jY9ZlZ3D4tRb8i9S9L./6K', '["dashboard","contribuintes","saude","reclamacoes","producao","impressos","users","dados","forms"]');

