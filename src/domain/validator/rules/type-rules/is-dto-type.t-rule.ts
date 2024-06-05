import { ValidationRule } from '../validation-rule.js';
import { TypeOrAssertRuleAnswer } from '../types.js';

export class IsDTOTypeRule extends ValidationRule<'type', unknown> {
  requirement = 'Значение должно быть объектом';

  validate(value: unknown): TypeOrAssertRuleAnswer {
    return (
      typeof value === 'object'
      && Array.isArray(value) === false
      && value !== null
    )
      ? this.returnSuccess('SuccessRunNextRule')
      : this.returnFail('SaveErrorAndBreakValidation');
  }
}
