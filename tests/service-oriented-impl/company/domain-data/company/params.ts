import { UserId, UuidType } from '../../../../../src/core/types.js';
import { AggregateRootParams, ARDT, DomainMeta } from '../../../../../src/domain/domain-data/domain-types.js';
import { CompanyRegisteredEvent } from './register-company/a-params.js';

export type CompanyAttrs = {
  id: UuidType,
  name: string,
  bin: string,
  employees: UserId[],
  admins: UserId[],
  address?: string,
}

export type CompanyMeta = DomainMeta<'CompanyAR', 'id'>

export type CompanyParams = AggregateRootParams<
  CompanyAttrs,
  CompanyMeta,
  CompanyRegisteredEvent,
  []
>

export type CompanyCmdARDT = ARDT<CompanyAttrs, CompanyMeta, []>
