-- Existing databases: run once after 005. Fresh databases get this from schema.sql.
-- Sign-in sessions (refresh tokens) move from Redis to Postgres so they survive a Redis restart or wipe.
-- Only a SHA-256 hash of each refresh token is stored. Safe to run more than once.
CREATE TABLE IF NOT EXISTS refresh_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    previous_token_hash VARCHAR(64),
    rotated_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refresh_sessions_user ON refresh_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_sessions_previous ON refresh_sessions(previous_token_hash);

-- Supabase: private to the backend (it connects as the table owner, which skips RLS).
ALTER TABLE refresh_sessions ENABLE ROW LEVEL SECURITY;
