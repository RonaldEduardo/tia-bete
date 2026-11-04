import type { GlucoseReading } from '../../domain/glucose/glucoseReading'

export interface GlucoseReadingRepository {
  save(reading: GlucoseReading): Promise<void>
  list(): Promise<GlucoseReading[]>
}
