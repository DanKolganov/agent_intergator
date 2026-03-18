-- LLM usage gating (2 free requests)
CREATE TABLE IF NOT EXISTS llm_usage (
  id serial PRIMARY KEY,
  subject_id varchar NOT NULL,
  count integer NOT NULL DEFAULT 0,
  period_start timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS llm_usage_subject_uniq ON llm_usage(subject_id);

