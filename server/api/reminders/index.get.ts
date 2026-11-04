import { getReminderRepository } from '../../utils/reminderRepository'

export default defineEventHandler(async () => (await getReminderRepository()).listReminders())
