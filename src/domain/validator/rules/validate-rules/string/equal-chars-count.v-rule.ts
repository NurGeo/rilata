import { ValidationRuleAnswer } from '../../types.js';
import { ValidationRule } from '../../validation-rule.js';

export class EqualCharsCountValidationRule extends ValidationRule<'validate', string> {
  requirement = 'Длина строки должна быть равна {{count}}, сейчас {{current}}';

  constructor(private charsCount: number) {
    super();
  }

  validate(value: string): ValidationRuleAnswer {
    return value.length !== this.charsCount
      ? this.returnFail('SaveErrorAndRunNextRule', { count: this.charsCount, current: value.length })
      : this.returnSuccess('SuccessRunNextRule');
  }
}
