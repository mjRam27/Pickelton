-- Existing databases: run once after 002. Fresh databases get this from schema.sql.
-- Tournament registration details (venue, deadline, UPI payment, custom questions)
-- and per-registration answers and payment tracking. Safe to run more than once.
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS venue VARCHAR(255);
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMP;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS upi_id VARCHAR(100);
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS payee_name VARCHAR(120);
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS payment_instructions TEXT;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS registration_questions JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE registrations ADD COLUMN IF NOT EXISTS answers JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'NOT_REQUIRED';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS amount_due NUMERIC(12, 2);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(40);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_submitted_at TIMESTAMPTZ;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_reviewed_at TIMESTAMPTZ;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS host_note VARCHAR(300);

CREATE INDEX IF NOT EXISTS idx_registrations_tournament_payment ON registrations(tournament_id, payment_status);
