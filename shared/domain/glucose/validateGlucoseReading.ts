export const GLUCOSE_CONTEXTS = ['fasting', 'pre_meal', 'post_meal', 'bedtime', 'other'] as const

export type GlucoseContext = typeof GLUCOSE_CONTEXTS[number]
export type GlucoseReadingInput = {
  value: string
  date: string
  time: string
  timeZone: string
  context?: string
}
export type GlucoseReadingValidationCode =
  | 'required'
  | 'invalid'
  | 'invalid-time-zone'
  | 'nonexistent-local-time'
  | 'ambiguous-local-time'
export type GlucoseReadingValidationErrors = Partial<Record<keyof GlucoseReadingInput | 'localDateTime' | 'id' | 'createdAt', GlucoseReadingValidationCode>>

type LocalTimeResolution = { occurredAt: string } | { error: 'invalid-time-zone' | 'nonexistent-local-time' | 'ambiguous-local-time' }

const dateIsValid = (date: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  const [year = Number.NaN, month = Number.NaN, day = Number.NaN] = date.split('-').map(Number)
  const candidate = new Date(Date.UTC(year, month - 1, day))
  return candidate.getUTCFullYear() === year && candidate.getUTCMonth() === month - 1 && candidate.getUTCDate() === day
}

const timeIsValid = (time: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time)

const formatParts = (timestamp: number, timeZone: string) => Object.fromEntries(
  new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date(timestamp)).filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, value])
)

const offsetAt = (timestamp: number, timeZone: string) => {
  const parts = formatParts(timestamp, timeZone)
  return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second)) - timestamp
}

export const resolveLocalDateTime = (date: string, time: string, timeZone: string): LocalTimeResolution => {
  try {
    if (!dateIsValid(date) || !timeIsValid(time)) return { error: 'nonexistent-local-time' }
    new Intl.DateTimeFormat('en-CA', { timeZone })
  } catch {
    return { error: 'invalid-time-zone' }
  }

  const [year = Number.NaN, month = Number.NaN, day = Number.NaN] = date.split('-').map(Number)
  const [hour = Number.NaN, minute = Number.NaN] = time.split(':').map(Number)
  const localTimestamp = Date.UTC(year, month - 1, day, hour, minute)
  // shortcut: offsets are sampled one day around the requested local time; upgrade to Temporal when historical zone transitions beyond that window are supported.
  const offsets = new Set([localTimestamp - 86_400_000, localTimestamp, localTimestamp + 86_400_000].map(timestamp => offsetAt(timestamp, timeZone)))
  const candidates = [...offsets]
    .map(offset => localTimestamp - offset)
    .filter(timestamp => {
      const parts = formatParts(timestamp, timeZone)
      return `${parts.year}-${parts.month}-${parts.day}` === date && `${parts.hour}:${parts.minute}` === time
    })

  if (!candidates.length) return { error: 'nonexistent-local-time' }
  if (candidates.length > 1) return { error: 'ambiguous-local-time' }
  return { occurredAt: new Date(candidates[0]!).toISOString() }
}

export const validateGlucoseReading = ({ value, date, time, timeZone, context }: GlucoseReadingInput): GlucoseReadingValidationErrors => {
  const errors: GlucoseReadingValidationErrors = {}

  if (!value.trim()) errors.value = 'required'
  else if (!Number.isFinite(Number(value)) || Number(value) <= 0) errors.value = 'invalid'
  if (!date) errors.date = 'required'
  else if (!dateIsValid(date)) errors.date = 'invalid'
  if (!time) errors.time = 'required'
  else if (!timeIsValid(time)) errors.time = 'invalid'
  if (context && !GLUCOSE_CONTEXTS.includes(context as GlucoseContext)) errors.context = 'invalid'

  if (date && time && dateIsValid(date) && timeIsValid(time)) {
    const resolution = resolveLocalDateTime(date, time, timeZone)
    if ('error' in resolution) errors.localDateTime = resolution.error
  }

  return errors
}
