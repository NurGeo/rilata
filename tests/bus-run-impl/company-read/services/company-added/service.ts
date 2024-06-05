import { EventRepository } from '../../../../../src/api/database/event.repository.js';
import { EventService } from '../../../../../src/api/service/concrete-service/event.service.js';
import { UowTransactionStrategy } from '../../../../../src/api/service/transaction-strategy/uow.strategy.js';
import { ServiceResult } from '../../../../../src/api/service/types.js';
import { success } from '../../../../../src/core/result/success.js';
import { dodUtility } from '../../../../../src/core/utils/dod/dod-utility.js';
import { CompanyAddedEvent } from '../../../company-cmd/domain-data/company/add-company/a-params.js';
import { CompanyReadRepository } from '../../domain/company/repo.js';
import { CompanyReadModuleResolver } from '../../resolver.js';
import { CompanyAddedServiceParams } from './s-params.js';

export class CompanyAddedService extends EventService<
  CompanyAddedServiceParams, CompanyReadModuleResolver
> {
  inputDodName = 'CompanyAddedEvent' as const; // имя входящего события

  eventServiceName = 'AddingCompanyService' as const; // имя сервиса которое выпустило событие

  eventModuleName = 'CompanyCmdModule' as const; // имя модуля которое выпустио событие

  moduleName = 'CompanyReadModule' as const; // имя данного модуля

  serviceName = 'CompanyAddedService' as const; // имя данного сервиса

  busMessageType = 'event' as const;

  protected transactionStrategy = new UowTransactionStrategy(true);

  aRootName = 'CompanyAR' as const;

  async runDomain(
    input: CompanyAddedEvent,
  ): Promise<ServiceResult<CompanyAddedServiceParams>> {
    const companyAttrs = { ...input.aRoot.attrs, version: input.aRoot.meta.version };
    const eventRepo = EventRepository.instance(this.moduleResolver);
    eventRepo.addEvents([
      dodUtility.regenerateEvent(input, this.serviceName, this.moduleName),
    ]);
    const repo = CompanyReadRepository.instance(this.moduleResolver);
    repo.addCompany(companyAttrs);
    return success(undefined);
  }
}
