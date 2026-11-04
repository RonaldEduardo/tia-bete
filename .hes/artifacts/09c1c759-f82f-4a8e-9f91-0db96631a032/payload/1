import { describe, expect, it } from 'vitest'

import { ignoreReminderOccurrence, snoozeReminderOccurrence } from '../../../shared/application/reminders/actOnReminderOccurrence'
import { createLocalReminder } from '../../../shared/application/reminders/createLocalReminder'
import { reconcileReminderOccurrences } from '../../../shared/application/reminders/reconcileReminderOccurrences'
import type { ReminderRepository } from '../../../shared/application/reminders/reminderRepository'
import type { Reminder } from '../../../shared/domain/reminders/reminder'
import type { ReminderOccurrence } from '../../../shared/domain/reminders/reminderOccurrence'

class MemoryReminderRepository implements ReminderRepository {
  reminders: Reminder[] = []
  occurrences: ReminderOccurrence[] = []
  async saveReminder(reminder: Reminder) { this.reminders.push(reminder) }
  async listReminders() { return [...this.reminders] }
  async getReminder(id: string) { return this.reminders.find(reminder => reminder.id === id) }
  async insertOccurrences(occurrences: readonly ReminderOccurrence[]) { for (const occurrence of occurrences) if (!this.occurrences.some(saved => saved.reminderId === occurrence.reminderId && saved.configurationRevision === occurrence.configurationRevision && saved.localDate === occurrence.localDate && saved.localTime === occurrence.localTime)) this.occurrences.push(occurrence) }
  async listOccurrences() { return [...this.occurrences] }
  async getOccurrence(id: string) { return this.occurrences.find(occurrence => occurrence.id === id) }
  async updateOccurrence(occurrence: ReminderOccurrence) { this.occurrences = this.occurrences.map(saved => saved.id === occurrence.id ? occurrence : saved) }
}

const input = { type: 'glucose-reading', localTime: '08:30', daysOfWeek: [3], timeZone: 'UTC' }
const dependencies = { now: () => '2026-11-04T08:30:00.000Z', createId: () => 'reminder-1' }

describe('reminder application use cases', () => {
  it('creates today and tomorrow slots without duplicating an explicit reconciliation', async () => {
    const repository = new MemoryReminderRepository()
    await expect(createLocalReminder(input, repository, dependencies)).resolves.toHaveProperty('reminder')
    await reconcileReminderOccurrences(repository, dependencies.now())

    expect(repository.occurrences).toHaveLength(1)
    expect(repository.occurrences[0]).toMatchObject({ status: 'due', localDate: '2026-11-04', scheduledFor: '2026-11-04T08:30:00.000Z' })
  })

  it('persists snooze and explicit ignore through the application boundary', async () => {
    const repository = new MemoryReminderRepository()
    await createLocalReminder(input, repository, dependencies)
    const occurrence = repository.occurrences[0]!

    const snoozed = await snoozeReminderOccurrence(occurrence.id, repository, dependencies.now())
    expect(snoozed).toMatchObject({ occurrence: { status: 'snoozed', nextActionAt: '2026-11-04T08:40:00.000Z' } })
    const ignored = await ignoreReminderOccurrence(occurrence.id, repository, '2026-11-04T08:40:00.000Z')
    expect(ignored).toMatchObject({ occurrence: { status: 'ignored', nextActionAt: null } })
  })
})
