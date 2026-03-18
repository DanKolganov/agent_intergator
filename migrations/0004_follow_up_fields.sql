-- Add follow-up tracking fields to custom_agent_requests
ALTER TABLE custom_agent_requests
ADD COLUMN IF NOT EXISTS follow_up_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS context_data TEXT,
ADD COLUMN IF NOT EXISTS last_question TEXT;
