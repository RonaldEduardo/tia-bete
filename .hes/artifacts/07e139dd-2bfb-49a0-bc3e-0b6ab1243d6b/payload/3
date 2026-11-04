import { createInsulinApplication, type CreateInsulinApplicationResult } from '../../domain/insulin/insulinApplication'
import type { InsulinApplicationInput } from '../../domain/insulin/validateInsulinApplication'
import type { InsulinApplicationRepository } from './insulinApplicationRepository'

type Dependencies = { now: () => string, createId: () => string }
export type RecordInsulinApplicationResult = CreateInsulinApplicationResult | { error: 'persistence-failed' }
export const recordInsulinApplication = async (input: InsulinApplicationInput, repository: InsulinApplicationRepository, dependencies: Dependencies): Promise<RecordInsulinApplicationResult> => {
  const result = createInsulinApplication({ ...input, id: dependencies.createId(), createdAt: dependencies.now() })
  if ('errors' in result) return result
  try { await repository.save(result.application); return result } catch { return { error: 'persistence-failed' } }
}
