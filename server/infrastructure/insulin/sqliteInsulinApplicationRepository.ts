import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import type { InsulinApplicationRepository } from '../../../shared/application/insulin/insulinApplicationRepository'
import type { InsulinApplication } from '../../../shared/domain/insulin/insulinApplication'
import type { SqliteMigration } from '../../infrastructure/glucose/sqliteGlucoseReadingRepository'

type Row = { id: string, insulin_type: InsulinApplication['type'], insulin_name: string, units: number, occurred_at: string, created_at: string, time_zone: string }
export class SqliteInsulinApplicationRepository implements InsulinApplicationRepository {
  private readonly database: DatabaseSync
  constructor(path: string, migrations: readonly SqliteMigration[]) { mkdirSync(dirname(path), { recursive: true }); this.database = new DatabaseSync(path); this.applyMigrations(migrations) }
  async save(application: InsulinApplication) { this.database.prepare('INSERT INTO insulin_applications (id, insulin_type, insulin_name, units, occurred_at, created_at, time_zone) VALUES (?, ?, ?, ?, ?, ?, ?)').run(application.id, application.type, application.name, application.units, application.occurredAt, application.createdAt, application.timeZone) }
  async list() { return (this.database.prepare('SELECT id, insulin_type, insulin_name, units, occurred_at, created_at, time_zone FROM insulin_applications').all() as unknown as Row[]).map(row => ({ id: row.id, type: row.insulin_type, name: row.insulin_name, units: row.units, occurredAt: row.occurred_at, createdAt: row.created_at, timeZone: row.time_zone })) }
  close() { this.database.close() }
  private applyMigrations(migrations: readonly SqliteMigration[]) { this.database.exec('CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY NOT NULL)'); for (const migration of migrations) { if (this.database.prepare('SELECT version FROM schema_migrations WHERE version = ?').get(migration.version)) continue; this.database.exec('BEGIN'); try { this.database.exec(migration.sql); this.database.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(migration.version); this.database.exec('COMMIT') } catch (error) { this.database.exec('ROLLBACK'); throw error } } }
}
