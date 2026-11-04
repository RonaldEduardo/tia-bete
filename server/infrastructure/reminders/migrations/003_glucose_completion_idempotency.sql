CREATE UNIQUE INDEX reminder_occurrences_glucose_reading_id_uq
  ON reminder_occurrences (completion_glucose_reading_id)
  WHERE completion_glucose_reading_id IS NOT NULL;
