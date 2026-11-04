export const REMINDER_TYPES = ['glucose-reading', 'insulin', 'custom'] as const
export type ReminderType = typeof REMINDER_TYPES[number]

export type ReminderSchedule = {
  localTime: string
  daysOfWeek: number[]
  timeZone: string
  snoozeMinutes: number
  maxSnoozes: number
}

export type Reminder = {
  id: string
  type: ReminderType
  schedule: ReminderSchedule
  configurationRevision: number
  createdAt: string
}

export type CreateReminderInput = {
  type: string
  localTime: string
  daysOfWeek: number[]
  timeZone: string
  snoozeMinutes?: number
  maxSnoozes?: number
}

export type ReminderValidationCode = 'required' | 'invalid' | 'invalid-time-zone'
export type ReminderValidationErrors = Partial<Record<keyof CreateReminderInput | 'id' | 'createdAt', ReminderValidationCode>>

export const validateReminder = (input: CreateReminderInput): ReminderValidationErrors => {
  const errors: ReminderValidationErrors = {}
  if (!REMINDER_TYPES.includes(input.type as ReminderType)) errors.type = input.type ? 'invalid' : 'required'
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.localTime)) errors.localTime = input.localTime ? 'invalid' : 'required'
  if (!input.daysOfWeek.length || input.daysOfWeek.some(day => !Number.isInteger(day) || day < 0 || day > 6) || new Set(input.daysOfWeek).size !== input.daysOfWeek.length) errors.daysOfWeek = input.daysOfWeek.length ? 'invalid' : 'required'
  try { new Intl.DateTimeFormat('en-CA', { timeZone: input.timeZone }) } catch { errors.timeZone = input.timeZone ? 'invalid-time-zone' : 'required' }
  if (input.snoozeMinutes !== undefined && (!Number.isInteger(input.snoozeMinutes) || input.snoozeMinutes <= 0)) errors.snoozeMinutes = 'invalid'
  if (input.maxSnoozes !== undefined && (!Number.isInteger(input.maxSnoozes) || input.maxSnoozes < 0)) errors.maxSnoozes = 'invalid'
  return errors
}

export const createReminder = (input: CreateReminderInput, dependencies: { createId: () => string, now: () => string }): { reminder: Reminder } | { errors: ReminderValidationErrors } => {
  const errors = validateReminder(input)
  const id = dependencies.createId()
  const createdAt = dependencies.now()
  if (!id.trim()) errors.id = 'required'
  if (Number.isNaN(Date.parse(createdAt))) errors.createdAt = 'invalid'
  if (Object.keys(errors).length) return { errors }

  return {
    reminder: {
      id,
      type: input.type as ReminderType,
      schedule: {
        localTime: input.localTime,
        daysOfWeek: [...input.daysOfWeek].sort((a, b) => a - b),
        timeZone: input.timeZone,
        snoozeMinutes: input.snoozeMinutes ?? 10,
        maxSnoozes: input.maxSnoozes ?? 2
      },
      configurationRevision: 1,
      createdAt: new Date(createdAt).toISOString()
    }
  }
}
