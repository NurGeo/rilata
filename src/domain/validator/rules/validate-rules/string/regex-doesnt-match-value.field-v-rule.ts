import { ValidationRuleAnswer } from '../../types.js';
import { ValidationRule } from '../../validation-rule.js';

export class RegexDoesntMatchValidationRule extends ValidationRule<'validate', string> {
  constructor(protected regex: RegExp, public requirement: string, private hint = {}) {
    super();
  }

  validate(value: string): ValidationRuleAnswer {
    return this.regex.test(value)
      ? this.returnFail('SaveErrorAndRunNextRule', this.hint)
      : this.returnSuccess('SuccessRunNextRule');
  }
}
