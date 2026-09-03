-- Recherche texte performante sur les fiches (ILIKE) sous fort trafic.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "Business_name_trgm_idx"
  ON "Business" USING gin ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Business_type_trgm_idx"
  ON "Business" USING gin ("type" gin_trgm_ops);
