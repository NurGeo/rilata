import { ValidationRule } from '../validation-rule.js';
import { TypeOrAssertRuleAnswer } from '../types.js';

export class CannotBeInfinityRule extends ValidationRule<'assert', unknown> {
  requirement = 'Значение не может быть Infinity или -Infinity';

  validate(value: unknown): TypeOrAssertRuleAnswer {
    return value !== Infinity && value !== -Infinity
      ? this.returnSuccess('SuccessRunNextRule')
      : this.returnFail('SaveErrorAndBreakValidation');
  }
}
