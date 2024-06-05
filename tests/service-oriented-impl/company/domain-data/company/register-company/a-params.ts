import { EventDod } from '../../../../../../src/domain/domain-data/domain-types.js';
import { CompanyAR } from '../../../domain-object/company/a-root.js';
import { CompanyAttrs, CompanyCmdARDT } from '../params.js';

export type RegisterCompanyDomainCommand = Omit<CompanyAttrs, 'id'>

export type RegisterCompanyOut = CompanyAR

export type CompanyRegisteredEvent = EventDod<
  'CompanyRegisteredEvent',
  'RegisteringCompanyService',
  'CompanyModule',
  RegisterCompanyDomainCommand,
  CompanyCmdARDT
>
