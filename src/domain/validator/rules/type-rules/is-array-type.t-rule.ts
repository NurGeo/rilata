import { ValidationRule } from '../validation-rule.js';
import { TypeOrAssertRuleAnswer } from '../types.js';

export class IsArrayTypeRule extends ValidationRule<'type', unknown> {
  requirement = 'Значение должно быть массивом данных';

  validate(value: unknown): TypeOrAssertRuleAnswer {
    return Array.isArray(value)
      ? this.returnSuccess('SuccessRunNextRule')
      : this.returnFail('SaveErrorAndBreakValidation');
  }
}
