-- Apply once in the Supabase SQL editor before starting the refactored backend.
-- PostgreSQL remains the source of truth. Redis stores expiring live-state snapshots only.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
    IF to_regclass('public.host_verifications') IS NOT NULL
       AND to_regclass('public.host_applications') IS NULL THEN
        ALTER TABLE host_verifications RENAME TO host_applications;
    END IF;
END $$;

ALTER TABLE matches ADD COLUMN IF NOT EXISTS rules JSONB NOT NULL DEFAULT '{"pointsPerSet":21,"bestOfSets":3}'::jsonb;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS venue VARCHAR(255);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS tournament_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    match_id UUID NOT NULL UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
    display_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    team_code VARCHAR(10),
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'INVITED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_match_participant_role UNIQUE (match_id, user_id, role)
);

CREATE TABLE IF NOT EXISTS match_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
    scores JSONB NOT NULL DEFAULT '{"A":0,"B":0}'::jsonb,
    sets JSONB NOT NULL DEFAULT '[]'::jsonb,
    revision BIGINT NOT NULL DEFAULT 0,
    last_event_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS score_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    actor_user_id UUID REFERENCES users(id),
    event_type VARCHAR(30) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    sequence_number BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_score_event_sequence UNIQUE (match_id, sequence_number)
);

CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_user_id UUID NOT NULL REFERENCES users(id),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    event_types JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO tournament_matches (tournament_id, match_id, display_order)
SELECT tournament_id, id, ROW_NUMBER() OVER (PARTITION BY tournament_id ORDER BY created_at, id)
FROM matches
WHERE tournament_id IS NOT NULL
ON CONFLICT (match_id) DO NOTHING;

INSERT INTO match_participants (match_id, user_id, team_code, role, status)
SELECT id, player1_id, 'A', 'PLAYER', 'ACCEPTED'
FROM matches
WHERE player1_id IS NOT NULL
ON CONFLICT (match_id, user_id, role) DO NOTHING;

INSERT INTO match_participants (match_id, user_id, team_code, role, status)
SELECT id, player2_id, 'B', 'PLAYER', 'ACCEPTED'
FROM matches
WHERE player2_id IS NOT NULL
ON CONFLICT (match_id, user_id, role) DO NOTHING;

INSERT INTO match_state (match_id, scores, sets, revision, last_event_at)
SELECT id, jsonb_build_object('A', COALESCE(score1, 0), 'B', COALESCE(score2, 0)), '[]'::jsonb, 0, updated_at
FROM matches
ON CONFLICT (match_id) DO NOTHING;

DO $$
BEGIN
    IF to_regclass('public.score_history') IS NOT NULL THEN
        INSERT INTO score_events (match_id, actor_user_id, event_type, payload, sequence_number, created_at, updated_at)
        SELECT match_id, updated_by, 'SCORE_UPDATED',
               jsonb_build_object('teamCode',
                   CASE WHEN player_id = m.player1_id THEN 'A' ELSE 'B' END,
                   'oldScore', old_score, 'newScore', new_score),
               ROW_NUMBER() OVER (PARTITION BY match_id ORDER BY sh.created_at, sh.id),
               sh.created_at, sh.updated_at
        FROM score_history sh
        JOIN matches m ON m.id = sh.match_id
        ON CONFLICT (match_id, sequence_number) DO NOTHING;
    END IF;
END $$;

UPDATE match_state ms
SET revision = event_counts.event_count,
    last_event_at = GREATEST(ms.last_event_at, event_counts.last_event_at)
FROM (
    SELECT match_id, COUNT(*) AS event_count, MAX(created_at) AS last_event_at
    FROM score_events
    GROUP BY match_id
) event_counts
WHERE ms.match_id = event_counts.match_id;

DROP TABLE IF EXISTS score_history;

ALTER TABLE matches DROP CONSTRAINT IF EXISTS chk_match_players_different;
ALTER TABLE matches DROP COLUMN IF EXISTS tournament_id;
ALTER TABLE matches DROP COLUMN IF EXISTS player1_id;
ALTER TABLE matches DROP COLUMN IF EXISTS player2_id;
ALTER TABLE matches DROP COLUMN IF EXISTS score1;
ALTER TABLE matches DROP COLUMN IF EXISTS score2;

CREATE INDEX IF NOT EXISTS idx_tournament_matches_tournament_id ON tournament_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_match_id ON match_participants(match_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_user_id ON match_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_match_state_match_id ON match_state(match_id);
CREATE INDEX IF NOT EXISTS idx_score_events_match_id ON score_events(match_id);
CREATE INDEX IF NOT EXISTS idx_posts_club_id_created_at ON posts(club_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_user_id ON posts(author_user_id);
