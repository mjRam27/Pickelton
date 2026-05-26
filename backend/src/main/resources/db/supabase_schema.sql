CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL DEFAULT DATE '1970-01-01',
    phone_number VARCHAR(32) NOT NULL UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    auth_provider VARCHAR(30) NOT NULL DEFAULT 'LOCAL',
    google_subject VARCHAR(255) UNIQUE,
    bio VARCHAR(280),
    avatar_url VARCHAR(1000),
    city VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL DEFAULT '',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS club_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    club_id UUID NOT NULL REFERENCES clubs(id),
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_club_member UNIQUE (club_id, user_id)
);

CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sport_type VARCHAR(50) NOT NULL,
    tournament_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING',
    created_by UUID NOT NULL REFERENCES users(id),
    club_id UUID REFERENCES clubs(id),
    entry_fee NUMERIC(12, 2),
    max_players INT NOT NULL DEFAULT 32,
    start_date TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS host_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    full_name VARCHAR(160) NOT NULL,
    date_of_birth DATE NOT NULL,
    phone_number VARCHAR(32) NOT NULL,
    country_code VARCHAR(2) NOT NULL DEFAULT 'IN',
    address_line1 VARCHAR(180) NOT NULL,
    address_line2 VARCHAR(180),
    city VARCHAR(100) NOT NULL,
    state_region VARCHAR(100),
    postal_code VARCHAR(32) NOT NULL,
    id_document_type VARCHAR(40) NOT NULL,
    id_document_country VARCHAR(2) NOT NULL DEFAULT 'IN',
    id_document_number_last4 VARCHAR(4) NOT NULL,
    document_image_url VARCHAR(1000) NOT NULL,
    selfie_with_document_url VARCHAR(1000) NOT NULL,
    terms_accepted BOOLEAN NOT NULL,
    data_processing_consent BOOLEAN NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'PENDING_REVIEW',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    risk_score NUMERIC(5, 2),
    metadata_json TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    tournament_id UUID NOT NULL REFERENCES tournaments(id),
    status VARCHAR(20) NOT NULL DEFAULT 'REGISTERED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_registration UNIQUE (user_id, tournament_id)
);

CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES tournaments(id),
    player1_id UUID NOT NULL REFERENCES users(id),
    player2_id UUID NOT NULL REFERENCES users(id),
    mode VARCHAR(20) NOT NULL DEFAULT 'TOURNAMENT',
    game_type VARCHAR(20) NOT NULL DEFAULT 'SINGLES',
    scorekeeper_id UUID REFERENCES users(id),
    points_to_win INT NOT NULL DEFAULT 11,
    best_of INT NOT NULL DEFAULT 1,
    win_by_two BOOLEAN NOT NULL DEFAULT TRUE,
    score1 INT NOT NULL DEFAULT 0,
    score2 INT NOT NULL DEFAULT 0,
    winner_id UUID REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    round VARCHAR(50) NOT NULL DEFAULT 'Round 1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_match_players_different CHECK (player1_id <> player2_id),
    CONSTRAINT chk_match_points_to_win_min CHECK (points_to_win >= 11),
    CONSTRAINT chk_match_best_of_allowed CHECK (best_of IN (1, 3, 5)),
    CONSTRAINT chk_match_mode_allowed CHECK (mode IN ('CASUAL', 'TOURNAMENT')),
    CONSTRAINT chk_match_game_type_allowed CHECK (game_type IN ('SINGLES', 'DOUBLES'))
);

CREATE TABLE IF NOT EXISTS match_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id),
    team_no INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_match_team UNIQUE (match_id, team_no),
    CONSTRAINT chk_match_team_no_allowed CHECK (team_no IN (1, 2))
);

CREATE TABLE IF NOT EXISTS match_team_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES match_teams(id),
    user_id UUID NOT NULL REFERENCES users(id),
    slot_no INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_match_team_player UNIQUE (team_id, user_id),
    CONSTRAINT uk_match_team_slot UNIQUE (team_id, slot_no)
);

CREATE TABLE IF NOT EXISTS score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id),
    player_id UUID NOT NULL REFERENCES users(id),
    old_score INT NOT NULL,
    new_score INT NOT NULL,
    updated_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'host_verifications' AND column_name = 'legal_name'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'host_verifications' AND column_name = 'full_name'
    ) THEN
        ALTER TABLE host_verifications RENAME COLUMN legal_name TO full_name;
    END IF;
END $$;

ALTER TABLE clubs ADD COLUMN IF NOT EXISTS location VARCHAR(255) NOT NULL DEFAULT '';

ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(32);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(30) NOT NULL DEFAULT 'LOCAL';
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_subject VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(280);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(1000);
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);

UPDATE users SET date_of_birth = DATE '1970-01-01' WHERE date_of_birth IS NULL;
UPDATE users SET phone_number = '+1000' || replace(id::text, '-', '') WHERE phone_number IS NULL OR phone_number = '';

ALTER TABLE users ALTER COLUMN date_of_birth SET NOT NULL;
ALTER TABLE users ALTER COLUMN phone_number SET NOT NULL;

ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS entry_fee NUMERIC(12, 2);
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS start_date TIMESTAMP;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tournaments' AND column_name = 'type'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tournaments' AND column_name = 'tournament_type'
    ) THEN
        ALTER TABLE tournaments RENAME COLUMN type TO tournament_type;
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tournaments' AND column_name = 'tournament_type'
    ) THEN
        ALTER TABLE tournaments ADD COLUMN tournament_type VARCHAR(20);
    END IF;
END $$;

UPDATE tournaments SET tournament_type = 'SINGLES' WHERE tournament_type IS NULL;
UPDATE tournaments SET sport_type = 'PICKLEBALL' WHERE sport_type IS NULL;
UPDATE tournaments SET start_date = NOW() WHERE start_date IS NULL;

ALTER TABLE tournaments ALTER COLUMN tournament_type SET NOT NULL;
ALTER TABLE tournaments ALTER COLUMN sport_type SET NOT NULL;
ALTER TABLE tournaments ALTER COLUMN start_date SET NOT NULL;

ALTER TABLE matches ALTER COLUMN tournament_id DROP NOT NULL;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS mode VARCHAR(20);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS game_type VARCHAR(20);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS scorekeeper_id UUID REFERENCES users(id);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS points_to_win INT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS best_of INT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS win_by_two BOOLEAN;

UPDATE matches SET mode = 'TOURNAMENT' WHERE mode IS NULL;
UPDATE matches SET game_type = 'SINGLES' WHERE game_type IS NULL;
UPDATE matches SET points_to_win = 11 WHERE points_to_win IS NULL;
UPDATE matches SET best_of = 1 WHERE best_of IS NULL;
UPDATE matches SET win_by_two = TRUE WHERE win_by_two IS NULL;

ALTER TABLE matches ALTER COLUMN mode SET NOT NULL;
ALTER TABLE matches ALTER COLUMN game_type SET NOT NULL;
ALTER TABLE matches ALTER COLUMN points_to_win SET NOT NULL;
ALTER TABLE matches ALTER COLUMN best_of SET NOT NULL;
ALTER TABLE matches ALTER COLUMN win_by_two SET NOT NULL;

ALTER TABLE matches ALTER COLUMN round DROP DEFAULT;
ALTER TABLE matches ALTER COLUMN round TYPE VARCHAR(50) USING round::VARCHAR;
ALTER TABLE matches ALTER COLUMN round SET DEFAULT 'Round 1';
ALTER TABLE score_history ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS match_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id),
    team_no INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_team_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES match_teams(id),
    user_id UUID NOT NULL REFERENCES users(id),
    slot_no INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_club_member'
    ) THEN
        ALTER TABLE club_members ADD CONSTRAINT uk_club_member UNIQUE (club_id, user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_registration'
    ) THEN
        ALTER TABLE registrations ADD CONSTRAINT uk_registration UNIQUE (user_id, tournament_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_match_players_different'
    ) THEN
        ALTER TABLE matches ADD CONSTRAINT chk_match_players_different CHECK (player1_id <> player2_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_match_points_to_win_min'
    ) THEN
        ALTER TABLE matches ADD CONSTRAINT chk_match_points_to_win_min CHECK (points_to_win >= 11);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_match_best_of_allowed'
    ) THEN
        ALTER TABLE matches ADD CONSTRAINT chk_match_best_of_allowed CHECK (best_of IN (1, 3, 5));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_match_mode_allowed'
    ) THEN
        ALTER TABLE matches ADD CONSTRAINT chk_match_mode_allowed CHECK (mode IN ('CASUAL', 'TOURNAMENT'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_match_game_type_allowed'
    ) THEN
        ALTER TABLE matches ADD CONSTRAINT chk_match_game_type_allowed CHECK (game_type IN ('SINGLES', 'DOUBLES'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_match_team'
    ) THEN
        ALTER TABLE match_teams ADD CONSTRAINT uk_match_team UNIQUE (match_id, team_no);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_match_team_no_allowed'
    ) THEN
        ALTER TABLE match_teams ADD CONSTRAINT chk_match_team_no_allowed CHECK (team_no IN (1, 2));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_match_team_player'
    ) THEN
        ALTER TABLE match_team_players ADD CONSTRAINT uk_match_team_player UNIQUE (team_id, user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_match_team_slot'
    ) THEN
        ALTER TABLE match_team_players ADD CONSTRAINT uk_match_team_slot UNIQUE (team_id, slot_no);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_users_phone_number'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT uk_users_phone_number UNIQUE (phone_number);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_users_google_subject'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT uk_users_google_subject UNIQUE (google_subject);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_club_members_user_id ON club_members(user_id);
CREATE INDEX IF NOT EXISTS idx_club_members_club_id ON club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_club_id ON tournaments(club_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_host_verifications_user_id ON host_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_host_verifications_status ON host_verifications(status);
CREATE INDEX IF NOT EXISTS idx_registrations_tournament_id ON registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament_id ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_mode ON matches(mode);
CREATE INDEX IF NOT EXISTS idx_matches_game_type ON matches(game_type);
CREATE INDEX IF NOT EXISTS idx_matches_scorekeeper_id ON matches(scorekeeper_id);
CREATE INDEX IF NOT EXISTS idx_match_teams_match_id ON match_teams(match_id);
CREATE INDEX IF NOT EXISTS idx_match_team_players_team_id ON match_team_players(team_id);
CREATE INDEX IF NOT EXISTS idx_match_team_players_user_id ON match_team_players(user_id);
CREATE INDEX IF NOT EXISTS idx_score_history_match_id ON score_history(match_id);
