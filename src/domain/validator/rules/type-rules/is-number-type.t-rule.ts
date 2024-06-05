import { ValidationRule } from '../validation-rule.js';
import { TypeOrAssertRuleAnswer } from '../types.js';

export class IsNumberTypeRule extends ValidationRule<'type', unknown> {
  requirement = 'Значение должно быть числовым';

  validate(value: unknown): TypeOrAssertRuleAnswer {
    return typeof value === 'number'
      ? this.returnSuccess('SuccessRunNextRule')
      : this.returnFail('SaveErrorAndBreakValidation');
  }
}
