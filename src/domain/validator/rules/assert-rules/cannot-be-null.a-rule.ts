import { ValidationRule } from '../validation-rule.js';
import { TypeOrAssertRuleAnswer } from '../types.js';

export class CannotBeNullValidationRule extends ValidationRule<'assert', unknown> {
  requirement = 'Значение не может быть равным null';

  validate(value: unknown): TypeOrAssertRuleAnswer {
    return value !== null
      ? this.returnSuccess('SuccessRunNextRule')
      : this.returnFail('SaveErrorAndBreakValidation');
  }
}
