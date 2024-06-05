import { EventRepository } from '../../../src/api/database/event.repository.js';
import { ModuleResolves } from '../../../src/api/module/m-resolves.js';
import { AuthFacade } from '../auth/facade.js';
import { CompanyRepository } from '../company/domain-object/company/repo.js';
import { SubjectFacade } from '../subject/facade.js';
import { CompanyModule } from './module.js';

export type CompanyResolves = ModuleResolves<CompanyModule> & {
  moduleUrls: ['/api/company-module/'],
  companyRepo: CompanyRepository,
  subjectFacade: SubjectFacade,
  authFacade: AuthFacade,
  eventRepo: EventRepository<true>,
}
