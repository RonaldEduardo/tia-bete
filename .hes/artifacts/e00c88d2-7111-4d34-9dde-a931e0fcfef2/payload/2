import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

import type { GlucoseReminderTransaction, GlucoseReminderTransactionRunner } from '../../../shared/application/glucose/glucoseReminderTransaction'
import type { GlucoseReading } from '../../../shared/domain/glucose/glucoseReading'
import type { Reminder } from '../../../shared/domain/reminders/reminder'
import type { ReminderOccurrence } from '../../../shared/domain/reminders/reminderOccurrence'
import type { SqliteMigration } from './sqliteGlucoseReadingRepository'

type StoredReminder = { id: string, type: Reminder['type'], local_time: string, days_of_week_json: string, time_zone: string, snooze_minutes: number, max_snoozes: number, configuration_revision: number, created_at: string }
type StoredOccurrence = { id: string, reminder_id: string, configuration_revision: number, local_date: string, local_time: string, time_zone: string, scheduled_for: string | null, next_action_at: string | null, expires_at: string | null, status: ReminderOccurrence['status'], snooze_count: number, skip_reason: ReminderOccurrence['skipReason'] | null, completion_kind: 'manual' | 'glucose-reading' | null, completion_glucose_reading_id: string | null, completion_confirmed_at: string | null }

const toReminder = (row: StoredReminder): Reminder => ({ id: row.id, type: row.type, configurationRevision: row.configuration_revision, createdAt: row.created_at, schedule: { localTime: row.local_time, daysOfWeek: JSON.parse(row.days_of_week_json), timeZone: row.time_zone, snoozeMinutes: row.snooze_minutes, maxSnoozes: row.max_snoozes } })
const toOccurrence = (row: StoredOccurrence): ReminderOccurrence => ({
  id: row.id, reminderId: row.reminder_id, configurationRevision: row.configuration_revision, localDate: row.local_date, localTime: row.local_time, timeZone: row.time_zone, scheduledFor: row.scheduled_for, nextActionAt: row.next_action_at, expiresAt: row.expires_at, status: row.status, snoozeCount: row.snooze_count,
  ...(row.skip_reason ? { skipReason: row.skip_reason } : {}),
  ...(row.completion_kind === 'manual' && row.completion_confirmed_at ? { completionEvidence: { kind: 'manual' as const, confirmedAt: row.completion_confirmed_at } } : {}),
  ...(row.completion_kind === 'glucose-reading' && row.completion_glucose_reading_id && row.completion_confirmed_at ? { completionEvidence: { kind: 'glucose-reading' as const, glucoseReadingId: row.completion_glucose_reading_id, confirmedAt: row.completion_confirmed_at } } : {})
})

export class SqliteGlucoseReminderTransaction implements GlucoseReminderTransactionRunner {
  private readonly database: DatabaseSync

  constructor(path: string, migrations: readonly SqliteMigration[]) {
    mkdirSync(dirname(path), { recursive: true })
    this.database = new DatabaseSync(path)
    this.database.exec('PRAGMA foreign_keys = ON')
    this.applyMigrations(migrations)
  }

  async runInTransaction<T>(operation: (transaction: GlucoseReminderTransaction) => Promise<T>) {
    this.database.exec('BEGIN IMMEDIATE')
    try {
      const result = await operation({ saveReading: reading => this.saveReading(reading), listReminders: () => this.listReminders(), listOccurrences: () => this.listOccurrences(), updateOccurrence: occurrence => this.updateOccurrence(occurrence) })
      this.database.exec('COMMIT')
      return result
    } catch (error) {
      this.database.exec('ROLLBACK')
      throw error
    }
  }

  close() { this.database.close() }

  private async saveReading(reading: GlucoseReading) {
    this.database.prepare('INSERT INTO glucose_readings (id, glucose_mg_dl, occurred_at, created_at, time_zone, context) VALUES (?, ?, ?, ?, ?, ?)').run(reading.id, reading.glucoseMgDl, reading.occurredAt, reading.createdAt, reading.timeZone, reading.context ?? null)
  }
  private async listReminders() {
    const rows = this.database.prepare('SELECT r.id, c.type, c.local_time, c.days_of_week_json, c.time_zone, c.snooze_minutes, c.max_snoozes, c.revision AS configuration_revision, r.created_at FROM reminders r JOIN reminder_configurations c ON c.reminder_id = r.id AND c.revision = r.current_configuration_revision').all() as unknown as StoredReminder[]
    return rows.map(toReminder)
  }
  private async listOccurrences() {
    const rows = this.database.prepare('SELECT * FROM reminder_occurrences').all() as unknown as StoredOccurrence[]
    return rows.map(toOccurrence)
  }
  private async updateOccurrence(occurrence: ReminderOccurrence) {
    this.database.prepare('UPDATE reminder_occurrences SET status = ?, next_action_at = ?, completion_kind = ?, completion_glucose_reading_id = ?, completion_confirmed_at = ? WHERE id = ?').run(occurrence.status, occurrence.nextActionAt, occurrence.completionEvidence?.kind ?? null, occurrence.completionEvidence?.kind === 'glucose-reading' ? occurrence.completionEvidence.glucoseReadingId : null, occurrence.completionEvidence?.confirmedAt ?? null, occurrence.id)
  }
  private applyMigrations(migrations: readonly SqliteMigration[]) {
    this.database.exec('CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY NOT NULL)')
    for (const migration of migrations) {
      if (this.database.prepare('SELECT version FROM schema_migrations WHERE version = ?').get(migration.version)) continue
      this.database.exec('BEGIN')
      try { this.database.exec(migration.sql); this.database.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(migration.version); this.database.exec('COMMIT') } catch (error) { this.database.exec('ROLLBACK'); throw error }
    }
  }
}
