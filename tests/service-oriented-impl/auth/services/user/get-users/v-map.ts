import { InputDodValidator } from '../../../../../../src/api/service/types.js';
import { DtoFieldValidator } from '../../../../../../src/domain/validator/field-validator/dto-field-validator.js';
import { LiteralFieldValidator } from '../../../../../../src/domain/validator/field-validator/literal-field-validator.js';
import { ValidatorMap } from '../../../../../../src/domain/validator/field-validator/types.js';
import { UUIDFormatValidationRule } from '../../../../../../src/domain/validator/rules/validate-rules/string/uuid-format.v-rule.js';
import { GetUsersRequestDod, GetUsersRequestDodAttrs } from './s-params.js';

const getUsersVMap: ValidatorMap<GetUsersRequestDodAttrs> = {
  userIds: new LiteralFieldValidator('userIds', true, { isArray: true }, 'string', [
    new UUIDFormatValidationRule(),
  ]),
};

export const getUsersValidator: InputDodValidator<GetUsersRequestDod> =
  new DtoFieldValidator('getUsers', true, { isArray: false }, 'dto', getUsersVMap);
