-- Durable Phase 6 Brain intelligence persistence.
-- Production uses the existing ViewTube PostgreSQL DATABASE_URL.

CREATE TABLE IF NOT EXISTS viewtube_brain_intelligence_events (
  viewtube_user_id TEXT NOT NULL REFERENCES viewtube_users(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (viewtube_user_id, channel_id, event_id)
);

CREATE INDEX IF NOT EXISTS viewtube_brain_intelligence_events_channel_idx
  ON viewtube_brain_intelligence_events(viewtube_user_id, channel_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS viewtube_brain_lifecycle_observations (
  viewtube_user_id TEXT NOT NULL REFERENCES viewtube_users(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  observation_key TEXT NOT NULL,
  observation JSONB NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (viewtube_user_id, channel_id, observation_key)
);

CREATE INDEX IF NOT EXISTS viewtube_brain_lifecycle_observations_channel_idx
  ON viewtube_brain_lifecycle_observations(viewtube_user_id, channel_id, observed_at DESC);
