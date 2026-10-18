-- Existing databases: run once after 003. Fresh databases get this from schema.sql.
-- Categories inside one event (Men's doubles, Mixed, Under-18...), each with its own player limit and fee.
-- A player picks one or more categories when registering; matches and leaderboards are per category.
-- Safe to run more than once.
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
CREATE INDEX IF NOT EXISTS idx_tournament_categories_tournament ON tournament_categories(tournament_id, sort_order);

CREATE TABLE IF NOT EXISTS registration_categories (
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES tournament_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (registration_id, category_id)
);
CREATE INDEX IF NOT EXISTS idx_registration_categories_category ON registration_categories(category_id);

ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES tournament_categories(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tournament_matches_category ON tournament_matches(category_id);

-- Supabase: keep these tables private to the backend (it connects as the table owner, which skips RLS).
ALTER TABLE tournament_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_categories ENABLE ROW LEVEL SECURITY;
