-- Execute este script no SQL Editor do Supabase para atualizar a tabela de app_settings

ALTER TABLE app_settings
  ADD COLUMN IF NOT EXISTS functions TEXT[],
  ADD COLUMN IF NOT EXISTS activities TEXT[];
