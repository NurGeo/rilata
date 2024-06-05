import { ValidationRule } from '../validation-rule.js';
import { TypeOrAssertRuleAnswer } from '../types.js';

export class CannotBeUndefinedValidationRule extends ValidationRule<'assert', unknown> {
  requirement = 'Значение не должно быть undefined';

  validate(value: unknown): TypeOrAssertRuleAnswer {
    return value !== undefined
      ? this.returnSuccess('SuccessRunNextRule')
      : this.returnFail('SaveErrorAndBreakValidation');
  }
}
