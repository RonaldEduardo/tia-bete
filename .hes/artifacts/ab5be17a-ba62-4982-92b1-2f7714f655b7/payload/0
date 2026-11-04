import { ignoreOccurrence, snoozeOccurrence, type ReminderOccurrence } from '../../domain/reminders/reminderOccurrence'
import type { ReminderRepository } from './reminderRepository'

export type ReminderOccurrenceActionResult = { occurrence: ReminderOccurrence } | { error: 'not-found' | 'not-due' | 'limit-reached' | 'persistence-failed' }

export const snoozeReminderOccurrence = async (id: string, repository: ReminderRepository, now: string): Promise<ReminderOccurrenceActionResult> => {
  try {
    const occurrence = await repository.getOccurrence(id)
    if (!occurrence) return { error: 'not-found' }
    const reminder = await repository.getReminder(occurrence.reminderId)
    if (!reminder) return { error: 'not-found' }
    const result = snoozeOccurrence(occurrence, now, reminder.schedule.snoozeMinutes, reminder.schedule.maxSnoozes)
    if ('error' in result) return result
    await repository.updateOccurrence(result.occurrence)
    return result
  } catch {
    return { error: 'persistence-failed' }
  }
}

export const ignoreReminderOccurrence = async (id: string, repository: ReminderRepository, now: string): Promise<ReminderOccurrenceActionResult> => {
  try {
    const occurrence = await repository.getOccurrence(id)
    if (!occurrence) return { error: 'not-found' }
    const result = ignoreOccurrence(occurrence, now)
    if ('error' in result) return result
    await repository.updateOccurrence(result.occurrence)
    return result
  } catch {
    return { error: 'persistence-failed' }
  }
}
