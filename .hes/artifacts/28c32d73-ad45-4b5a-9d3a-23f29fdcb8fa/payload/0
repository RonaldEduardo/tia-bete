import { resolveLocalDateTime, validateGlucoseReading, type GlucoseContext, type GlucoseReadingInput, type GlucoseReadingValidationErrors } from './validateGlucoseReading'

export type GlucoseReading = {
  id: string
  glucoseMgDl: number
  occurredAt: string
  createdAt: string
  timeZone: string
  context?: GlucoseContext
}

export type CreateGlucoseReadingInput = GlucoseReadingInput & {
  id: string
  createdAt: string
}

export type CreateGlucoseReadingResult = { reading: GlucoseReading } | { errors: GlucoseReadingValidationErrors }

export const createGlucoseReading = (input: CreateGlucoseReadingInput): CreateGlucoseReadingResult => {
  const errors = validateGlucoseReading(input)
  if (!input.id.trim()) errors.id = 'required'
  if (Number.isNaN(Date.parse(input.createdAt))) errors.createdAt = 'invalid'
  if (Object.keys(errors).length) return { errors }

  const resolution = resolveLocalDateTime(input.date, input.time, input.timeZone)
  if ('error' in resolution) return { errors: { localDateTime: resolution.error } }

  return {
    reading: {
      id: input.id,
      glucoseMgDl: Number(input.value),
      occurredAt: resolution.occurredAt,
      createdAt: new Date(input.createdAt).toISOString(),
      timeZone: input.timeZone,
      context: input.context as GlucoseContext | undefined
    }
  }
}
