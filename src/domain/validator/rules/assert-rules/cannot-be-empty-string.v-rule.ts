import { TypeOrAssertRuleAnswer } from '../types.js';
import { ValidationRule } from '../validation-rule.js';

export class CannotBeEmptyStringAssertionRule extends ValidationRule<'assert', string> {
  requirement = 'Строка обязательна к заполнению';

  validate(value: string): TypeOrAssertRuleAnswer {
    return value !== ''
      ? this.returnSuccess('SuccessRunNextRule')
      : this.returnFail('SaveErrorAndBreakValidation');
  }
}
