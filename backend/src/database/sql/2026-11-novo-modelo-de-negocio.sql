-- 2026-11-novo-modelo-de-negocio.sql
-- ====================================
-- Ajustes de banco do novo modelo de negócio (mentor voluntário, agenda de
-- mentorias e conversa direta do mentor).
--
-- QUANDO RODAR: só se a API NÃO estiver rodando com NODE_ENV=development.
-- Em desenvolvimento o TypeORM (synchronize) cria tudo isso sozinho. Em produção
-- (Supabase), rode este arquivo UMA vez no SQL Editor ANTES de subir a nova versão
-- da API. O script pode ser rodado mais de uma vez sem dar erro.

-- 1) Mentor: novos campos do perfil (duração, mentorias por mês e modalidade) -----
DO $$ BEGIN
  CREATE TYPE mentor_modalidade_enum AS ENUM ('presencial', 'hibrido', 'remoto');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE mentor ADD COLUMN IF NOT EXISTS duracao_minutos integer NOT NULL DEFAULT 60;
ALTER TABLE mentor ADD COLUMN IF NOT EXISTS mentorias_por_mes integer NOT NULL DEFAULT 4;
ALTER TABLE mentor ADD COLUMN IF NOT EXISTS modalidade mentor_modalidade_enum NOT NULL DEFAULT 'remoto';

-- 2) Mentor não paga mais assinatura: remove a coluna do plano ----------------
ALTER TABLE mentor DROP COLUMN IF EXISTS plano_assinatura;
DROP TYPE IF EXISTS mentor_plano_assinatura_enum;

-- 3) Mentorias agendadas ------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE mentoria_status_enum AS ENUM ('pendente', 'aceita', 'recusada', 'realizada', 'cancelada');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS mentoria (
  id                  SERIAL PRIMARY KEY,
  mentor_id           integer NOT NULL REFERENCES mentor(id) ON DELETE CASCADE,
  startup_id          integer NOT NULL REFERENCES startup(id) ON DELETE CASCADE,
  data_hora           timestamptz NOT NULL,
  tema                varchar NOT NULL,
  mensagem            text NOT NULL DEFAULT '',
  status              mentoria_status_enum NOT NULL DEFAULT 'pendente',
  codigo_certificado  varchar UNIQUE,
  realizada_em        timestamptz,
  criado_em           timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mentoria_mentor_data ON mentoria (mentor_id, data_hora);

-- 4) Conversa direta do mentor (sem match) ------------------------------------
ALTER TABLE conversa ALTER COLUMN match_id DROP NOT NULL;
ALTER TABLE conversa ADD COLUMN IF NOT EXISTS mentor_usuario_id integer;
ALTER TABLE conversa ADD COLUMN IF NOT EXISTS contraparte_usuario_id integer;
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversa_mentor_contraparte
  ON conversa (mentor_usuario_id, contraparte_usuario_id);
