CREATE TABLE reminders (
  id TEXT PRIMARY KEY NOT NULL,
  current_configuration_revision INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE reminder_configurations (
  reminder_id TEXT NOT NULL,
  revision INTEGER NOT NULL,
  type TEXT NOT NULL,
  local_time TEXT NOT NULL,
  days_of_week_json TEXT NOT NULL,
  time_zone TEXT NOT NULL,
  snooze_minutes INTEGER NOT NULL,
  max_snoozes INTEGER NOT NULL,
  PRIMARY KEY (reminder_id, revision),
  FOREIGN KEY (reminder_id) REFERENCES reminders(id)
);

CREATE TABLE reminder_occurrences (
  id TEXT PRIMARY KEY NOT NULL,
  reminder_id TEXT NOT NULL,
  configuration_revision INTEGER NOT NULL,
  local_date TEXT NOT NULL,
  local_time TEXT NOT NULL,
  time_zone TEXT NOT NULL,
  scheduled_for TEXT,
  next_action_at TEXT,
  expires_at TEXT,
  status TEXT NOT NULL,
  snooze_count INTEGER NOT NULL,
  skip_reason TEXT,
  completion_kind TEXT,
  completion_glucose_reading_id TEXT,
  completion_confirmed_at TEXT,
  UNIQUE (reminder_id, configuration_revision, local_date, local_time),
  FOREIGN KEY (reminder_id, configuration_revision) REFERENCES reminder_configurations(reminder_id, revision)
);

CREATE INDEX reminder_occurrences_next_action_idx ON reminder_occurrences (status, next_action_at);
CREATE INDEX reminder_occurrences_history_idx ON reminder_occurrences (reminder_id, local_date DESC);
