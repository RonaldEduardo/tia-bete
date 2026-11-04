import { createGlucoseReading, type CreateGlucoseReadingResult } from '../../domain/glucose/glucoseReading'
import type { GlucoseReadingInput } from '../../domain/glucose/validateGlucoseReading'
import type { GlucoseReadingRepository } from './glucoseReadingRepository'

type RecordDependencies = {
  now: () => string
  createId: () => string
}

export type RecordGlucoseReadingResult = CreateGlucoseReadingResult | { error: 'persistence-failed' }

export const recordGlucoseReading = async (
  input: GlucoseReadingInput,
  repository: GlucoseReadingRepository,
  dependencies: RecordDependencies
): Promise<RecordGlucoseReadingResult> => {
  const result = createGlucoseReading({ ...input, id: dependencies.createId(), createdAt: dependencies.now() })
  if ('errors' in result) return result

  try {
    await repository.save(result.reading)
    return result
  } catch {
    return { error: 'persistence-failed' }
  }
}
