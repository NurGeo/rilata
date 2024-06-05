import { InputDodValidator } from '../../../../../../src/api/service/types.js';
import { DtoFieldValidator } from '../../../../../../src/domain/validator/field-validator/dto-field-validator.js';
import { ValidatorMap } from '../../../../../../src/domain/validator/field-validator/types.js';
import { personAttrsVMap } from '../../../domain-data/person/v-map.js';
import { GetPersonByIinRequestDod, GetPersonByIinRequestDodAttrs } from './s-params.js';

export const getPersonByIinVmap: ValidatorMap<GetPersonByIinRequestDodAttrs> = {
  iin: personAttrsVMap.iin,
};

export const getPersonByIinValidator: InputDodValidator<GetPersonByIinRequestDod> =
  new DtoFieldValidator('getPersonByIin', true, { isArray: false }, 'dto', getPersonByIinVmap);
