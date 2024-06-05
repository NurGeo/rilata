import { ValidationRuleAnswer } from '../../types.js';
import { ValidationRule } from '../../validation-rule.js';

export class ContainedOnlyCharsValidationRule extends ValidationRule<'validate', string> {
  requirement = 'Строка должна быть равна {{onlyChars}}';

  constructor(private onlyChars: string) {
    super();
  }

  validate(value: string): ValidationRuleAnswer {
    // eslint-disable-next-line no-restricted-syntax
    for (const char of this.onlyChars) {
      if (!value.includes(char)) { return this.returnFail('SaveErrorAndRunNextRule'); }
    } return this.returnSuccess('SuccessRunNextRule');
  }
}
