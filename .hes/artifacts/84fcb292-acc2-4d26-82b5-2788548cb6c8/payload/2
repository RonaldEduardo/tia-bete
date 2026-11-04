import { join } from 'node:path'

import { assets } from '#nitro-internal-virtual/server-assets'

import { SqliteGlucoseReadingRepository } from '../infrastructure/glucose/sqliteGlucoseReadingRepository'

let repository: Promise<SqliteGlucoseReadingRepository> | undefined

const createRepository = async () => {
  const migration = await assets.getItem<string>('migrations/001_create_glucose_readings.sql')
  if (!migration) throw new Error('Migration 001 de glicemia não foi encontrada no pacote do servidor.')

  return new SqliteGlucoseReadingRepository(
    process.env.TIA_BETE_DB_PATH || join(process.cwd(), '.data', 'tia-bete.sqlite'),
    [{ version: '001', sql: migration }]
  )
}

export const getGlucoseRepository = () => repository ??= createRepository()
