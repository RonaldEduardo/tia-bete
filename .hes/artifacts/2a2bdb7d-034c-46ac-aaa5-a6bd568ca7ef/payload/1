import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

import type { ReminderRepository } from '../../../shared/application/reminders/reminderRepository'
import type { Reminder } from '../../../shared/domain/reminders/reminder'
import type { ReminderOccurrence } from '../../../shared/domain/reminders/reminderOccurrence'
import type { SqliteMigration } from '../../infrastructure/glucose/sqliteGlucoseReadingRepository'

type StoredReminder = { id: string, type: Reminder['type'], local_time: string, days_of_week_json: string, time_zone: string, snooze_minutes: number, max_snoozes: number, configuration_revision: number, created_at: string }
type StoredOccurrence = { id: string, reminder_id: string, configuration_revision: number, local_date: string, local_time: string, time_zone: string, scheduled_for: string | null, next_action_at: string | null, expires_at: string | null, status: ReminderOccurrence['status'], snooze_count: number, skip_reason: ReminderOccurrence['skipReason'] | null, completion_kind: 'manual' | 'glucose-reading' | null, completion_glucose_reading_id: string | null, completion_confirmed_at: string | null }

const toReminder = (row: StoredReminder): Reminder => ({
  id: row.id, type: row.type, configurationRevision: row.configuration_revision, createdAt: row.created_at,
  schedule: { localTime: row.local_time, daysOfWeek: JSON.parse(row.days_of_week_json), timeZone: row.time_zone, snoozeMinutes: row.snooze_minutes, maxSnoozes: row.max_snoozes }
})
const toOccurrence = (row: StoredOccurrence): ReminderOccurrence => ({
  id: row.id, reminderId: row.reminder_id, configurationRevision: row.configuration_revision, localDate: row.local_date, localTime: row.local_time, timeZone: row.time_zone,
  scheduledFor: row.scheduled_for, nextActionAt: row.next_action_at, expiresAt: row.expires_at, status: row.status, snoozeCount: row.snooze_count,
  ...(row.skip_reason ? { skipReason: row.skip_reason } : {}),
  ...(row.completion_kind === 'manual' && row.completion_confirmed_at ? { completionEvidence: { kind: 'manual' as const, confirmedAt: row.completion_confirmed_at } } : {}),
  ...(row.completion_kind === 'glucose-reading' && row.completion_glucose_reading_id && row.completion_confirmed_at ? { completionEvidence: { kind: 'glucose-reading' as const, glucoseReadingId: row.completion_glucose_reading_id, confirmedAt: row.completion_confirmed_at } } : {})
})

export class SqliteReminderRepository implements ReminderRepository {
  private readonly database: DatabaseSync

  constructor(path: string, migrations: readonly SqliteMigration[]) {
    mkdirSync(dirname(path), { recursive: true })
    this.database = new DatabaseSync(path)
    this.database.exec('PRAGMA foreign_keys = ON')
    this.applyMigrations(migrations)
  }

  async saveReminder(reminder: Reminder) {
    this.database.exec('BEGIN')
    try {
      this.database.prepare('INSERT INTO reminders (id, current_configuration_revision, created_at) VALUES (?, ?, ?)').run(reminder.id, reminder.configurationRevision, reminder.createdAt)
      this.database.prepare(`INSERT INTO reminder_configurations (reminder_id, revision, type, local_time, days_of_week_json, time_zone, snooze_minutes, max_snoozes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
        reminder.id, reminder.configurationRevision, reminder.type, reminder.schedule.localTime, JSON.stringify(reminder.schedule.daysOfWeek), reminder.schedule.timeZone, reminder.schedule.snoozeMinutes, reminder.schedule.maxSnoozes
      )
      this.database.exec('COMMIT')
    } catch (error) {
      this.database.exec('ROLLBACK')
      throw error
    }
  }

  async listReminders() {
    const rows = this.database.prepare(`SELECT r.id, c.type, c.local_time, c.days_of_week_json, c.time_zone, c.snooze_minutes, c.max_snoozes, c.revision AS configuration_revision, r.created_at FROM reminders r JOIN reminder_configurations c ON c.reminder_id = r.id AND c.revision = r.current_configuration_revision ORDER BY r.created_at, r.id`).all() as unknown as StoredReminder[]
    return rows.map(toReminder)
  }

  async getReminder(id: string) {
    const row = this.database.prepare(`SELECT r.id, c.type, c.local_time, c.days_of_week_json, c.time_zone, c.snooze_minutes, c.max_snoozes, c.revision AS configuration_revision, r.created_at FROM reminders r JOIN reminder_configurations c ON c.reminder_id = r.id AND c.revision = r.current_configuration_revision WHERE r.id = ?`).get(id) as unknown as StoredReminder | undefined
    return row && toReminder(row)
  }

  async insertOccurrences(occurrences: readonly ReminderOccurrence[]) {
    const statement = this.database.prepare(`INSERT INTO reminder_occurrences (id, reminder_id, configuration_revision, local_date, local_time, time_zone, scheduled_for, next_action_at, expires_at, status, snooze_count, skip_reason, completion_kind, completion_glucose_reading_id, completion_confirmed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(reminder_id, configuration_revision, local_date, local_time) DO NOTHING`)
    this.database.exec('BEGIN')
    try {
      for (const occurrence of occurrences) statement.run(...this.occurrenceValues(occurrence))
      this.database.exec('COMMIT')
    } catch (error) {
      this.database.exec('ROLLBACK')
      throw error
    }
  }

  async listOccurrences() {
    const rows = this.database.prepare('SELECT * FROM reminder_occurrences ORDER BY COALESCE(next_action_at, \'9999-12-31T23:59:59.999Z\'), id').all() as unknown as StoredOccurrence[]
    return rows.map(toOccurrence)
  }

  async getOccurrence(id: string) {
    const row = this.database.prepare('SELECT * FROM reminder_occurrences WHERE id = ?').get(id) as unknown as StoredOccurrence | undefined
    return row && toOccurrence(row)
  }

  async updateOccurrence(occurrence: ReminderOccurrence) {
    this.database.prepare(`UPDATE reminder_occurrences SET scheduled_for = ?, next_action_at = ?, expires_at = ?, status = ?, snooze_count = ?, skip_reason = ?, completion_kind = ?, completion_glucose_reading_id = ?, completion_confirmed_at = ? WHERE id = ?`).run(
      occurrence.scheduledFor, occurrence.nextActionAt, occurrence.expiresAt, occurrence.status, occurrence.snoozeCount, occurrence.skipReason ?? null,
      occurrence.completionEvidence?.kind ?? null, occurrence.completionEvidence?.kind === 'glucose-reading' ? occurrence.completionEvidence.glucoseReadingId : null, occurrence.completionEvidence?.confirmedAt ?? null, occurrence.id
    )
  }

  close() { this.database.close() }

  private occurrenceValues(occurrence: ReminderOccurrence) {
    return [occurrence.id, occurrence.reminderId, occurrence.configurationRevision, occurrence.localDate, occurrence.localTime, occurrence.timeZone, occurrence.scheduledFor, occurrence.nextActionAt, occurrence.expiresAt, occurrence.status, occurrence.snoozeCount, occurrence.skipReason ?? null, occurrence.completionEvidence?.kind ?? null, occurrence.completionEvidence?.kind === 'glucose-reading' ? occurrence.completionEvidence.glucoseReadingId : null, occurrence.completionEvidence?.confirmedAt ?? null]
  }

  private applyMigrations(migrations: readonly SqliteMigration[]) {
    this.database.exec('CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY NOT NULL)')
    for (const migration of migrations) {
      if (this.database.prepare('SELECT version FROM schema_migrations WHERE version = ?').get(migration.version)) continue
      this.database.exec('BEGIN')
      try {
        this.database.exec(migration.sql)
        this.database.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(migration.version)
        this.database.exec('COMMIT')
      } catch (error) {
        this.database.exec('ROLLBACK')
        throw error
      }
    }
  }
}
