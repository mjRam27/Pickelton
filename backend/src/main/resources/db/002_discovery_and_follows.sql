-- Existing databases: run once after schema.sql. Fresh databases get this from schema.sql.
-- Adds club coordinates (nearby-club search) and player follows.
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

CREATE TABLE IF NOT EXISTS user_follows (
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, followed_id),
    CONSTRAINT chk_user_follow_not_self CHECK (follower_id <> followed_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_followed ON user_follows(followed_id);
CREATE INDEX IF NOT EXISTS idx_clubs_coordinates ON clubs(latitude, longitude);
