import { EventDod } from '../../../../../../src/domain/domain-data/domain-types.js';
import { CompanyAR } from '../../../domain-object/company/a-root.js';
import { CompanyAttrs, CompanyCmdARDT } from '../params.js';

export type AddCompanyDomainCommand = Omit<CompanyAttrs, 'id'>

export type AddCompanyOut = CompanyAR

export type CompanyAddedEvent = EventDod<
  'CompanyAddedEvent',
  'AddingCompanyService',
  'CompanyCmdModule',
  AddCompanyDomainCommand,
  CompanyCmdARDT
>
