-- Pickelton V1 core architecture migration.
-- Safe for existing Supabase data: adds columns/tables, backfills, and avoids destructive drops.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_status') THEN
        ALTER TYPE match_status ADD VALUE IF NOT EXISTS 'VOIDED';
        ALTER TYPE match_status ADD VALUE IF NOT EXISTS 'ARCHIVED';
    END IF;
END $$;

ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE clubs ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id);
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS logo_url VARCHAR(1000);
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE';

UPDATE clubs
SET owner_id = created_by
WHERE owner_id IS NULL;

UPDATE club_members cm
SET role = 'OWNER'
FROM clubs c
WHERE cm.club_id = c.id
  AND cm.user_id = c.owner_id
  AND cm.role <> 'OWNER';

INSERT INTO club_members (id, club_id, user_id, role, created_at, updated_at)
SELECT gen_random_uuid(), c.id, c.owner_id, 'OWNER', NOW(), NOW()
FROM clubs c
WHERE c.owner_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM club_members cm
      WHERE cm.club_id = c.id
        AND cm.user_id = c.owner_id
  );

ALTER TABLE club_members ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE club_members ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS end_date TIMESTAMP;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS banner_url VARCHAR(1000);

UPDATE tournaments SET status = 'DRAFT' WHERE status = 'UPCOMING';
UPDATE tournaments SET status = 'LIVE' WHERE status = 'ONGOING';
UPDATE tournaments SET status = 'COMPLETED' WHERE status = 'FINISHED';

ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_category VARCHAR(30) NOT NULL DEFAULT 'FRIENDLY';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS club_id UUID REFERENCES clubs(id);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS venue_name VARCHAR(255);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS venue_address VARCHAR(500);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS court_number VARCHAR(50);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

UPDATE matches m
SET match_category = 'TOURNAMENT'
WHERE EXISTS (
    SELECT 1
    FROM tournament_matches tm
    WHERE tm.match_id = m.id
);

UPDATE matches m
SET club_id = t.club_id
FROM tournament_matches tm
JOIN tournaments t ON t.id = tm.tournament_id
WHERE tm.match_id = m.id
  AND m.club_id IS NULL;

CREATE TABLE IF NOT EXISTS club_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    invited_user_id UUID NOT NULL REFERENCES users(id),
    invited_by UUID NOT NULL REFERENCES users(id),
    status VARCHAR(30) NOT NULL DEFAULT 'INVITED',
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    captain_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(160) NOT NULL,
    sport_type VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_team_member UNIQUE (team_id, user_id)
);

CREATE TABLE IF NOT EXISTS team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    invited_user_id UUID NOT NULL REFERENCES users(id),
    invited_by UUID NOT NULL REFERENCES users(id),
    status VARCHAR(30) NOT NULL DEFAULT 'INVITED',
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tournament_registration_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    version INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    created_by UUID NOT NULL REFERENCES users(id),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_tournament_form_version UNIQUE (tournament_id, version)
);

CREATE TABLE IF NOT EXISTS registration_form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES tournament_registration_forms(id) ON DELETE CASCADE,
    field_key VARCHAR(100) NOT NULL,
    label VARCHAR(160) NOT NULL,
    type VARCHAR(50) NOT NULL,
    placeholder VARCHAR(255),
    help_text VARCHAR(500),
    required BOOLEAN NOT NULL DEFAULT FALSE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL,
    default_value JSONB,
    validation_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    options JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_form_field_key UNIQUE (form_id, field_key)
);

ALTER TABLE registrations ADD COLUMN IF NOT EXISTS form_id UUID REFERENCES tournament_registration_forms(id);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

UPDATE registrations SET status = 'APPROVED' WHERE status = 'REGISTERED';
UPDATE registrations SET submitted_at = created_at WHERE submitted_at IS NULL;

CREATE TABLE IF NOT EXISTS registration_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES registration_form_fields(id) ON DELETE CASCADE,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_registration_answer_field UNIQUE (registration_id, field_id)
);

CREATE TABLE IF NOT EXISTS player_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sport_type VARCHAR(50) NOT NULL,
    matches_played INT NOT NULL DEFAULT 0,
    wins INT NOT NULL DEFAULT 0,
    losses INT NOT NULL DEFAULT 0,
    rating INT NOT NULL DEFAULT 1000,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    last_match_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_player_stats_user_sport UNIQUE (user_id, sport_type)
);

CREATE TABLE IF NOT EXISTS club_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    sport_type VARCHAR(50) NOT NULL,
    matches_played INT NOT NULL DEFAULT 0,
    wins INT NOT NULL DEFAULT 0,
    losses INT NOT NULL DEFAULT 0,
    club_rating INT NOT NULL DEFAULT 1000,
    active_players INT NOT NULL DEFAULT 0,
    tournament_wins INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_club_stats_club_sport UNIQUE (club_id, sport_type)
);

CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leaderboard_type VARCHAR(30) NOT NULL,
    sport_type VARCHAR(50) NOT NULL,
    scope_type VARCHAR(30) NOT NULL,
    scope_id UUID,
    rankings JSONB NOT NULL DEFAULT '[]'::jsonb,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clubs_owner_id ON clubs(owner_id);
CREATE INDEX IF NOT EXISTS idx_clubs_status ON clubs(status);
CREATE INDEX IF NOT EXISTS idx_club_members_status ON club_members(status);
CREATE INDEX IF NOT EXISTS idx_club_invitations_club_id ON club_invitations(club_id);
CREATE INDEX IF NOT EXISTS idx_club_invitations_invited_user_id ON club_invitations(invited_user_id);
CREATE INDEX IF NOT EXISTS idx_teams_captain_id ON teams(captain_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_invited_user_id ON team_invitations(invited_user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_forms_tournament_id ON tournament_registration_forms(tournament_id);
CREATE INDEX IF NOT EXISTS idx_registration_form_fields_form_id ON registration_form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_registration_answers_registration_id ON registration_answers(registration_id);
CREATE INDEX IF NOT EXISTS idx_matches_match_category ON matches(match_category);
CREATE INDEX IF NOT EXISTS idx_matches_club_id ON matches(club_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_rating ON player_stats(sport_type, rating DESC);
CREATE INDEX IF NOT EXISTS idx_club_stats_rating ON club_stats(sport_type, club_rating DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_snapshots_scope ON leaderboard_snapshots(leaderboard_type, sport_type, scope_type, generated_at DESC);
