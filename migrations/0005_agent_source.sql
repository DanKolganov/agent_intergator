-- Source tracking for automatically imported agents
ALTER TABLE agents ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS github_stars integer;
CREATE UNIQUE INDEX IF NOT EXISTS agents_source_url_uniq ON agents (source_url) WHERE source_url IS NOT NULL;
