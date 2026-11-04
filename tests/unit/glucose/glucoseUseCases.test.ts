import { describe, expect, it } from 'vitest'

import type { GlucoseReadingRepository } from '../../../shared/application/glucose/glucoseReadingRepository'
import { listGlucoseHistory } from '../../../shared/application/glucose/listGlucoseHistory'
import { recordGlucoseReading } from '../../../shared/application/glucose/recordGlucoseReading'
import { MemoryGlucoseReadingRepository } from '../../../shared/infrastructure/glucose/memoryGlucoseReadingRepository'

describe('glucose use cases', () => {
  it('stores valid temporary readings and lists them by occurredAt, createdAt, then id', async () => {
    const repository = new MemoryGlucoseReadingRepository()
    const ids = ['a', 'b', 'c']
    const dependencies = { now: () => '2026-11-04T12:00:00.000Z', createId: () => ids.shift()! }

    for (const time of ['08:00', '09:00', '09:00']) {
      await expect(recordGlucoseReading({ value: '120', date: '2026-11-04', time, timeZone: 'America/Sao_Paulo' }, repository, dependencies)).resolves.toHaveProperty('reading')
    }

    expect((await listGlucoseHistory(repository)).map(({ id }) => id)).toEqual(['c', 'b', 'a'])
  })

  it('does not store an invalid reading', async () => {
    const repository = new MemoryGlucoseReadingRepository()
    const result = await recordGlucoseReading(
      { value: '-1', date: '2026-11-04', time: '08:00', timeZone: 'America/Sao_Paulo' },
      repository,
      { now: () => '2026-11-04T12:00:00.000Z', createId: () => 'reading-1' }
    )

    expect(result).toEqual({ errors: { value: 'invalid' } })
    expect(await listGlucoseHistory(repository)).toEqual([])
  })

  it('returns a persistence failure instead of a false success', async () => {
    const repository: GlucoseReadingRepository = {
      save: async () => { throw new Error('disk unavailable') },
      list: async () => []
    }

    await expect(recordGlucoseReading(
      { value: '120', date: '2026-11-04', time: '08:00', timeZone: 'America/Sao_Paulo' },
      repository,
      { now: () => '2026-11-04T12:00:00.000Z', createId: () => 'reading-1' }
    )).resolves.toEqual({ error: 'persistence-failed' })
  })
})
