import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { ignoreReminderOccurrence, snoozeReminderOccurrence } from '../../../shared/application/reminders/actOnReminderOccurrence'
import { createLocalReminder } from '../../../shared/application/reminders/createLocalReminder'
import { reconcileReminderOccurrences } from '../../../shared/application/reminders/reconcileReminderOccurrences'
import { SqliteReminderRepository } from '../../../server/infrastructure/reminders/sqliteReminderRepository'

const migration = readFileSync(resolve(process.cwd(), 'server/infrastructure/reminders/migrations/002_create_reminders.sql'), 'utf8')
const directories: string[] = []
const createRepository = (path?: string) => {
  const directory = path ? undefined : mkdtempSync(join(tmpdir(), 'tia-bete-reminders-'))
  if (directory) directories.push(directory)
  const databasePath = path ?? join(directory!, 'reminders.sqlite')
  return { path: databasePath, repository: new SqliteReminderRepository(databasePath, [{ version: '002', sql: migration }]) }
}
const input = { type: 'glucose-reading', localTime: '08:30', daysOfWeek: [3], timeZone: 'UTC' }
const dependencies = { now: () => '2026-11-04T08:30:00.000Z', createId: () => 'reminder-1' }

afterEach(() => directories.splice(0).forEach(directory => rmSync(directory, { recursive: true, force: true })))

describe('SqliteReminderRepository', () => {
  it('persists idempotent local occurrences through a backend restart', async () => {
    const { path, repository: first } = createRepository()
    await createLocalReminder(input, first, dependencies)
    await reconcileReminderOccurrences(first, dependencies.now())
    expect((await first.listOccurrences())).toHaveLength(1)
    first.close()

    const restarted = createRepository(path).repository
    await reconcileReminderOccurrences(restarted, dependencies.now())
    const occurrences = await restarted.listOccurrences()
    expect(await restarted.listReminders()).toHaveLength(1)
    expect(occurrences).toHaveLength(1)
    expect(occurrences[0]).toMatchObject({ status: 'due', scheduledFor: '2026-11-04T08:30:00.000Z' })
    restarted.close()
  })

  it('persists snooze and explicit ignore after reopening the database', async () => {
    const { path, repository: first } = createRepository()
    await createLocalReminder(input, first, dependencies)
    const occurrence = (await first.listOccurrences())[0]!
    await snoozeReminderOccurrence(occurrence.id, first, dependencies.now())
    first.close()

    const restarted = createRepository(path).repository
    expect((await restarted.getOccurrence(occurrence.id))).toMatchObject({ status: 'snoozed', nextActionAt: '2026-11-04T08:40:00.000Z' })
    await ignoreReminderOccurrence(occurrence.id, restarted, '2026-11-04T08:40:00.000Z')
    expect((await restarted.getOccurrence(occurrence.id))).toMatchObject({ status: 'ignored', nextActionAt: null })
    restarted.close()
  })
})
