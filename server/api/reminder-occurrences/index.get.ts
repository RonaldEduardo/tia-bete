import { createError } from 'h3'

import { reconcileReminderOccurrences } from '../../../shared/application/reminders/reconcileReminderOccurrences'
import { getReminderRepository } from '../../utils/reminderRepository'

export default defineEventHandler(async () => {
  const result = await reconcileReminderOccurrences(await getReminderRepository(), new Date().toISOString())
  if ('error' in result) throw createError({ statusCode: 503, statusMessage: 'Service Unavailable', message: 'Não foi possível atualizar os lembretes locais.' })
  return result.occurrences
})
