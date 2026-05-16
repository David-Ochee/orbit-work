-- OrbitWork — PostgreSQL schema
-- Run: psql $DATABASE_URL -f database/schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username              TEXT UNIQUE NOT NULL,
  email                 TEXT UNIQUE,
  avatar_url            TEXT,
  bio                   TEXT,
  stellar_address       TEXT UNIQUE,
  github_id             TEXT UNIQUE,
  passkey_credential_id TEXT UNIQUE,
  passkey_public_key    TEXT,
  passkey_counter       INTEGER DEFAULT 0,
  credits               INTEGER NOT NULL DEFAULT 5,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Bounties ─────────────────────────────────────────────────────────────────
CREATE TYPE bounty_status   AS ENUM ('open','in_progress','completed','cancelled');
CREATE TYPE bounty_category AS ENUM ('code','design','writing','research','marketing','community');
CREATE TYPE claim_type      AS ENUM ('first_come','competitive','curated');
CREATE TYPE currency        AS ENUM ('XLM','USDC');

CREATE TABLE IF NOT EXISTS bounties (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  reward          NUMERIC(20,7) NOT NULL,
  currency        currency NOT NULL DEFAULT 'XLM',
  status          bounty_status NOT NULL DEFAULT 'open',
  category        bounty_category NOT NULL,
  claim_type      claim_type NOT NULL DEFAULT 'competitive',
  sponsor_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  escrow_tx_hash  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bounties_status   ON bounties(status);
CREATE INDEX IF NOT EXISTS idx_bounties_category ON bounties(category);
CREATE INDEX IF NOT EXISTS idx_bounties_sponsor  ON bounties(sponsor_id);

-- ─── Applications ─────────────────────────────────────────────────────────────
CREATE TYPE application_status AS ENUM ('pending','accepted','rejected','withdrawn');

CREATE TABLE IF NOT EXISTS applications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id    UUID NOT NULL REFERENCES bounties(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  proposal     TEXT NOT NULL,
  status       application_status NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (bounty_id, applicant_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_bounty    ON applications(bounty_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_id);

-- ─── Reputation ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reputation_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bounty_id  UUID REFERENCES bounties(id) ON DELETE SET NULL,
  delta      INTEGER NOT NULL,
  reason     TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Refresh tokens ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
