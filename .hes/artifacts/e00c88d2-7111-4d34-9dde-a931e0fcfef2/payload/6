import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { createLocalReminder } from '../../../shared/application/reminders/createLocalReminder'
import { recordGlucoseAndCompleteReminder } from '../../../shared/application/glucose/recordGlucoseAndCompleteReminder'
import { SqliteGlucoseReminderTransaction } from '../../../server/infrastructure/glucose/sqliteGlucoseReminderTransaction'
import { SqliteReminderRepository } from '../../../server/infrastructure/reminders/sqliteReminderRepository'

const load = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')
const migrations = [
  { version: '001', sql: load('server/infrastructure/glucose/migrations/001_create_glucose_readings.sql') },
  { version: '002', sql: load('server/infrastructure/reminders/migrations/002_create_reminders.sql') },
  { version: '003', sql: load('server/infrastructure/reminders/migrations/003_glucose_completion_idempotency.sql') }
]
const directories: string[] = []
const createPath = () => { const directory = mkdtempSync(join(tmpdir(), 'tia-bete-glucose-reminder-')); directories.push(directory); return join(directory, 'app.sqlite') }
afterEach(() => directories.splice(0).forEach(directory => rmSync(directory, { recursive: true, force: true })))

describe('SqliteGlucoseReminderTransaction', () => {
  it('persists a reading and only one compatible occurrence atomically', async () => {
    const path = createPath(); const reminders = new SqliteReminderRepository(path, migrations); const transaction = new SqliteGlucoseReminderTransaction(path, migrations)
    await createLocalReminder({ type: 'glucose-reading', localTime: '10:00', daysOfWeek: [3], timeZone: 'UTC' }, reminders, { now: () => '2026-11-04T10:00:00.000Z', createId: () => 'reminder-1' })
    const result = await recordGlucoseAndCompleteReminder({ value: '121', date: '2026-11-04', time: '10:00', timeZone: 'UTC' }, transaction, { now: () => '2026-11-04T10:00:00.000Z', createId: () => 'reading-1' })
    expect(result).toMatchObject({ completedOccurrenceId: expect.any(String) })
    expect((await reminders.listOccurrences()).filter(item => item.status === 'completed')).toHaveLength(1)
    transaction.close(); reminders.close()
  })
})
