import { describe, expect, it } from 'vitest'
import { createInsulinApplication } from '../../../shared/domain/insulin/insulinApplication'
import { recordInsulinApplication } from '../../../shared/application/insulin/recordInsulinApplication'
import { MemoryInsulinApplicationRepository } from '../../../shared/infrastructure/insulin/memoryInsulinApplicationRepository'
const input = (type = 'basal') => ({ type, name: 'Insulina sintética', units: '12.5', date: '2026-11-04', time: '08:30', timeZone: 'UTC' })
const dependencies = { now: () => '2026-11-04T09:00:00.000Z', createId: () => 'application-1' }
describe('InsulinApplication', () => {
  it.each(['basal', 'rapid'])('creates a valid manual %s application', type => expect(createInsulinApplication({ ...input(type), id: 'application-1', createdAt: dependencies.now() })).toMatchObject({ application: { type, units: 12.5, occurredAt: '2026-11-04T08:30:00.000Z', createdAt: dependencies.now() } }))
  it('rejects invalid manual input', () => expect(createInsulinApplication({ ...input('other'), name: '', units: '0', date: '', time: '', id: '', createdAt: 'invalid' })).toMatchObject({ errors: { type: 'invalid', name: 'required', units: 'invalid', date: 'required', time: 'required', id: 'required', createdAt: 'invalid' } }))
  it('does not report success when persistence fails', async () => { const repository = { save: async () => { throw new Error('disk failure') }, list: async () => [] }; await expect(recordInsulinApplication(input(), repository, dependencies)).resolves.toEqual({ error: 'persistence-failed' }) })
  it('records only the declared manual application', async () => { const repository = new MemoryInsulinApplicationRepository(); await expect(recordInsulinApplication(input('rapid'), repository, dependencies)).resolves.toHaveProperty('application'); expect(await repository.list()).toHaveLength(1) })
})
