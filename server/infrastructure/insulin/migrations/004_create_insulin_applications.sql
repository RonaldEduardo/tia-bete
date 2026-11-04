CREATE TABLE insulin_applications (
  id TEXT PRIMARY KEY NOT NULL,
  insulin_type TEXT NOT NULL CHECK (insulin_type IN ('basal', 'rapid')),
  insulin_name TEXT NOT NULL,
  units REAL NOT NULL CHECK (units > 0),
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  time_zone TEXT NOT NULL
);
CREATE INDEX insulin_applications_occurred_at_idx ON insulin_applications (occurred_at DESC);
