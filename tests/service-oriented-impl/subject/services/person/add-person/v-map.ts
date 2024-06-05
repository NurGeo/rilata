import { InputDodValidator } from '../../../../../../src/api/service/types.js';
import { DtoFieldValidator } from '../../../../../../src/domain/validator/field-validator/dto-field-validator.js';
import { ValidatorMap } from '../../../../../../src/domain/validator/field-validator/types.js';
import { personAttrsVMap } from '../../../domain-data/person/v-map.js';
import { AddPersonRequestDod, AddPersonRequestDodAttrs } from './s-params.js';

const addPersonVmap: ValidatorMap<AddPersonRequestDodAttrs> = {
  iin: personAttrsVMap.iin,
  firstName: personAttrsVMap.firstName,
  lastName: personAttrsVMap.lastName,
};

export const addPersonValidator: InputDodValidator<AddPersonRequestDod> =
  new DtoFieldValidator('addPerson', true, { isArray: false }, 'dto', addPersonVmap);
