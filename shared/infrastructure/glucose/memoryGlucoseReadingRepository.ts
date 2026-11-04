import type { GlucoseReading } from '../../domain/glucose/glucoseReading'
import type { GlucoseReadingRepository } from '../../application/glucose/glucoseReadingRepository'

export class MemoryGlucoseReadingRepository implements GlucoseReadingRepository {
  private readonly readings: GlucoseReading[] = []

  async save(reading: GlucoseReading) {
    this.readings.push(reading)
  }

  async list() {
    return [...this.readings]
  }
}
