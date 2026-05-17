-- Source tracking for automatically imported agents
ALTER TABLE agents ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS github_stars integer;
-- Plain UNIQUE constraint (Postgres allows multiple NULLs by default)
-- so seed rows with NULL source_url coexist with imported rows.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'agents_source_url_uniq'
  ) THEN
    ALTER TABLE agents ADD CONSTRAINT agents_source_url_uniq UNIQUE (source_url);
  END IF;
END $$;
