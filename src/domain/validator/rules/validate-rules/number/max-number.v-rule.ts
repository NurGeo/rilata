import { ValidationRuleAnswer } from '../../types.js';
import { ValidationRule } from '../../validation-rule.js';

export class MaxNumberValidationRule extends ValidationRule<'validate', number> {
  requirement = 'Число должно быть меньше или равно {{max}}';

  constructor(private maxNumber: number) {
    super();
  }

  validate(value: number): ValidationRuleAnswer {
    return value <= this.maxNumber
      ? this.returnSuccess('SuccessRunNextRule')
      : this.returnFail('SaveErrorAndRunNextRule', { max: this.maxNumber });
  }
}
