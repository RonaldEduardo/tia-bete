import type { InsulinApplication } from '../../domain/insulin/insulinApplication'
import type { InsulinApplicationRepository } from './insulinApplicationRepository'
const mostRecent = (left: InsulinApplication, right: InsulinApplication) => right.occurredAt.localeCompare(left.occurredAt) || right.createdAt.localeCompare(left.createdAt) || right.id.localeCompare(left.id)
export const listInsulinHistory = async (repository: InsulinApplicationRepository) => (await repository.list()).sort(mostRecent)
