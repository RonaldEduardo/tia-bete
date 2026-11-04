CREATE TABLE glucose_readings (
  id TEXT PRIMARY KEY NOT NULL,
  glucose_mg_dl INTEGER NOT NULL,
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  time_zone TEXT NOT NULL,
  context TEXT
);
