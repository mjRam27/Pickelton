-- Existing databases: run once after 004. Fresh databases get this from schema.sql.
-- Each tournament gets its own feed: posts linked to the tournament, with one post the host can pin.
-- Safe to run more than once.
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_posts_tournament_id_created_at ON posts(tournament_id, created_at DESC);
