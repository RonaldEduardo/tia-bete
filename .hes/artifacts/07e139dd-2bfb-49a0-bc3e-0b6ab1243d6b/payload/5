import type { InsulinApplicationRepository } from '../../application/insulin/insulinApplicationRepository'
import type { InsulinApplication } from '../../domain/insulin/insulinApplication'
export class MemoryInsulinApplicationRepository implements InsulinApplicationRepository { private readonly applications: InsulinApplication[] = []; async save(application: InsulinApplication) { this.applications.push(application) }; async list() { return [...this.applications] } }
