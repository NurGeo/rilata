import { QueryServiceParams } from '../../../../../src/api/service/types.js';
import { RequestDod } from '../../../../../src/domain/domain-data/domain-types.js';
import { CompanyDoesntExistByIdError } from '../../../company/domain-object/company/repo-errors.js';
import { FullCompany, FullCompanyParams } from '../../domain-data/full-company/params.js';

export type GetFullCompanyRequestDodAttrs = {
  id: string,
}

export type GetFullCompanyRequestDod = RequestDod<'GetFullCompanyRequestDod', GetFullCompanyRequestDodAttrs>

export type GetFullCompanyOut = FullCompany

export type GetFullCompanyErrors = CompanyDoesntExistByIdError

export type GetFullCompanyServiceParams = QueryServiceParams<
  'GetingFullCompanyService',
  FullCompanyParams,
  GetFullCompanyRequestDod,
  GetFullCompanyOut,
  GetFullCompanyErrors
>
