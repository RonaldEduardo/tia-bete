import { join } from 'node:path'

import { assets } from '#nitro-internal-virtual/server-assets'

import { SqliteGlucoseReminderTransaction } from '../infrastructure/glucose/sqliteGlucoseReminderTransaction'

let transaction: Promise<SqliteGlucoseReminderTransaction> | undefined

const createTransaction = async () => {
  const [glucose, reminders, completion] = await Promise.all([
    assets.getItem<string>('migrations/001_create_glucose_readings.sql'),
    assets.getItem<string>('reminder-migrations/002_create_reminders.sql'),
    assets.getItem<string>('reminder-migrations/003_glucose_completion_idempotency.sql')
  ])
  if (!glucose || !reminders || !completion) throw new Error('Migrations locais de glicemia e lembretes não foram encontradas no pacote do servidor.')
  return new SqliteGlucoseReminderTransaction(
    process.env.TIA_BETE_DB_PATH || join(process.cwd(), '.data', 'tia-bete.sqlite'),
    [{ version: '001', sql: glucose }, { version: '002', sql: reminders }, { version: '003', sql: completion }]
  )
}

export const getGlucoseReminderTransaction = () => transaction ??= createTransaction()
