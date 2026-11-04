import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

import type { GlucoseReadingRepository } from '../../../shared/application/glucose/glucoseReadingRepository'
import type { GlucoseReading } from '../../../shared/domain/glucose/glucoseReading'

export type SqliteMigration = { version: string, sql: string }

type StoredGlucoseReading = {
  id: string
  glucose_mg_dl: number
  occurred_at: string
  created_at: string
  time_zone: string
  context: GlucoseReading['context'] | null
}

export class SqliteGlucoseReadingRepository implements GlucoseReadingRepository {
  private readonly database: DatabaseSync

  constructor(path: string, migrations: readonly SqliteMigration[]) {
    mkdirSync(dirname(path), { recursive: true })
    this.database = new DatabaseSync(path)
    this.applyMigrations(migrations)
  }

  async save(reading: GlucoseReading) {
    this.database.prepare(`
      INSERT INTO glucose_readings (id, glucose_mg_dl, occurred_at, created_at, time_zone, context)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(reading.id, reading.glucoseMgDl, reading.occurredAt, reading.createdAt, reading.timeZone, reading.context ?? null)
  }

  async list(): Promise<GlucoseReading[]> {
    const rows = this.database.prepare(`
      SELECT id, glucose_mg_dl, occurred_at, created_at, time_zone, context
      FROM glucose_readings
    `).all() as unknown as StoredGlucoseReading[]

    return rows.map(row => ({
      id: row.id,
      glucoseMgDl: row.glucose_mg_dl,
      occurredAt: row.occurred_at,
      createdAt: row.created_at,
      timeZone: row.time_zone,
      context: row.context ?? undefined
    }))
  }

  close() {
    this.database.close()
  }

  private applyMigrations(migrations: readonly SqliteMigration[]) {
    this.database.exec('CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY NOT NULL)')

    for (const migration of migrations) {
      const applied = this.database.prepare('SELECT version FROM schema_migrations WHERE version = ?').get(migration.version)
      if (applied) continue

      this.database.exec('BEGIN')
      try {
        this.database.exec(migration.sql)
        this.database.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(migration.version)
        this.database.exec('COMMIT')
      } catch (error) {
        this.database.exec('ROLLBACK')
        throw error
      }
    }
  }
}
