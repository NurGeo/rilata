import { ValidationRule } from '../validation-rule.js';
import { TypeOrAssertRuleAnswer } from '../types.js';

export class CannotBeEmptyStringValidationRule extends ValidationRule<'assert', unknown> {
  requirement = 'Значение должно быть не пустой строкой';

  validate(value: unknown): TypeOrAssertRuleAnswer {
    return typeof value === 'string' && value !== ''
      ? this.returnSuccess('SuccessRunNextRule')
      : this.returnFail('SaveErrorAndBreakValidation');
  }
}
