CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
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
    location VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_follows (
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, followed_id),
    CONSTRAINT chk_user_follow_not_self CHECK (follower_id <> followed_id)
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
    start_date TIMESTAMP NOT NULL,
    venue VARCHAR(255),
    registration_deadline TIMESTAMP,
    upi_id VARCHAR(100),
    payee_name VARCHAR(120),
    payment_instructions TEXT,
    registration_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS host_applications (
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
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'NOT_REQUIRED',
    amount_due NUMERIC(12, 2),
    payment_reference VARCHAR(40),
    payment_submitted_at TIMESTAMPTZ,
    payment_reviewed_at TIMESTAMPTZ,
    host_note VARCHAR(300),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_registration UNIQUE (user_id, tournament_id)
);

CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID NOT NULL REFERENCES users(id),
    sport sport_type NOT NULL DEFAULT 'PICKLEBALL',
    match_type match_type NOT NULL DEFAULT 'SINGLES',
    status match_status NOT NULL DEFAULT 'CREATED',
    scheduled_at TIMESTAMPTZ,
    location VARCHAR(255),
    rules JSONB NOT NULL DEFAULT '{"pointsPerSet":21,"bestOfSets":3}'::jsonb,
    winner_id UUID REFERENCES users(id),
    round VARCHAR(50),
    -- Legacy columns stay nullable until all clients and reports move to the normalized tables.
    tournament_id UUID REFERENCES tournaments(id),
    player1_id UUID REFERENCES users(id),
    player2_id UUID REFERENCES users(id),
    score1 INT NOT NULL DEFAULT 0,
    score2 INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    team_no INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_match_team UNIQUE (match_id, team_no),
    CONSTRAINT chk_match_team_no_allowed CHECK (team_no IN (1, 2))
);

CREATE TABLE IF NOT EXISTS match_team_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES match_teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    slot_no INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_match_team_player UNIQUE (team_id, user_id),
    CONSTRAINT uk_match_team_slot UNIQUE (team_id, slot_no)
);

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

CREATE TABLE IF NOT EXISTS tournament_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    name VARCHAR(80) NOT NULL,
    format VARCHAR(20) NOT NULL,
    max_players INT NOT NULL,
    entry_fee NUMERIC(12, 2),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_tournament_category_format CHECK (format IN ('SINGLES', 'DOUBLES')),
    CONSTRAINT chk_tournament_category_max_players CHECK (max_players >= 2)
);

CREATE TABLE IF NOT EXISTS registration_categories (
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES tournament_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (registration_id, category_id)
);

CREATE TABLE IF NOT EXISTS tournament_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    match_id UUID NOT NULL UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
    category_id UUID REFERENCES tournament_categories(id) ON DELETE SET NULL,
    round VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    pinned BOOLEAN NOT NULL DEFAULT FALSE,
    content TEXT NOT NULL,
    metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Legacy score snapshots stay until the final cleanup migration.
CREATE TABLE IF NOT EXISTS score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES users(id),
    old_score INT NOT NULL,
    new_score INT NOT NULL,
    updated_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_club_members_user_id ON club_members(user_id);
CREATE INDEX IF NOT EXISTS idx_club_members_club_id ON club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_host_applications_user_id ON host_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_host_applications_status ON host_applications(status);
CREATE INDEX IF NOT EXISTS idx_registrations_tournament_id ON registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_match_participants_match_id ON match_participants(match_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_user_id ON match_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_match_state_match_id ON match_state(match_id);
CREATE INDEX IF NOT EXISTS idx_score_events_match_id_seq ON score_events(match_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_tournament_id ON tournament_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_category ON tournament_matches(category_id);
CREATE INDEX IF NOT EXISTS idx_tournament_categories_tournament ON tournament_categories(tournament_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_registration_categories_category ON registration_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_club_id_created_at ON posts(club_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tournament_id_created_at ON posts(tournament_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_score_history_match_id ON score_history(match_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_score_history_match_id ON score_history(match_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_followed ON user_follows(followed_id);
CREATE INDEX IF NOT EXISTS idx_clubs_coordinates ON clubs(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_registrations_tournament_payment ON registrations(tournament_id, payment_status);
