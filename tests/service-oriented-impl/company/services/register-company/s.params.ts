import { CommandServiceParams } from '../../../../../src/api/service/types.js';
import { RequestDod } from '../../../../../src/domain/domain-data/domain-types.js';
import { PersonAttrs } from '../../../subject/domain-data/person/params.js';
import { PersonAlreadyExistsError, PersonDoesntExistByIinError } from '../../../subject/domain-object/person/repo-errors.js';
import { CompanyParams } from '../../domain-data/company/params.js';
import { CompanyRegisteredEvent, RegisterCompanyDomainCommand } from '../../domain-data/company/register-company/a-params.js';
import { CompanyAlreadyExistError } from '../../domain-object/company/repo-errors.js';

export type ExistPerson = {
  type: 'existPerson',
} & Pick<PersonAttrs, 'iin'>

export type NewPerson = {
  type: 'newPerson',
} & Pick<PersonAttrs, 'iin' | 'firstName' | 'lastName'>

export type RegisterCompanyRequestDodAttrs = {
  person: NewPerson | ExistPerson,
  company: Omit<RegisterCompanyDomainCommand, 'employees' | 'admins'>,
}

export type RegisterCompanyRequestDod = RequestDod<'registerCompany', RegisterCompanyRequestDodAttrs>

export type RegisterCompanyOut = { id: string }

export type CompanyRegisteredServiceParams = CommandServiceParams<
  'RegisteringCompanyService',
  CompanyParams,
  RegisterCompanyRequestDod,
  RegisterCompanyOut,
  CompanyAlreadyExistError | PersonAlreadyExistsError | PersonDoesntExistByIinError,
  Array<CompanyRegisteredEvent>
>
