import { ValidationRuleAnswer } from '../../types.js';
import { ValidationRule } from '../../validation-rule.js';

export class ContainedOnlyCharsValidationRule extends ValidationRule<'validate', string> {
  requirement = 'Строка должна содержать только {{onlyChars}}';

  constructor(private onlyChars: string, requirement?: string) {
    super();
    if (requirement) this.requirement = requirement;
  }

  validate(value: string): ValidationRuleAnswer {
    // eslint-disable-next-line no-restricted-syntax
    for (const char of value) {
      if (!this.onlyChars.includes(char)) {
        return this.returnFail('SaveErrorAndRunNextRule', { onlyChars: this.onlyChars });
      }
    } return this.returnSuccess('SuccessRunNextRule');
  }
}
