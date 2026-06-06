-- Safe incremental migration for the normalized Pickelton match system.
-- Run once in Supabase SQL editor. It creates new structures and backfills data.
-- It intentionally does NOT drop legacy match columns or score_history.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
    IF to_regclass('public.host_applications') IS NOT NULL
       AND to_regclass('public.host_verifications') IS NULL THEN
        ALTER TABLE host_applications RENAME TO host_verifications;
    END IF;
END $$;

DO $$
BEGIN
    CREATE TYPE match_status AS ENUM ('CREATED', 'INVITED', 'ACCEPTED', 'SCHEDULED', 'IN_PROGRESS', 'LIVE', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE participant_role AS ENUM ('PLAYER', 'SCORER', 'REFEREE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE invitation_status AS ENUM ('INVITED', 'ACCEPTED', 'DECLINED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE score_event_type AS ENUM ('POINT', 'UNDO', 'END_SET', 'END_MATCH');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE match_type AS ENUM ('SINGLES', 'DOUBLES', 'TEAM');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE sport_type AS ENUM ('PICKLEBALL', 'BADMINTON', 'BOTH');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE matches ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS sport sport_type NOT NULL DEFAULT 'PICKLEBALL';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_type match_type NOT NULL DEFAULT 'SINGLES';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS rules JSONB NOT NULL DEFAULT '{"pointsPerSet":21,"bestOfSets":3}'::jsonb;

UPDATE matches m
SET created_by = t.created_by
FROM tournaments t
WHERE m.tournament_id = t.id
  AND m.created_by IS NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM matches WHERE created_by IS NULL) THEN
        RAISE EXCEPTION 'Cannot migrate matches: created_by could not be backfilled for every row';
    END IF;
END $$;

ALTER TABLE matches ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE matches ALTER COLUMN tournament_id DROP NOT NULL;
ALTER TABLE matches ALTER COLUMN player1_id DROP NOT NULL;
ALTER TABLE matches ALTER COLUMN player2_id DROP NOT NULL;

ALTER TABLE matches
    ALTER COLUMN status TYPE match_status
    USING status::match_status;

CREATE TABLE IF NOT EXISTS match_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    team_code VARCHAR(20),
    role participant_role NOT NULL,
    invitation_status invitation_status NOT NULL DEFAULT 'INVITED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_match_participant_role UNIQUE (match_id, user_id, role)
);

ALTER TABLE match_participants ADD COLUMN IF NOT EXISTS team_code VARCHAR(20);
ALTER TABLE match_participants ADD COLUMN IF NOT EXISTS invitation_status invitation_status NOT NULL DEFAULT 'INVITED';
ALTER TABLE match_participants ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE match_participants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'match_participants'
          AND column_name = 'status'
    ) THEN
        UPDATE match_participants
        SET invitation_status = COALESCE(status::text, 'INVITED')::invitation_status
        WHERE invitation_status IS NULL;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS match_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
    current_score JSONB NOT NULL DEFAULT '{"A":0,"B":0}'::jsonb,
    current_set INT NOT NULL DEFAULT 1,
    set_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
    live_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    revision BIGINT NOT NULL DEFAULT 0,
    last_event_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE match_state ADD COLUMN IF NOT EXISTS current_score JSONB NOT NULL DEFAULT '{"A":0,"B":0}'::jsonb;
ALTER TABLE match_state ADD COLUMN IF NOT EXISTS current_set INT NOT NULL DEFAULT 1;
ALTER TABLE match_state ADD COLUMN IF NOT EXISTS set_summary JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE match_state ADD COLUMN IF NOT EXISTS live_state JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE match_state ADD COLUMN IF NOT EXISTS revision BIGINT NOT NULL DEFAULT 0;
ALTER TABLE match_state ADD COLUMN IF NOT EXISTS last_event_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE match_state ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE match_state ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS score_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    actor_user_id UUID REFERENCES users(id),
    event_type score_event_type NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    sequence_number BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_score_event_sequence UNIQUE (match_id, sequence_number)
);

ALTER TABLE score_events ADD COLUMN IF NOT EXISTS actor_user_id UUID REFERENCES users(id);
ALTER TABLE score_events ADD COLUMN IF NOT EXISTS payload JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE score_events ADD COLUMN IF NOT EXISTS sequence_number BIGINT;
ALTER TABLE score_events ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE score_events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS tournament_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    match_id UUID NOT NULL UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
    round VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS round VARCHAR(50);
ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE posts ADD COLUMN IF NOT EXISTS metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

INSERT INTO tournament_matches (tournament_id, match_id, round, created_at, updated_at)
SELECT tournament_id, id, round, created_at, updated_at
FROM matches
WHERE tournament_id IS NOT NULL
ON CONFLICT (match_id) DO NOTHING;

INSERT INTO match_participants (match_id, user_id, team_code, role, invitation_status, created_at, updated_at)
SELECT id, player1_id, 'A', 'PLAYER', 'ACCEPTED', created_at, updated_at
FROM matches
WHERE player1_id IS NOT NULL
ON CONFLICT (match_id, user_id, role) DO NOTHING;

INSERT INTO match_participants (match_id, user_id, team_code, role, invitation_status, created_at, updated_at)
SELECT id, player2_id, 'B', 'PLAYER', 'ACCEPTED', created_at, updated_at
FROM matches
WHERE player2_id IS NOT NULL
ON CONFLICT (match_id, user_id, role) DO NOTHING;

INSERT INTO match_state (match_id, current_score, current_set, set_summary, live_state, revision, last_event_at, created_at, updated_at)
SELECT id,
       jsonb_build_object('A', COALESCE(score1, 0), 'B', COALESCE(score2, 0)),
       1,
       '[]'::jsonb,
       jsonb_build_object('status', status::text),
       0,
       updated_at,
       created_at,
       updated_at
FROM matches
ON CONFLICT (match_id) DO NOTHING;

INSERT INTO score_events (match_id, actor_user_id, event_type, payload, sequence_number, created_at, updated_at)
SELECT sh.match_id,
       sh.updated_by,
       'POINT',
       jsonb_build_object(
           'team', CASE WHEN sh.player_id = m.player1_id THEN 'A' ELSE 'B' END,
           'oldScore', sh.old_score,
           'newScore', sh.new_score,
           'delta', GREATEST(sh.new_score - sh.old_score, 1)
       ),
       ROW_NUMBER() OVER (PARTITION BY sh.match_id ORDER BY sh.created_at, sh.id),
       sh.created_at,
       sh.updated_at
FROM score_history sh
JOIN matches m ON m.id = sh.match_id
ON CONFLICT (match_id, sequence_number) DO NOTHING;

UPDATE match_state ms
SET revision = event_counts.event_count,
    last_event_at = GREATEST(ms.last_event_at, event_counts.last_event_at)
FROM (
    SELECT match_id, COUNT(*) AS event_count, MAX(created_at) AS last_event_at
    FROM score_events
    GROUP BY match_id
) event_counts
WHERE ms.match_id = event_counts.match_id;

CREATE INDEX IF NOT EXISTS idx_match_participants_match_id ON match_participants(match_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_user_id ON match_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_match_state_match_id ON match_state(match_id);
CREATE INDEX IF NOT EXISTS idx_score_events_match_id_seq ON score_events(match_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_tournament_id ON tournament_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_posts_club_id_created_at ON posts(club_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);

-- Validation queries. They should return zero rows.
-- SELECT id FROM matches m WHERE NOT EXISTS (SELECT 1 FROM match_state ms WHERE ms.match_id = m.id);
-- SELECT id FROM matches m WHERE player1_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM match_participants p WHERE p.match_id = m.id AND p.user_id = m.player1_id AND p.role = 'PLAYER');
-- SELECT id FROM matches m WHERE player2_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM match_participants p WHERE p.match_id = m.id AND p.user_id = m.player2_id AND p.role = 'PLAYER');
-- SELECT match_id, sequence_number, COUNT(*) FROM score_events GROUP BY match_id, sequence_number HAVING COUNT(*) > 1;
