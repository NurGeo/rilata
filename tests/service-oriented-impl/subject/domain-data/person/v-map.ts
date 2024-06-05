import { DtoFieldValidator } from '../../../../../src/domain/validator/field-validator/dto-field-validator.js';
import { LiteralFieldValidator } from '../../../../../src/domain/validator/field-validator/literal-field-validator.js';
import { CannotEmptyStringField } from '../../../../../src/domain/validator/field-validator/prepared-fields/string/cannot-empty-string.js';
import { StringChoiceFieldValidator } from '../../../../../src/domain/validator/field-validator/prepared-fields/string/choice.js';
import { UuidField } from '../../../../../src/domain/validator/field-validator/prepared-fields/string/uuid-field.js';
import { GetArrayConfig, ValidatorMap } from '../../../../../src/domain/validator/field-validator/types.js';
import { GeneralValidationRule } from '../../../../../src/domain/validator/rules/types.js';
import { EmailFormatValidationRule } from '../../../../../src/domain/validator/rules/validate-rules/string/email-format.field-v-rule.js';
import { MaxCharsCountValidationRule } from '../../../../../src/domain/validator/rules/validate-rules/string/max-chars-count.v-rule.js';
import { RegexMatchesValueValidationRule } from '../../../../../src/domain/validator/rules/validate-rules/string/regex-matches-value.field-v-rule.js';
import {
  ContactsAttrs, EmailAttrs, EmailTypes, PersonAttrs, PhoneAttrs, PhoneTypes,
} from './params.js';

class PhoneNumberFieldValidator<
  NAME extends string, REQ extends boolean, IS_ARR extends boolean,
> extends LiteralFieldValidator<NAME, REQ, IS_ARR, string> {
  constructor(
    attrName: NAME,
    required: REQ,
    isArray: GetArrayConfig<IS_ARR>,
    vRules: GeneralValidationRule[],
  ) {
    super(attrName, required, isArray, 'string', [
      new RegexMatchesValueValidationRule(
        /^\+7-\d{3}-\d{3}-\d{2}-\d{2}$/,
        'Строка должна соответствовать формату: "+7-###-##-##"',
      ),
      ...vRules,
    ]);
  }
}

const phoneTypes: PhoneTypes[] = ['work', 'home', 'mobile'];

const phoneVMap: ValidatorMap<PhoneAttrs> = {
  number: new PhoneNumberFieldValidator<'number', true, false>('number', true, { isArray: false }, []),
  type: new StringChoiceFieldValidator<'type', true, false>('type', true, { isArray: false }, phoneTypes),
};

const emailTypes: EmailTypes[] = ['private', 'corporate'];

const emailVMap: ValidatorMap<EmailAttrs> = {
  email: new LiteralFieldValidator('email', true, { isArray: false }, 'string', [new EmailFormatValidationRule()]),
  type: new StringChoiceFieldValidator<'type', true, false>('type', true, { isArray: false }, emailTypes),
};

const contactsVMap: ValidatorMap<ContactsAttrs> = {
  phones: new DtoFieldValidator('phones', false, { isArray: true }, 'dto', phoneVMap),
  emails: new DtoFieldValidator('emails', false, { isArray: true }, 'dto', emailVMap),
  address: new CannotEmptyStringField('address', false, []),
  techSupportComments: new LiteralFieldValidator('techSupportComments', false, { isArray: true }, 'string', []),
};

export const personAttrsVMap: ValidatorMap<PersonAttrs> = {
  id: new UuidField('id'),
  iin: new CannotEmptyStringField('iin', true, [
    new RegexMatchesValueValidationRule(/^[0-9]{12}$/, 'Может быть только 12 цифр'),
  ]),
  firstName: new CannotEmptyStringField('firstName', true, [
    new MaxCharsCountValidationRule(50),
  ]),
  lastName: new CannotEmptyStringField('lastName', true, [
    new MaxCharsCountValidationRule(50),
  ]),
  contacts: new DtoFieldValidator('contacts', true, { isArray: false }, 'dto', contactsVMap),
};

export const personInvariantsValidator = new DtoFieldValidator(
  'personInvariants', true, { isArray: false }, 'dto', personAttrsVMap,
);
