import { describe, expect, it } from 'vitest'

import { recordGlucoseAndCompleteReminder } from '../../../shared/application/glucose/recordGlucoseAndCompleteReminder'
import type { GlucoseReminderTransaction, GlucoseReminderTransactionRunner } from '../../../shared/application/glucose/glucoseReminderTransaction'
import { createReminder, type Reminder } from '../../../shared/domain/reminders/reminder'
import { generateOccurrences, type ReminderOccurrence } from '../../../shared/domain/reminders/reminderOccurrence'

class MemoryTransaction implements GlucoseReminderTransactionRunner, GlucoseReminderTransaction {
  readings: string[] = []
  constructor(readonly reminders: Reminder[], public occurrences: ReminderOccurrence[], private readonly fail = false) {}
  async runInTransaction<T>(operation: (transaction: GlucoseReminderTransaction) => Promise<T>) {
    const readings = [...this.readings]; const occurrences = [...this.occurrences]
    try { return await operation(this) } catch (error) { this.readings = readings; this.occurrences = occurrences; throw error }
  }
  async saveReading(reading: { id: string }) { if (this.fail) throw new Error('disk failure'); this.readings.push(reading.id) }
  async listReminders() { return this.reminders }
  async listOccurrences() { return this.occurrences }
  async updateOccurrence(occurrence: ReminderOccurrence) { this.occurrences = this.occurrences.map(item => item.id === occurrence.id ? occurrence : item) }
}

const now = '2026-11-04T10:00:00.000Z'
const reminder = (id: string, type: Reminder['type'] = 'glucose-reading') => {
  const result = createReminder({ type, localTime: '10:00', daysOfWeek: [3], timeZone: 'UTC' }, { createId: () => id, now: () => now })
  if ('errors' in result) throw new Error('fixture invalid')
  return result.reminder
}
const occurrence = (configuredReminder: Reminder) => generateOccurrences(configuredReminder, ['2026-11-04'], now)[0]!
const input = (time: string) => ({ value: '121', date: '2026-11-04', time, timeZone: 'UTC' })
const dependencies = { now: () => now, createId: () => 'reading-1' }

describe('recordGlucoseAndCompleteReminder', () => {
  it('completes exactly one nearest compatible glucose occurrence with reading evidence', async () => {
    const first = reminder('reminder-1'); const second = reminder('reminder-2')
    const transaction = new MemoryTransaction([first, second], [occurrence(first), occurrence(second)])
    const result = await recordGlucoseAndCompleteReminder(input('10:15'), transaction, dependencies)
    expect(result).toMatchObject({ completedOccurrenceId: transaction.occurrences[0]!.id })
    expect(transaction.readings).toEqual(['reading-1'])
    expect(transaction.occurrences.filter(item => item.status === 'completed')).toHaveLength(1)
    expect(transaction.occurrences[0]).toMatchObject({ completionEvidence: { kind: 'glucose-reading', glucoseReadingId: 'reading-1' } })
  })

  it('does not conclude a reading outside the approved window', async () => {
    const configuredReminder = reminder('reminder-1')
    const transaction = new MemoryTransaction([configuredReminder], [occurrence(configuredReminder)])
    const result = await recordGlucoseAndCompleteReminder(input('11:01'), transaction, dependencies)
    expect(result).not.toHaveProperty('completedOccurrenceId')
    expect(transaction.occurrences[0]!.status).toBe('due')
  })

  it('does not conclude incompatible reminder types', async () => {
    const configuredReminder = reminder('reminder-1', 'insulin')
    const transaction = new MemoryTransaction([configuredReminder], [occurrence(configuredReminder)])
    const result = await recordGlucoseAndCompleteReminder(input('10:00'), transaction, dependencies)
    expect(result).not.toHaveProperty('completedOccurrenceId')
    expect(transaction.occurrences[0]!.status).toBe('due')
  })

  it('does not report success or retain a reading when transaction persistence fails', async () => {
    const configuredReminder = reminder('reminder-1')
    const transaction = new MemoryTransaction([configuredReminder], [occurrence(configuredReminder)], true)
    await expect(recordGlucoseAndCompleteReminder(input('10:00'), transaction, dependencies)).resolves.toEqual({ error: 'persistence-failed' })
    expect(transaction.readings).toEqual([])
    expect(transaction.occurrences[0]!.status).toBe('due')
  })
})
