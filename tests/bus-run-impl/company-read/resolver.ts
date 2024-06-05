/* eslint-disable @typescript-eslint/no-unused-vars */
import { CompanyReadResolves } from './resolves.js';
import { CompanyReadRepository } from './domain/company/repo.js';
import { DelivererToBus } from '../../../src/api/bus/deliverer-to-bus.js';
import { ModuleResolver } from '../../../src/api/module/m-resolver.js';
import { BusRunServerResolver } from '../zzz-bus-run/s-resolver.js';
import { BusModuleResolver } from '../../../src/api/module/bus.m-resolver.js';
import { Bus } from '../../../src/api/bus/bus.js';
import { BusMessageRepository } from '../../../src/api/database/bus-message.repository.js';
import { EventRepository } from '../../../src/api/database/event.repository.js';
import { CompanyReadModule } from './module.js';
import { TimeoutCallbackDelivererToBus } from '../../../src/api-infra/deliverer-to-bus/timeout-callback-impl.js';

export class CompanyReadModuleResolver extends ModuleResolver<
  BusRunServerResolver, CompanyReadResolves
> implements BusModuleResolver {
  private delivererToBus = new TimeoutCallbackDelivererToBus();

  init(module: CompanyReadModule, sResolver: BusRunServerResolver): void {
    super.init(module, sResolver);
    this.delivererToBus.init(this);
    this.resolves.busMessageRepo.subscribe(this.delivererToBus);
  }

  resolve(key: unknown): unknown {
    throw this.getLogger().error('Method getRealisation not implemented.');
  }

  resolveRepo(key: unknown): unknown {
    if (key === CompanyReadRepository) return this.resolves.companyRepo;
    if (key === EventRepository) return this.resolves.eventRepo;
    if (key === BusMessageRepository) return this.resolves.busMessageRepo;
    throw this.getLogger().error(`not find repo to key: ${key}`);
  }

  resolveFacade(key: unknown): unknown {
    throw this.getLogger().error('Method getFacade not implemented.');
  }

  getBus(): Bus {
    return this.serverResolver.getBus();
  }

  getBusMessageRepository(): BusMessageRepository<true> {
    return this.resolves.busMessageRepo;
  }

  getDelivererToBus(): DelivererToBus {
    return this.delivererToBus;
  }
}
