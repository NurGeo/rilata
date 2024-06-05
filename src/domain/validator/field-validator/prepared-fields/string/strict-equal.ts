import { TextStrictEqualValidationRule } from '../../../rules/validate-rules/string/text-strict-equal.v-rule.js';
import { LiteralFieldValidator } from '../../literal-field-validator.js';

export class StrictEqualFieldValidator<NAME extends string>
  extends LiteralFieldValidator<NAME, true, false, string> {
  constructor(attrName: NAME, strictString: string) {
    super(attrName, true, { isArray: false }, 'string', [new TextStrictEqualValidationRule(strictString)]);
  }
}
