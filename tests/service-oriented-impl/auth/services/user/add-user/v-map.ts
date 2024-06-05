import { InputDodValidator } from '../../../../../../src/api/service/types.js';
import { DtoFieldValidator } from '../../../../../../src/domain/validator/field-validator/dto-field-validator.js';
import { ValidatorMap } from '../../../../../../src/domain/validator/field-validator/types.js';
import { userAttrsVmap } from '../../../domain-data/user/v-map.js';
import { AddUserRequestDod, AddUserRequestDodAttrs } from './s-params.js';

const addUserVmap: ValidatorMap<AddUserRequestDodAttrs> = {
  personIin: userAttrsVmap.personIin,
};

export const addUserValidator: InputDodValidator<AddUserRequestDod> =
  new DtoFieldValidator('addUser', true, { isArray: false }, 'dto', addUserVmap);
