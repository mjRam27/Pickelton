CREATE TABLE IF NOT EXISTS report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  report_type VARCHAR(80) NOT NULL DEFAULT 'Business Summary',
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  comparison VARCHAR(30) NOT NULL,
  granularity VARCHAR(20) NOT NULL,
  format VARCHAR(10) NOT NULL DEFAULT 'CSV' CHECK (format IN ('CSV')),
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (date_to >= date_from)
);

CREATE INDEX IF NOT EXISTS idx_report_history_partner_created
  ON report_history(partner_id, created_at DESC);
