import { ValidationRule } from '../validation-rule.js';
import { TypeOrAssertRuleAnswer } from '../types.js';

export class CannotBeNullableAssertionRule extends ValidationRule<'assert', unknown> {
  requirement = 'Значение не должно быть undefined или null';

  validate(value: unknown): TypeOrAssertRuleAnswer {
    return value !== undefined && value !== null
      ? this.returnSuccess('SuccessRunNextRule')
      : this.returnFail('SaveErrorAndBreakValidation');
  }
}
