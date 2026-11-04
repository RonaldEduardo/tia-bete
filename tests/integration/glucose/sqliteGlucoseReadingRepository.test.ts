import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { listGlucoseHistory } from '../../../shared/application/glucose/listGlucoseHistory'
import { recordGlucoseReading } from '../../../shared/application/glucose/recordGlucoseReading'
import { MemoryGlucoseReadingRepository } from '../../../shared/infrastructure/glucose/memoryGlucoseReadingRepository'
import { SqliteGlucoseReadingRepository } from '../../../server/infrastructure/glucose/sqliteGlucoseReadingRepository'

const migration = readFileSync(resolve(process.cwd(), 'server/infrastructure/glucose/migrations/001_create_glucose_readings.sql'), 'utf8')
const migrations = [{ version: '001', sql: migration }]
const directories: string[] = []
const createRepository = () => {
  const directory = mkdtempSync(join(tmpdir(), 'tia-bete-'))
  directories.push(directory)
  const path = join(directory, 'glucose.sqlite')
  return { path, repository: new SqliteGlucoseReadingRepository(path, migrations) }
}
const readingInput = (time: string) => ({ value: '120', date: '2026-11-04', time, timeZone: 'America/Sao_Paulo' })
const dependencies = (ids: string[]) => ({ now: () => '2026-11-04T12:00:00.000Z', createId: () => ids.shift()! })

afterEach(() => directories.splice(0).forEach(directory => rmSync(directory, { recursive: true, force: true })))

describe('SqliteGlucoseReadingRepository', () => {
  it('persists a reading when a fresh client reloads its history', async () => {
    const { path, repository: writer } = createRepository()
    await recordGlucoseReading(readingInput('08:00'), writer, dependencies(['reading-1']))
    writer.close()

    // A fresh database instance models a new backend process reading the same file.
    const reader = new SqliteGlucoseReadingRepository(path, migrations)
    expect((await listGlucoseHistory(reader)).map(reading => reading.id)).toEqual(['reading-1'])
    reader.close()
  })

  it('preserves readings after a server repository restart and re-applies migrations safely', async () => {
    const { path, repository: firstServer } = createRepository()
    await recordGlucoseReading(readingInput('08:00'), firstServer, dependencies(['reading-1']))
    firstServer.close()

    const restartedServer = new SqliteGlucoseReadingRepository(path, migrations)
    await recordGlucoseReading(readingInput('09:00'), restartedServer, dependencies(['reading-2']))
    expect((await listGlucoseHistory(restartedServer)).map(reading => reading.id)).toEqual(['reading-2', 'reading-1'])
    restartedServer.close()
  })

  it('keeps the same history semantics as the memory adapter', async () => {
    const { repository: sqlite } = createRepository()
    const memory = new MemoryGlucoseReadingRepository()

    for (const repository of [sqlite, memory]) {
      const ids = ['a', 'b', 'c']
      for (const time of ['08:00', '09:00', '09:00']) await recordGlucoseReading(readingInput(time), repository, dependencies(ids))
      expect((await listGlucoseHistory(repository)).map(reading => reading.id)).toEqual(['c', 'b', 'a'])
    }

    sqlite.close()
  })
})
