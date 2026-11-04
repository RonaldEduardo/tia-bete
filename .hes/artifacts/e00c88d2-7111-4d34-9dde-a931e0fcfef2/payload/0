import type { Reminder } from '../../domain/reminders/reminder'
import type { ReminderOccurrence } from '../../domain/reminders/reminderOccurrence'
import type { GlucoseReading } from '../../domain/glucose/glucoseReading'

export interface GlucoseReminderTransaction {
  saveReading(reading: GlucoseReading): Promise<void>
  listReminders(): Promise<Reminder[]>
  listOccurrences(): Promise<ReminderOccurrence[]>
  updateOccurrence(occurrence: ReminderOccurrence): Promise<void>
}

export interface GlucoseReminderTransactionRunner {
  runInTransaction<T>(operation: (transaction: GlucoseReminderTransaction) => Promise<T>): Promise<T>
}
