import { listInsulinHistory } from '../../../shared/application/insulin/listInsulinHistory'
import { getInsulinRepository } from '../../utils/insulinRepository'
export default defineEventHandler(async () => listInsulinHistory(await getInsulinRepository()))
