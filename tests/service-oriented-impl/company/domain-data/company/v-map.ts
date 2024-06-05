import { DtoFieldValidator } from '../../../../../src/domain/validator/field-validator/dto-field-validator.js';
import { LiteralFieldValidator } from '../../../../../src/domain/validator/field-validator/literal-field-validator.js';
import { UuidField } from '../../../../../src/domain/validator/field-validator/prepared-fields/string/uuid-field.js';
import { ValidatorMap } from '../../../../../src/domain/validator/field-validator/types.js';
import { MaxCharsCountValidationRule } from '../../../../../src/domain/validator/rules/validate-rules/string/max-chars-count.v-rule.js';
import { RegexMatchesValueValidationRule } from '../../../../../src/domain/validator/rules/validate-rules/string/regex-matches-value.field-v-rule.js';
import { UUIDFormatValidationRule } from '../../../../../src/domain/validator/rules/validate-rules/string/uuid-format.v-rule.js';
import { CompanyAttrs } from './params.js';

export const companyAttrsVMap: ValidatorMap<CompanyAttrs> = {
  id: new UuidField('id'),
  name: new LiteralFieldValidator('name', true, { isArray: false }, 'string', [
    new MaxCharsCountValidationRule(50),
  ]),
  bin: new LiteralFieldValidator('bin', true, { isArray: false }, 'string', [
    new RegexMatchesValueValidationRule(/^[0-9]{12}$/, 'Может быть только 12 цифр'),
  ]),
  address: new LiteralFieldValidator('address', false, { isArray: false }, 'string', [
    new MaxCharsCountValidationRule(250),
  ]),
  employees: new LiteralFieldValidator('employees', true, { isArray: true, mustBeFilled: true }, 'string', [
    new UUIDFormatValidationRule(),
  ]),
  admins: new LiteralFieldValidator('admins', true, { isArray: true, mustBeFilled: true }, 'string', [
    new UUIDFormatValidationRule(),
  ]),
};

export const companyInvariantsValidator = new DtoFieldValidator(
  'comanyInvariants', true, { isArray: false }, 'dto', companyAttrsVMap,
);
