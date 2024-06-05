import { CompanyRepository } from './domain-object/company/repo.js';
import { CompanyResolves } from './resolves.js';
import { AuthFacade } from '../auth/facade.js';
import { SubjectFacade } from '../subject/facade.js';
import { ModuleResolver } from '../../../src/api/module/m-resolver.js';
import { GeneralServerResolver } from '../../../src/api/server/types.js';
import { EventRepository } from '../../../src/api/database/event.repository.js';

export class CompanyModuleResolver extends ModuleResolver<
  GeneralServerResolver, CompanyResolves
> {
  resolve(key: unknown): unknown {
    throw this.getLogger().error('Method getRealisation not implemented.');
  }

  resolveRepo(key: unknown): unknown {
    if (key === CompanyRepository) return this.resolves.companyRepo;
    if (key === EventRepository) {
      return this.resolves.eventRepo;
    }
    throw this.getLogger().error(`not find repo to key: ${key}`);
  }

  resolveFacade(key: unknown): unknown {
    if (key === AuthFacade) return this.resolves.authFacade;
    if (key === SubjectFacade) return this.resolves.subjectFacade;
    throw this.getLogger().error(`not find facade to key: ${key}`);
  }
}
