import { resolveLocalDateTime } from '../glucose/validateGlucoseReading'

export const INSULIN_TYPES = ['basal', 'rapid'] as const
export type InsulinType = typeof INSULIN_TYPES[number]
export type InsulinApplicationInput = { type: string, name: string, units: string, date: string, time: string, timeZone: string }
export type InsulinApplicationValidationCode = 'required' | 'invalid' | 'invalid-time-zone' | 'nonexistent-local-time' | 'ambiguous-local-time'
export type InsulinApplicationValidationErrors = Partial<Record<keyof InsulinApplicationInput | 'localDateTime' | 'id' | 'createdAt', InsulinApplicationValidationCode>>

const validDate = (date: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  const [year, month, day] = date.split('-').map(Number)
  const candidate = new Date(Date.UTC(year!, month! - 1, day!))
  return candidate.getUTCFullYear() === year && candidate.getUTCMonth() === month! - 1 && candidate.getUTCDate() === day
}
const validTime = (time: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time)

export const validateInsulinApplication = ({ type, name, units, date, time, timeZone }: InsulinApplicationInput): InsulinApplicationValidationErrors => {
  const errors: InsulinApplicationValidationErrors = {}
  if (!INSULIN_TYPES.includes(type as InsulinType)) errors.type = type ? 'invalid' : 'required'
  if (!name.trim()) errors.name = 'required'
  if (!units.trim()) errors.units = 'required'
  else if (!Number.isFinite(Number(units)) || Number(units) <= 0) errors.units = 'invalid'
  if (!date) errors.date = 'required'
  else if (!validDate(date)) errors.date = 'invalid'
  if (!time) errors.time = 'required'
  else if (!validTime(time)) errors.time = 'invalid'
  if (date && time && validDate(date) && validTime(time)) {
    const resolution = resolveLocalDateTime(date, time, timeZone)
    if ('error' in resolution) errors.localDateTime = resolution.error
  }
  return errors
}
