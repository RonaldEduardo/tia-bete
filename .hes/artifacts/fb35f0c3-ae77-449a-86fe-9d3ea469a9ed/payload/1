import { createReminder, type CreateReminderInput } from '../../domain/reminders/reminder'
import { generateOccurrences } from '../../domain/reminders/reminderOccurrence'
import type { ReminderRepository } from './reminderRepository'
import { todayAndTomorrow } from './localDates'

type Dependencies = { createId: () => string, now: () => string }
export type CreateLocalReminderResult = ReturnType<typeof createReminder> | { error: 'persistence-failed' }

export const createLocalReminder = async (input: CreateReminderInput, repository: ReminderRepository, dependencies: Dependencies): Promise<CreateLocalReminderResult> => {
  const result = createReminder(input, dependencies)
  if ('errors' in result) return result

  try {
    await repository.saveReminder(result.reminder)
    await repository.insertOccurrences(generateOccurrences(result.reminder, todayAndTomorrow(dependencies.now(), result.reminder.schedule.timeZone), dependencies.now()))
    return result
  } catch {
    return { error: 'persistence-failed' }
  }
}
