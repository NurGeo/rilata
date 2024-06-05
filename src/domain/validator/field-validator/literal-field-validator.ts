import { success } from '../../../core/result/success.js';
import { LiteralDataType } from '../../validator/rules/types.js';
import { ValidationRule } from '../../validator/rules/validation-rule.js';
import { CannotBeEmptyStringAssertionRule } from '../rules/assert-rules/cannot-be-empty-string.v-rule.js';
import { CannotBeNullableAssertionRule } from '../rules/assert-rules/cannot-be-nullable.a-rule.js';
import { CanBeNullableRule } from '../rules/nullable-rules/can-be-nullable.n-rule.js';
import { FieldValidator } from './field-validator.js';
import {
  FieldResult, GetArrayConfig, GetFieldValidatorDataType,
} from './types.js';

export class LiteralFieldValidator<
  NAME extends string,
  REQ extends boolean,
  IS_ARR extends boolean,
  DATA_TYPE extends LiteralDataType
> extends FieldValidator<NAME, REQ, IS_ARR, DATA_TYPE> {
  constructor(
    attrName: NAME,
    isRequired: REQ,
    arrayConfig: GetArrayConfig<IS_ARR>,
    protected override dataType: GetFieldValidatorDataType<DATA_TYPE>,
    protected validateRules: ValidationRule<'validate', DATA_TYPE>[],
  ) {
    super(attrName, isRequired, arrayConfig, dataType);
  }

  protected validateValue(value: unknown): FieldResult {
    if (this.arrayConfig.isArray === false) {
      const nullableAnswer = this.validateNullableValue(value);
      if (nullableAnswer.break) {
        return nullableAnswer.isValidValue
          ? success(undefined)
          : this.getFailResult(nullableAnswer.errors);
      }
    }

    const typeAnswer = this.validateByRules(value, this.getTypeCheckRules());
    if (typeAnswer.isValidValue === false) return this.getFailResult(typeAnswer.errors);

    const validateAnswer = this.validateByRules(value, this.validateRules);
    return validateAnswer.isValidValue
      ? success(undefined)
      : this.getFailResult(validateAnswer.errors);
  }

  protected override getRequiredOrNullableRules(): Array<ValidationRule<'assert', unknown> | ValidationRule<'nullable', unknown>> {
    if (this.dataType !== 'string') return super.getRequiredOrNullableRules();
    return this.isRequired
      ? [new CannotBeNullableAssertionRule(), new CannotBeEmptyStringAssertionRule()]
      : [new CanBeNullableRule()];
  }
}
