import type { GlucoseReading } from '../../domain/glucose/glucoseReading'
import type { GlucoseReadingRepository } from './glucoseReadingRepository'

const byMostRecent = (left: GlucoseReading, right: GlucoseReading) =>
  right.occurredAt.localeCompare(left.occurredAt) || right.createdAt.localeCompare(left.createdAt) || right.id.localeCompare(left.id)

export const listGlucoseHistory = async (repository: GlucoseReadingRepository) => (await repository.list()).sort(byMostRecent)
