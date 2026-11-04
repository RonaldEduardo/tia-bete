import { join } from 'node:path'

import { assets } from '#nitro-internal-virtual/server-assets'

import { SqliteReminderRepository } from '../infrastructure/reminders/sqliteReminderRepository'

let repository: Promise<SqliteReminderRepository> | undefined

const createRepository = async () => {
  const migration = await assets.getItem<string>('reminder-migrations/002_create_reminders.sql')
  if (!migration) throw new Error('Migration 002 de lembretes não foi encontrada no pacote do servidor.')
  return new SqliteReminderRepository(process.env.TIA_BETE_DB_PATH || join(process.cwd(), '.data', 'tia-bete.sqlite'), [{ version: '002', sql: migration }])
}

export const getReminderRepository = () => repository ??= createRepository()
