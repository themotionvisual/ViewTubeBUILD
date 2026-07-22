-- Cloud SQL PostgreSQL account schema. The account server applies the same
-- idempotent schema at startup; keep this file for controlled deployments.
CREATE TABLE IF NOT EXISTS viewtube_users (
  id TEXT PRIMARY KEY, email TEXT NOT NULL, display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS viewtube_users_email_key ON viewtube_users (LOWER(email));
CREATE TABLE IF NOT EXISTS viewtube_google_identities (
  google_subject TEXT PRIMARY KEY,
  viewtube_user_id TEXT NOT NULL REFERENCES viewtube_users(id) ON DELETE CASCADE,
  email TEXT NOT NULL, access_token_ciphertext TEXT, refresh_token_ciphertext TEXT,
  token_expires_at TIMESTAMPTZ, scopes TEXT[] NOT NULL DEFAULT '{}',
  channel_id TEXT, channel_title TEXT, channel_handle TEXT, channel_thumbnail TEXT,
  connection_status TEXT NOT NULL DEFAULT 'disconnected', updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS viewtube_sessions (
  token_hash TEXT PRIMARY KEY, viewtube_user_id TEXT NOT NULL REFERENCES viewtube_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), expires_at TIMESTAMPTZ NOT NULL, revoked_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS viewtube_oauth_states (
  state_hash TEXT PRIMARY KEY, code_verifier TEXT NOT NULL, nonce TEXT NOT NULL,
  intent TEXT NOT NULL, return_to TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), expires_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS viewtube_onboarding (
  viewtube_user_id TEXT PRIMARY KEY REFERENCES viewtube_users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started', next_step TEXT,
  context JSONB NOT NULL DEFAULT '{}', updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS viewtube_subscriptions (
  viewtube_user_id TEXT PRIMARY KEY REFERENCES viewtube_users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'inactive', plan_id TEXT, stripe_customer_id TEXT,
  stripe_subscription_id TEXT, last_verified_at TIMESTAMPTZ, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS viewtube_ai_credit_ledger (
  id TEXT PRIMARY KEY, viewtube_user_id TEXT NOT NULL REFERENCES viewtube_users(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL, delta_credits BIGINT NOT NULL, idempotency_key TEXT,
  metadata JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS viewtube_ai_credit_idempotency_key
  ON viewtube_ai_credit_ledger(viewtube_user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE TABLE IF NOT EXISTS viewtube_webhook_events (
  event_id TEXT PRIMARY KEY, event_type TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'processing',
  last_error TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
