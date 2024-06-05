import { ValidationRuleAnswer } from '../../types.js';
import { ValidationRule } from '../../validation-rule.js';

export class TextStrictEqualValidationRule extends ValidationRule<'validate', string> {
  requirement = 'Строка должна быть строго равна "{{strictString}}"';

  constructor(private strictString: string) {
    super();
  }

  validate(value: string): ValidationRuleAnswer {
    return this.strictString === value
      ? this.returnSuccess('SuccessRunNextRule')
      : this.returnFail('SaveErrorAndRunNextRule', { strictString: this.strictString });
  }
}
