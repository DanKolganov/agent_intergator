-- Knowledge base for solution search (Supabase/Postgres)
CREATE TABLE IF NOT EXISTS knowledge_base (
  id serial PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  source_url text,
  tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Optional de-dupe key for automated imports (when source_url is known)
CREATE UNIQUE INDEX IF NOT EXISTS knowledge_base_source_url_title_uniq
  ON knowledge_base (source_url, title)
  WHERE source_url IS NOT NULL;

-- Basic full-text index for RU/EN mixed content (simple config)
CREATE INDEX IF NOT EXISTS knowledge_base_fts_idx
  ON knowledge_base USING GIN (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(content,'')));

CREATE INDEX IF NOT EXISTS knowledge_base_tags_idx
  ON knowledge_base USING GIN (tags);

