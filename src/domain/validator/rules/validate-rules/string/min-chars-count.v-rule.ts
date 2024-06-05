import { ValidationRuleAnswer } from '../../types.js';
import { ValidationRule } from '../../validation-rule.js';

export class MinCharsCountValidationRule extends ValidationRule<'validate', string> {
  requirement = 'Строка должна быть не меньше {{minCount}}';

  constructor(private minCharsCount: number) {
    super();
  }

  validate(value: string): ValidationRuleAnswer {
    return value.length < this.minCharsCount
      ? this.returnFail('SaveErrorAndRunNextRule', { minCount: this.minCharsCount })
      : this.returnSuccess('SuccessRunNextRule');
  }
}
