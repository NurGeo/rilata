import { EventServiceParams } from '../../../../../src/api/service/types.js';
import { EventDod } from '../../../../../src/domain/domain-data/domain-types.js';
import { AddCompanyDomainCommand, CompanyAddedEvent } from '../../../company-cmd/domain-data/company/add-company/a-params.js';
import { CompanyCmdARDT, CompanyParams } from '../../../company-cmd/domain-data/company/params.js';

export type CompanyAddedReadEvent = EventDod<
  'CompanyAddedEvent',
  'CompanyAddedService',
  'CompanyReadModule',
  AddCompanyDomainCommand,
  CompanyCmdARDT
>

export type CompanyAddedServiceParams = EventServiceParams<
  'CompanyAddedService',
  CompanyParams,
  CompanyAddedEvent,
  CompanyAddedReadEvent[]
>
