import { ValidationRuleAnswer } from '../../types.js';
import { ValidationRule } from '../../validation-rule.js';

export class PositiveNumberValidationRule extends ValidationRule<'validate', number> {
  requirement = 'Число должно быть положительным';

  validate(value: number): ValidationRuleAnswer {
    return value >= 0
      ? this.returnSuccess('SuccessRunNextRule')
      : this.returnFail('SaveErrorAndRunNextRule');
  }
}
