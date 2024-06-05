import { BusMessageRepository } from '../../../src/api/database/bus-message.repository.js';
import { EventRepository } from '../../../src/api/database/event.repository.js';
import { ModuleResolves } from '../../../src/api/module/m-resolves.js';
import { CompanyCmdRepository } from './domain-object/company/repo.js';
import { CompanyCmdModule } from './module.js';

export type CompanyCmdResolves = ModuleResolves<CompanyCmdModule> & {
  moduleUrls: ['/api/company-cmd-module/'],
  companyRepo: CompanyCmdRepository,
  busMessageRepo: BusMessageRepository<true>,
  eventRepo: EventRepository<true>
}
