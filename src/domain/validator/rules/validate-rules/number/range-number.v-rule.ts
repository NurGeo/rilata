import { ValidationRuleAnswer } from '../../types.js';
import { ValidationRule } from '../../validation-rule.js';

export class RangeNumberValidationRule extends ValidationRule<'validate', number> {
  requirement = 'Число должно быть в диапозоне от {{min}} до {{max}}';

  constructor(private min: number, private max: number, requirement?: string) {
    super();
    if (requirement !== undefined) this.requirement = requirement;
  }

  validate(value: number): ValidationRuleAnswer {
    return value >= this.min && value <= this.max
      ? this.returnSuccess('SuccessRunNextRule')
      : this.returnFail('SaveErrorAndRunNextRule', { max: this.max, min: this.min });
  }
}
