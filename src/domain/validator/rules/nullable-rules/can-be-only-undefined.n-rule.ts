import { ValidationRule } from '../validation-rule.js';
import { EmptyValueRuleAnswer } from '../types.js';

export class CanBeUndefinedValidationRule extends ValidationRule<'nullable', unknown> {
  requirement = 'Значение может быть undefined';

  validate(value: unknown): EmptyValueRuleAnswer {
    return value === undefined
      ? this.returnSuccess('SuccessBreakValidation')
      : this.returnSuccess('SuccessRunNextRule');
  }
}
