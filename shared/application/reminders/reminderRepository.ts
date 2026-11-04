import type { ReminderOccurrence } from '../../domain/reminders/reminderOccurrence'
import type { Reminder } from '../../domain/reminders/reminder'

export interface ReminderRepository {
  saveReminder(reminder: Reminder): Promise<void>
  listReminders(): Promise<Reminder[]>
  getReminder(id: string): Promise<Reminder | undefined>
  insertOccurrences(occurrences: readonly ReminderOccurrence[]): Promise<void>
  listOccurrences(): Promise<ReminderOccurrence[]>
  getOccurrence(id: string): Promise<ReminderOccurrence | undefined>
  updateOccurrence(occurrence: ReminderOccurrence): Promise<void>
}
