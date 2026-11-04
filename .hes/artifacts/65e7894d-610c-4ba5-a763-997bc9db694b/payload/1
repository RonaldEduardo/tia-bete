import type { GlucoseReading } from '../glucose/glucoseReading'
import type { Reminder } from './reminder'

export const OCCURRENCE_STATUSES = ['scheduled', 'due', 'snoozed', 'completed', 'ignored', 'expired', 'skipped'] as const
export type ReminderOccurrenceStatus = typeof OCCURRENCE_STATUSES[number]
export type ReminderSkipReason = 'nonexistent-local-time' | 'ambiguous-local-time'
export type CompletionEvidence = { kind: 'manual', confirmedAt: string } | { kind: 'glucose-reading', glucoseReadingId: string, confirmedAt: string }

export type ReminderOccurrence = {
  id: string
  reminderId: string
  configurationRevision: number
  localDate: string
  localTime: string
  timeZone: string
  scheduledFor: string | null
  nextActionAt: string | null
  expiresAt: string | null
  status: ReminderOccurrenceStatus
  snoozeCount: number
  skipReason?: ReminderSkipReason
  completionEvidence?: CompletionEvidence
}

type LocalResolution = { scheduledFor: string } | { skipReason: ReminderSkipReason }
const formatParts = (timestamp: number, timeZone: string) => Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
  timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
}).formatToParts(new Date(timestamp)).filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, value]))
const offsetAt = (timestamp: number, timeZone: string) => {
  const parts = formatParts(timestamp, timeZone)
  return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second)) - timestamp
}
const resolveLocalSchedule = (date: string, time: string, timeZone: string): LocalResolution => {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  const localTimestamp = Date.UTC(year!, month! - 1, day!, hour!, minute!)
  const offsets = new Set([localTimestamp - 86_400_000, localTimestamp, localTimestamp + 86_400_000].map(timestamp => offsetAt(timestamp, timeZone)))
  const candidates = [...offsets].map(offset => localTimestamp - offset).filter(timestamp => {
    const parts = formatParts(timestamp, timeZone)
    return `${parts.year}-${parts.month}-${parts.day}` === date && `${parts.hour}:${parts.minute}` === time
  })
  if (!candidates.length) return { skipReason: 'nonexistent-local-time' }
  if (candidates.length > 1) return { skipReason: 'ambiguous-local-time' }
  return { scheduledFor: new Date(candidates[0]!).toISOString() }
}
const occurrenceId = (reminder: Reminder, localDate: string) => `${reminder.id}:${reminder.configurationRevision}:${localDate}:${reminder.schedule.localTime}`
const isScheduledDay = (localDate: string, reminder: Reminder) => reminder.schedule.daysOfWeek.includes(new Date(`${localDate}T00:00:00.000Z`).getUTCDay())
const terminal = (status: ReminderOccurrenceStatus) => ['completed', 'ignored', 'expired', 'skipped'].includes(status)

export const advanceOccurrence = (occurrence: ReminderOccurrence, now: string): ReminderOccurrence => {
  if (terminal(occurrence.status)) return occurrence
  if (occurrence.expiresAt && Date.parse(now) >= Date.parse(occurrence.expiresAt)) return { ...occurrence, status: 'expired', nextActionAt: null }
  if (occurrence.nextActionAt && Date.parse(now) >= Date.parse(occurrence.nextActionAt)) return { ...occurrence, status: 'due' }
  return occurrence
}

export const generateOccurrences = (reminder: Reminder, localDates: readonly string[], now: string): ReminderOccurrence[] => [...new Set(localDates)].sort().filter(localDate => isScheduledDay(localDate, reminder)).map(localDate => {
  const resolution = resolveLocalSchedule(localDate, reminder.schedule.localTime, reminder.schedule.timeZone)
  if ('skipReason' in resolution) return {
    id: occurrenceId(reminder, localDate), reminderId: reminder.id, configurationRevision: reminder.configurationRevision,
    localDate, localTime: reminder.schedule.localTime, timeZone: reminder.schedule.timeZone, scheduledFor: null, nextActionAt: null, expiresAt: null,
    status: 'skipped' as const, snoozeCount: 0, skipReason: resolution.skipReason
  }
  const expiresAt = new Date(Date.parse(resolution.scheduledFor) + 86_400_000).toISOString()
  return advanceOccurrence({
    id: occurrenceId(reminder, localDate), reminderId: reminder.id, configurationRevision: reminder.configurationRevision,
    localDate, localTime: reminder.schedule.localTime, timeZone: reminder.schedule.timeZone, scheduledFor: resolution.scheduledFor,
    nextActionAt: resolution.scheduledFor, expiresAt, status: 'scheduled', snoozeCount: 0
  }, now)
})

export const snoozeOccurrence = (occurrence: ReminderOccurrence, now: string, snoozeMinutes: number, maxSnoozes: number): { occurrence: ReminderOccurrence } | { error: 'not-due' | 'limit-reached' } => {
  const current = advanceOccurrence(occurrence, now)
  if (current.status !== 'due') return { error: 'not-due' }
  if (current.snoozeCount >= maxSnoozes) return { error: 'limit-reached' }
  return { occurrence: { ...current, status: 'snoozed', snoozeCount: current.snoozeCount + 1, nextActionAt: new Date(Date.parse(now) + snoozeMinutes * 60_000).toISOString() } }
}

export const ignoreOccurrence = (occurrence: ReminderOccurrence, now: string): { occurrence: ReminderOccurrence } | { error: 'not-due' } => {
  const current = advanceOccurrence(occurrence, now)
  return current.status === 'due' ? { occurrence: { ...current, status: 'ignored', nextActionAt: null } } : { error: 'not-due' }
}

export const completeOccurrence = (occurrence: ReminderOccurrence, now: string): { occurrence: ReminderOccurrence } | { error: 'not-due' } => {
  const current = advanceOccurrence(occurrence, now)
  return current.status === 'due' ? { occurrence: { ...current, status: 'completed', nextActionAt: null, completionEvidence: { kind: 'manual', confirmedAt: now } } } : { error: 'not-due' }
}

export const completeCompatibleGlucoseOccurrence = (occurrences: readonly ReminderOccurrence[], reminder: Reminder, reading: GlucoseReading, now: string): ReminderOccurrence | undefined => {
  if (reminder.type !== 'glucose-reading') return undefined
  const occurredAt = Date.parse(reading.occurredAt)
  const candidates = occurrences.map(occurrence => advanceOccurrence(occurrence, now)).filter(occurrence =>
    occurrence.reminderId === reminder.id && occurrence.configurationRevision === reminder.configurationRevision &&
    ['scheduled', 'due', 'snoozed'].includes(occurrence.status) && occurrence.scheduledFor !== null &&
    occurredAt >= Date.parse(occurrence.scheduledFor) - 30 * 60_000 && occurredAt <= Date.parse(occurrence.scheduledFor) + 60 * 60_000
  ).sort((left, right) => {
    const distance = Math.abs(occurredAt - Date.parse(left.scheduledFor!)) - Math.abs(occurredAt - Date.parse(right.scheduledFor!))
    return distance || left.scheduledFor!.localeCompare(right.scheduledFor!) || left.id.localeCompare(right.id)
  })
  const selected = candidates[0]
  return selected && { ...selected, status: 'completed', nextActionAt: null, completionEvidence: { kind: 'glucose-reading', glucoseReadingId: reading.id, confirmedAt: now } }
}
