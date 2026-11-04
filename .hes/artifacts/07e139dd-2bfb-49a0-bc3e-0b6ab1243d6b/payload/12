import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { recordInsulinApplication } from '../../../shared/application/insulin/recordInsulinApplication'
import { listInsulinHistory } from '../../../shared/application/insulin/listInsulinHistory'
import { SqliteInsulinApplicationRepository } from '../../../server/infrastructure/insulin/sqliteInsulinApplicationRepository'
const sql = readFileSync(resolve(process.cwd(), 'server/infrastructure/insulin/migrations/004_create_insulin_applications.sql'), 'utf8'); const migrations = [{ version: '004', sql }]; const directories: string[] = []
const open = (path?: string) => { const directory = path ? undefined : mkdtempSync(join(tmpdir(), 'tia-bete-insulin-')); if (directory) directories.push(directory); const databasePath = path ?? join(directory!, 'insulin.sqlite'); return { path: databasePath, repository: new SqliteInsulinApplicationRepository(databasePath, migrations) } }
afterEach(() => directories.splice(0).forEach(directory => rmSync(directory, { recursive: true, force: true })))
const input = (type: string, time: string) => ({ type, name: `Insulina ${type}`, units: '8', date: '2026-11-04', time, timeZone: 'UTC' })
describe('SqliteInsulinApplicationRepository', () => {
  it('persists basal and rapid applications across restart ordered by effective time', async () => { const { path, repository: first } = open(); await recordInsulinApplication(input('basal', '08:00'), first, { now: () => '2026-11-04T09:00:00.000Z', createId: () => 'a' }); first.close(); const second = open(path).repository; await recordInsulinApplication(input('rapid', '09:00'), second, { now: () => '2026-11-04T10:00:00.000Z', createId: () => 'b' }); expect((await listInsulinHistory(second)).map(item => item.id)).toEqual(['b', 'a']); second.close() })
})
