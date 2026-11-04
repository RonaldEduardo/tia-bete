import { resolveLocalDateTime } from '../glucose/validateGlucoseReading'
import { validateInsulinApplication, type InsulinApplicationInput, type InsulinApplicationValidationErrors, type InsulinType } from './validateInsulinApplication'

export type InsulinApplication = { id: string, type: InsulinType, name: string, units: number, occurredAt: string, createdAt: string, timeZone: string }
export type CreateInsulinApplicationInput = InsulinApplicationInput & { id: string, createdAt: string }
export type CreateInsulinApplicationResult = { application: InsulinApplication } | { errors: InsulinApplicationValidationErrors }

export const createInsulinApplication = (input: CreateInsulinApplicationInput): CreateInsulinApplicationResult => {
  const errors = validateInsulinApplication(input)
  if (!input.id.trim()) errors.id = 'required'
  if (Number.isNaN(Date.parse(input.createdAt))) errors.createdAt = 'invalid'
  if (Object.keys(errors).length) return { errors }
  const resolution = resolveLocalDateTime(input.date, input.time, input.timeZone)
  if ('error' in resolution) return { errors: { localDateTime: resolution.error } }
  return { application: { id: input.id, type: input.type as InsulinType, name: input.name.trim(), units: Number(input.units), occurredAt: resolution.occurredAt, createdAt: new Date(input.createdAt).toISOString(), timeZone: input.timeZone } }
}
