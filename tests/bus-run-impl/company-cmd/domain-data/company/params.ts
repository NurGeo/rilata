import { UuidType } from '../../../../../src/core/types.js';
import { AggregateRootParams, ARDT, DomainMeta } from '../../../../../src/domain/domain-data/domain-types.js';
import { CompanyAddedEvent } from './add-company/a-params.js';

export type CompanyAttrs = {
  id: UuidType,
  name: string,
  bin: string,
  address?: string,
}

export type CompanyMeta = DomainMeta<'CompanyAR', 'id'>

export type CompanyParams = AggregateRootParams<
  CompanyAttrs,
  CompanyMeta,
  CompanyAddedEvent,
  []
>

export type CompanyCmdARDT = ARDT<CompanyAttrs, CompanyMeta, []>
