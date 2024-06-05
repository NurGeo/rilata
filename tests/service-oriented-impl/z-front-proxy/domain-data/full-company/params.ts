import { AggregateRootParams, ARDT, DomainMeta } from '../../../../../src/domain/domain-data/domain-types.js';
import { UserAttrs } from '../../../auth/domain-data/user/params.js';
import { CompanyAttrs } from '../../../company/domain-data/company/params.js';
import { PersonAttrs } from '../../../subject/domain-data/person/params.js';

export type FullUser = Pick<UserAttrs, 'userId'> & {
  person: PersonAttrs,
}

export type FullCompany = Omit<CompanyAttrs, 'employees'> & {
  employees: FullUser[],
}

export type FullCompanyDomainMeta = DomainMeta<'FullCompany', 'id'>

export type FullCompanyParams = AggregateRootParams<
  FullCompany,
  FullCompanyDomainMeta,
  never,
  []
>

export type FullCompanyARDT = ARDT<FullCompany, FullCompanyDomainMeta, []>
