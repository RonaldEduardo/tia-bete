import { join } from 'node:path'
import { assets } from '#nitro-internal-virtual/server-assets'
import { SqliteInsulinApplicationRepository } from '../infrastructure/insulin/sqliteInsulinApplicationRepository'
let repository: Promise<SqliteInsulinApplicationRepository> | undefined
const createRepository = async () => {
  const migration = await assets.getItem<string>('insulin-migrations/004_create_insulin_applications.sql')
  if (!migration) throw new Error('Migration 004 de insulina não foi encontrada no pacote do servidor.')
  return new SqliteInsulinApplicationRepository(process.env.TIA_BETE_DB_PATH || join(process.cwd(), '.data', 'tia-bete.sqlite'), [{ version: '004', sql: migration }])
}
export const getInsulinRepository = () => repository ??= createRepository()
