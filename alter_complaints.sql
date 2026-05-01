-- Execute este script no SQL Editor do Supabase para atualizar a tabela de reclamações

ALTER TABLE complaints RENAME COLUMN reporter_name TO reclamante_name;

ALTER TABLE complaints
  ADD COLUMN reclamante_contact TEXT,
  ADD COLUMN reclamante_street TEXT,
  ADD COLUMN reclamante_number TEXT,
  ADD COLUMN reclamante_block TEXT,
  ADD COLUMN reclamante_quadra TEXT,
  ADD COLUMN reclamante_neighborhood TEXT,
  ADD COLUMN reclamado_name TEXT,
  ADD COLUMN reclamado_street TEXT,
  ADD COLUMN reclamado_number TEXT,
  ADD COLUMN reclamado_block TEXT,
  ADD COLUMN reclamado_quadra TEXT,
  ADD COLUMN reclamado_neighborhood TEXT,
  ADD COLUMN upload TEXT;
