-- Initial schema migration generated from shared/schema.ts

-- extension for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- users table (Replit Auth)
CREATE TABLE IF NOT EXISTS users (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar UNIQUE,
  first_name varchar,
  last_name varchar,
  profile_image_url varchar,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- sessions table (connect-pg-simple)
CREATE TABLE IF NOT EXISTS sessions (
  sid varchar PRIMARY KEY,
  sess jsonb NOT NULL,
  expire timestamp NOT NULL
);
CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire);

-- agents
CREATE TABLE IF NOT EXISTS agents (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  industry text NOT NULL,
  use_case text NOT NULL,
  tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  image_url text,
  is_team_solution boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- custom_agent_requests
CREATE TABLE IF NOT EXISTS custom_agent_requests (
  id serial PRIMARY KEY,
  business_name text NOT NULL,
  business_needs text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  recommendation text,
  generated_code text,
  generated_readme text,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- view_history
CREATE TABLE IF NOT EXISTS view_history (
  id serial PRIMARY KEY,
  user_id varchar NOT NULL,
  agent_id integer NOT NULL,
  viewed_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
