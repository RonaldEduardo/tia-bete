import { describe, expect, it } from 'vitest'

import { createGlucoseReading } from '../../../shared/domain/glucose/glucoseReading'
import { resolveLocalDateTime, validateGlucoseReading } from '../../../shared/domain/glucose/validateGlucoseReading'

describe('GlucoseReading', () => {
  it('preserves the measurement instant separately from its creation instant', () => {
    const result = createGlucoseReading({
      id: 'reading-1', value: '120', date: '2026-11-04', time: '08:30', timeZone: 'America/Sao_Paulo', createdAt: '2026-11-04T12:00:00.000Z', context: 'fasting'
    })

    expect(result).toEqual({
      reading: {
        id: 'reading-1', glucoseMgDl: 120, occurredAt: '2026-11-04T11:30:00.000Z', createdAt: '2026-11-04T12:00:00.000Z', timeZone: 'America/Sao_Paulo', context: 'fasting'
      }
    })
  })

  it('rejects invalid fields with domain codes instead of UI messages', () => {
    expect(validateGlucoseReading({ value: '0', date: '', time: '', timeZone: 'America/Sao_Paulo' })).toEqual({
      value: 'invalid', date: 'required', time: 'required'
    })
  })

  it('rejects nonexistent and ambiguous DST local times', () => {
    expect(resolveLocalDateTime('2026-03-08', '02:30', 'America/New_York')).toEqual({ error: 'nonexistent-local-time' })
    expect(resolveLocalDateTime('2026-11-01', '01:30', 'America/New_York')).toEqual({ error: 'ambiguous-local-time' })
  })

  it('preserves unique instants immediately before and after a DST transition', () => {
    expect(resolveLocalDateTime('2026-03-08', '01:59', 'America/New_York')).toEqual({ occurredAt: '2026-03-08T06:59:00.000Z' })
    expect(resolveLocalDateTime('2026-03-08', '03:00', 'America/New_York')).toEqual({ occurredAt: '2026-03-08T07:00:00.000Z' })
  })

  it('rejects an invalid IANA timezone without converting the local time', () => {
    expect(resolveLocalDateTime('2026-11-04', '08:30', 'America/Not-A-Place')).toEqual({ error: 'invalid-time-zone' })
  })

  it('preserves UTC local time without an offset', () => {
    expect(resolveLocalDateTime('2026-02-28', '23:59', 'UTC')).toEqual({ occurredAt: '2026-02-28T23:59:00.000Z' })
  })

  it('rejects the skipped date in a whole-day timezone transition', () => {
    expect(resolveLocalDateTime('2011-12-30', '12:00', 'Pacific/Apia')).toEqual({ error: 'nonexistent-local-time' })
  })

})
