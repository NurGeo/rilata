import { ValidationRule } from '../validation-rule.js';
import { TypeOrAssertRuleAnswer } from '../types.js';
import { AssertionException } from '../../../../core/exeptions.js';

export class MaxArrayElementsCountAssertionRule extends ValidationRule<'assert', unknown> {
  requirement = 'Максимальное количество элементов может быть {{max}}, сейчас {{currentCount}}';

  constructor(private maxElementsCount: number) {
    super();
    if (maxElementsCount < 0) throw new AssertionException(`invalid counts: ${maxElementsCount}`);
  }

  validate(value: unknown[]): TypeOrAssertRuleAnswer {
    return value.length > this.maxElementsCount
      ? this.returnFail('SaveErrorAndBreakValidation', { max: this.maxElementsCount, currentCount: value.length })
      : this.returnSuccess('SuccessRunNextRule');
  }
}
