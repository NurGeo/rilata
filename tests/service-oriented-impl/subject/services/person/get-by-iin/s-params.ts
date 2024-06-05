import { QueryServiceParams } from '../../../../../../src/api/service/types.js';
import { RequestDod } from '../../../../../../src/domain/domain-data/domain-types.js';
import { PersonAttrs, PersonParams } from '../../../domain-data/person/params.js';
import { PersonDoesntExistByIinError } from '../../../domain-object/person/repo-errors.js';

export type GetPersonByIinRequestDodAttrs = {
  iin: string,
}

export type GetPersonByIinRequestDod = RequestDod<'getPersonByIin', GetPersonByIinRequestDodAttrs>

export type GetPersonByIinOut = PersonAttrs

export type GetPersonByIinServiceParams = QueryServiceParams<
  'GetingPersonByIinService',
  PersonParams,
  GetPersonByIinRequestDod,
  GetPersonByIinOut,
  PersonDoesntExistByIinError
>
