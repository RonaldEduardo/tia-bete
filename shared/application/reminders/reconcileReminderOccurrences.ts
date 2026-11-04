import { advanceOccurrence, generateOccurrences, type ReminderOccurrence } from '../../domain/reminders/reminderOccurrence'
import type { ReminderRepository } from './reminderRepository'
import { todayAndTomorrow } from './localDates'

export type ReconcileReminderOccurrencesResult = { occurrences: ReminderOccurrence[] } | { error: 'persistence-failed' }

const byNextAction = (left: ReminderOccurrence, right: ReminderOccurrence) => (left.nextActionAt ?? '9999').localeCompare(right.nextActionAt ?? '9999') || left.id.localeCompare(right.id)

export const reconcileReminderOccurrences = async (repository: ReminderRepository, now: string): Promise<ReconcileReminderOccurrencesResult> => {
  try {
    const reminders = await repository.listReminders()
    for (const reminder of reminders) await repository.insertOccurrences(generateOccurrences(reminder, todayAndTomorrow(now, reminder.schedule.timeZone), now))

    const occurrences = await repository.listOccurrences()
    const advanced = occurrences.map(occurrence => advanceOccurrence(occurrence, now))
    for (const occurrence of advanced) {
      const previous = occurrences.find(candidate => candidate.id === occurrence.id)!
      if (previous.status !== occurrence.status || previous.nextActionAt !== occurrence.nextActionAt) await repository.updateOccurrence(occurrence)
    }
    return { occurrences: advanced.sort(byNextAction) }
  } catch {
    return { error: 'persistence-failed' }
  }
}
