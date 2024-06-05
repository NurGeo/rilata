import { QueryServiceParams } from '../../../../../src/api/service/types.js';
import { UuidType } from '../../../../../src/core/types.js';
import { RequestDod } from '../../../../../src/domain/domain-data/domain-types.js';
import { CompanyAttrs, CompanyParams } from '../../domain-data/company/params.js';
import { CompanyDoesntExistByIdError } from '../../domain-object/company/repo-errors.js';

export type GetCompanyRequestDod = RequestDod<'getCompany', { id: UuidType }>;

export type GetCompanyOut = CompanyAttrs;

export type GetCompanyServiceParams = QueryServiceParams<
  'GettingCompanyService',
  CompanyParams,
  GetCompanyRequestDod,
  GetCompanyOut,
  CompanyDoesntExistByIdError
>
