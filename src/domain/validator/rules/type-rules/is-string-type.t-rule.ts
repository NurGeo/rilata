import { ValidationRule } from '../validation-rule.js';
import { TypeOrAssertRuleAnswer } from '../types.js';

export class IsStringTypeRule extends ValidationRule<'type', unknown> {
  requirement = 'Значение должно быть строковым значением';

  validate(value: unknown): TypeOrAssertRuleAnswer {
    return typeof value === 'string'
      ? this.returnSuccess('SuccessRunNextRule')
      : this.returnFail('SaveErrorAndBreakValidation');
  }
}
