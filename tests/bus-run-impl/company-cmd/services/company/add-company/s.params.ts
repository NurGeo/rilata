import { CommandServiceParams } from '../../../../../../src/api/service/types.js';
import { RequestDod } from '../../../../../../src/domain/domain-data/domain-types.js';
import { AddCompanyDomainCommand, CompanyAddedEvent } from '../../../domain-data/company/add-company/a-params.js';
import { CompanyParams } from '../../../domain-data/company/params.js';
import { CompanyAlreadyExistError } from '../../../domain-object/company/repo-errors.js';

export type AddCompanyRequestDodAttrs = AddCompanyDomainCommand;

export type AddCompanyRequestDod = RequestDod<'addCompany', AddCompanyRequestDodAttrs>

export type AddCompanyOut = { id: string }

export type AddCompanyServiceParams = CommandServiceParams<
  'AddingCompanyService',
  CompanyParams,
  AddCompanyRequestDod,
  AddCompanyOut,
  CompanyAlreadyExistError,
  Array<CompanyAddedEvent>
>
