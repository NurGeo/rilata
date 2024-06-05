import { ValidationRuleAnswer } from '../../types.js';
import { ValidationRule } from '../../validation-rule.js';

export class RangeDataTimestampValidationRule extends ValidationRule<'validate', number> {
  requirement = 'Дата должна быть позже {{minDate}} и раньше {{maxDate}}';

  private minRangeData: number;

  private maxRangeData: number;

  constructor(minDate: Date, maxDate: Date) {
    super();
    this.minRangeData = minDate.getTime();
    this.maxRangeData = maxDate.getTime();
  }

  validate(value: number): ValidationRuleAnswer {
    return value >= this.minRangeData && value <= this.maxRangeData
      ? this.returnSuccess('SuccessRunNextRule')
      : this.returnFail('SaveErrorAndRunNextRule');
  }
}
