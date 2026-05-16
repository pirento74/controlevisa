import { pool } from './db.ts';

const createTablesText = `
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50),
  password VARCHAR(255),
  permissions JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50),
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
  observation TEXT,
  contact VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaints (
   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
   reporter_name VARCHAR(255),
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
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_records (
   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
   activity VARCHAR(255),
   sector TEXT,
   officer VARCHAR(255),
   date VARCHAR(50),
   status VARCHAR(50),
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS printed_matter (
   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
   name VARCHAR(255),
   size VARCHAR(50),
   type VARCHAR(255),
   date VARCHAR(50),
   filename VARCHAR(255),
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gestao_de_dados (
   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
   neighborhoods JSONB,
   officers JSONB,
   streets JSONB,
   functions JSONB,
   activities JSONB,
   years JSONB,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

export async function initDb() {
  try {
    await pool.query(createTablesText);
    console.log("Banco de dados sincronizado e tabelas criadas!");
  } catch (err) {
    console.error("Erro ao inicializar o banco de dados:", err);
  }
}
