import { createError, readBody } from 'h3'

import { createLocalReminder } from '../../../shared/application/reminders/createLocalReminder'
import type { CreateReminderInput, ReminderValidationErrors } from '../../../shared/domain/reminders/reminder'
import { getReminderRepository } from '../../utils/reminderRepository'

const toInput = (body: unknown): CreateReminderInput => {
  const input = body && typeof body === 'object' ? body as Record<string, unknown> : {}
  return {
    type: typeof input.type === 'string' ? input.type : '',
    localTime: typeof input.localTime === 'string' ? input.localTime : '',
    daysOfWeek: Array.isArray(input.daysOfWeek) ? input.daysOfWeek : [],
    timeZone: typeof input.timeZone === 'string' ? input.timeZone : '',
    snoozeMinutes: typeof input.snoozeMinutes === 'number' ? input.snoozeMinutes : undefined,
    maxSnoozes: typeof input.maxSnoozes === 'number' ? input.maxSnoozes : undefined
  }
}

export default defineEventHandler(async event => {
  const result = await createLocalReminder(toInput(await readBody(event)), await getReminderRepository(), { now: () => new Date().toISOString(), createId: () => crypto.randomUUID() })
  if ('errors' in result) throw createError({ statusCode: 422, statusMessage: 'Invalid input', message: 'Dados inválidos', data: { errors: result.errors satisfies ReminderValidationErrors } })
  if ('error' in result) throw createError({ statusCode: 503, statusMessage: 'Service Unavailable', message: 'Não foi possível salvar o lembrete local.' })
  return result.reminder
})
