import { createError, readBody } from 'h3'

import { ignoreReminderOccurrence } from '../../../shared/application/reminders/actOnReminderOccurrence'
import { getReminderRepository } from '../../utils/reminderRepository'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const id = body && typeof body === 'object' && typeof (body as Record<string, unknown>).id === 'string' ? (body as Record<string, string>).id : ''
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid occurrence', message: 'Ocorrência inválida.' })
  const result = await ignoreReminderOccurrence(id, await getReminderRepository(), new Date().toISOString())
  if ('error' in result) {
    const statusCode = result.error === 'not-found' ? 404 : result.error === 'persistence-failed' ? 503 : 409
    throw createError({ statusCode, statusMessage: result.error, message: 'Esta ocorrência não pode ser ignorada agora.' })
  }
  return result.occurrence
})
