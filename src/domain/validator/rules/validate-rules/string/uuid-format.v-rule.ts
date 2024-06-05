import { uuidUtility } from '../../../../../core/utils/uuid/uuid-utility.js';
import { ValidationRuleAnswer } from '../../types.js';
import { ValidationRule } from '../../validation-rule.js';

export class UUIDFormatValidationRule extends ValidationRule<'validate', string> {
  requirement = 'Значение должно соответствовать формату UUID';

  validate(value: string): ValidationRuleAnswer {
    return uuidUtility.isValidValue(value)
      ? this.returnSuccess('SuccessRunNextRule')
      : this.returnFail('SaveErrorAndRunNextRule');
  }
}
