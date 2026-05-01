-- Execute este script no SQL Editor do Supabase para atualizar a tabela de registros de produção

ALTER TABLE production_records
  DROP COLUMN IF EXISTS sector,
  ADD COLUMN IF NOT EXISTS quantity TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS observation TEXT,
  ADD COLUMN IF NOT EXISTS upload TEXT;
