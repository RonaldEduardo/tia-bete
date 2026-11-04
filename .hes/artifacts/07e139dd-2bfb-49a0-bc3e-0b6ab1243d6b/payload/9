import { createError, readBody } from 'h3'
import { recordInsulinApplication } from '../../../shared/application/insulin/recordInsulinApplication'
import type { InsulinApplicationInput } from '../../../shared/domain/insulin/validateInsulinApplication'
import { getInsulinRepository } from '../../utils/insulinRepository'
const toInput = (body: unknown): InsulinApplicationInput => {
  const value = body && typeof body === 'object' ? body as Record<string, unknown> : {}
  return { type: typeof value.type === 'string' ? value.type : '', name: typeof value.name === 'string' ? value.name : '', units: typeof value.units === 'string' ? value.units : '', date: typeof value.date === 'string' ? value.date : '', time: typeof value.time === 'string' ? value.time : '', timeZone: typeof value.timeZone === 'string' ? value.timeZone : '' }
}
export default defineEventHandler(async event => {
  const result = await recordInsulinApplication(toInput(await readBody(event)), await getInsulinRepository(), { now: () => new Date().toISOString(), createId: () => crypto.randomUUID() })
  if ('errors' in result) throw createError({ statusCode: 422, statusMessage: 'Invalid input', message: 'Dados inválidos', data: { errors: result.errors } })
  if ('error' in result) throw createError({ statusCode: 503, statusMessage: 'Service Unavailable', message: 'Não foi possível salvar a aplicação local.' })
  return result.application
})
