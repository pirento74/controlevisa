-- Execute este script no SQL Editor do Supabase para atualizar a tabela de forms

ALTER TABLE forms
  ADD COLUMN IF NOT EXISTS upload TEXT;
