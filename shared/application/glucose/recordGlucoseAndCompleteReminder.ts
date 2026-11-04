import { createGlucoseReading, type CreateGlucoseReadingResult, type GlucoseReading } from '../../domain/glucose/glucoseReading'
import type { GlucoseReadingInput } from '../../domain/glucose/validateGlucoseReading'
import { completeCompatibleGlucoseOccurrence, type ReminderOccurrence } from '../../domain/reminders/reminderOccurrence'
import type { GlucoseReminderTransactionRunner } from './glucoseReminderTransaction'

type Dependencies = { now: () => string, createId: () => string }
export type RecordGlucoseAndCompleteReminderResult = { reading: GlucoseReading, completedOccurrenceId?: string } | { errors: Record<string, string> } | { error: 'persistence-failed' }

export const recordGlucoseAndCompleteReminder = async (input: GlucoseReadingInput, runner: GlucoseReminderTransactionRunner, dependencies: Dependencies): Promise<RecordGlucoseAndCompleteReminderResult> => {
  const created = createGlucoseReading({ ...input, id: dependencies.createId(), createdAt: dependencies.now() })
  if ('errors' in created) return created

  try {
    const completed = await runner.runInTransaction(async transaction => {
      await transaction.saveReading(created.reading)
      const [reminders, occurrences] = await Promise.all([transaction.listReminders(), transaction.listOccurrences()])
      const candidates = reminders.map(reminder => completeCompatibleGlucoseOccurrence(occurrences, reminder, created.reading, dependencies.now())).filter((occurrence): occurrence is ReminderOccurrence => Boolean(occurrence)).sort((left, right) => {
        const occurredAt = Date.parse(created.reading.occurredAt)
        const distance = Math.abs(occurredAt - Date.parse(left.scheduledFor!)) - Math.abs(occurredAt - Date.parse(right.scheduledFor!))
        return distance || left.scheduledFor!.localeCompare(right.scheduledFor!) || left.id.localeCompare(right.id)
      })
      const selected = candidates[0]
      if (selected) await transaction.updateOccurrence(selected)
      return selected
    })
    return { reading: created.reading, ...(completed ? { completedOccurrenceId: completed.id } : {}) }
  } catch {
    return { error: 'persistence-failed' }
  }
}
