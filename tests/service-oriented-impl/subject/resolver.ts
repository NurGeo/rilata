/* eslint-disable @typescript-eslint/no-unused-vars */
import { EventRepository } from '../../../src/api/database/event.repository.js';
import { ModuleResolver } from '../../../src/api/module/m-resolver.js';
import { GeneralServerResolver } from '../../../src/api/server/types.js';
import { PersonRepository } from './domain-object/person/repo.js';
import { SubjectResolves } from './resolves.js';

export class SubjectModuleResolver extends ModuleResolver<
  GeneralServerResolver, SubjectResolves
> {
  resolve(key: unknown): unknown {
    throw this.getLogger().error('Method getRealisation not implemented.');
  }

  resolveRepo(key: unknown): unknown {
    if (key === PersonRepository) return this.resolves.personRepo;
    if (key === EventRepository) {
      return this.resolves.eventRepo;
    }
    throw Error(`not found repository by key: ${key}`);
  }

  resolveFacade(key: unknown): unknown {
    throw this.getLogger().error('Method getFacade not implemented.');
  }
}
