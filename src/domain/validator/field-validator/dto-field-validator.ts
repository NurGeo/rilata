/* eslint-disable camelcase */
import { failure } from '../../../core/result/failure.js';
import { success } from '../../../core/result/success.js';
import { DTO } from '../../dto.js';
import { FieldValidator } from './field-validator.js';
import {
  ArrayFieldErrors, FieldErrors, FullFieldResult, GetArrayConfig,
  GetFieldValidatorDataType, RuleErrors, ValidatorMap,
} from './types.js';

export class DtoFieldValidator<
  NAME extends string,
  REQ extends boolean,
  IS_ARR extends boolean,
  DTO_TYPE extends DTO
> extends FieldValidator<NAME, REQ, IS_ARR, DTO_TYPE> {
  static DTO_WHOLE_VALUE_VALIDATION_ERROR_KEY = '___dto_whole_value_validation_error___';

  constructor(
    attrName: NAME,
    required: REQ,
    arrayConfig: GetArrayConfig<IS_ARR>,
    dataType: GetFieldValidatorDataType<DTO_TYPE>,
    protected dtoMap: ValidatorMap<DTO_TYPE>,
  ) {
    super(attrName, required, arrayConfig, dataType);
  }

  protected validateValue(value: unknown): FullFieldResult {
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

    let errors: FieldErrors | ArrayFieldErrors = {};
    Object.entries(this.dtoMap).forEach(([dtoAttrName, validator]) => {
      if (validator instanceof FieldValidator) {
        const result = validator.validate((value as DTO_TYPE)[dtoAttrName]);
        if (result.isFailure()) {
          errors = (
            { ...errors, ...result.value }
          );
        }
      }
    });

    return Object.keys(errors).length > 0
      ? super.getFailResult(errors)
      : success(undefined);
  }

  protected override getFailResult(errors: FieldErrors | RuleErrors): FullFieldResult {
    return failure({ [DtoFieldValidator.DTO_WHOLE_VALUE_VALIDATION_ERROR_KEY]: errors });
  }
}
