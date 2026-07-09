-- Safe migration for platform roles and current host-application table naming.
-- Run in Supabase SQL editor after the base tables exist.

ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(30) NOT NULL DEFAULT 'USER';

DO $$
BEGIN
    IF to_regclass('public.host_verifications') IS NOT NULL
       AND to_regclass('public.host_applications') IS NULL THEN
        ALTER TABLE host_verifications RENAME TO host_applications;
    END IF;
END $$;

UPDATE users u
SET role = 'HOST'
FROM host_applications h
WHERE h.user_id = u.id
  AND h.status = 'APPROVED'
  AND u.role = 'USER';

-- Replace this email with the Pickelton/platform operator account, then run it once.
-- Replace this email with the Pickelton/platform operator account, then run it once.
UPDATE users SET role = 'ADMIN' WHERE LOWER(email) = LOWER('dev.seagrace@gmail.com');

DO $$
BEGIN
    IF to_regclass('public.host_applications') IS NOT NULL THEN
        CREATE INDEX IF NOT EXISTS idx_host_applications_user_id ON host_applications(user_id);
        CREATE INDEX IF NOT EXISTS idx_host_applications_status ON host_applications(status);
    END IF;
END $$;
