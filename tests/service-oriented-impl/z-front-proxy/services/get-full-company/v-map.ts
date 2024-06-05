import { InputDodValidator } from '../../../../../src/api/service/types.js';
import { DtoFieldValidator } from '../../../../../src/domain/validator/field-validator/dto-field-validator.js';
import { ValidatorMap } from '../../../../../src/domain/validator/field-validator/types.js';
import { companyAttrsVMap } from '../../../company/domain-data/company/v-map.js';
import { GetFullCompanyRequestDod, GetFullCompanyRequestDodAttrs } from './s-params.js';

const getFullCompanyVmap: ValidatorMap<GetFullCompanyRequestDodAttrs> = {
  id: companyAttrsVMap.id,
};

export const getFullCompanyValidator: InputDodValidator<GetFullCompanyRequestDod> =
  new DtoFieldValidator('GetFullCompanyRequestDod', true, { isArray: false }, 'dto', getFullCompanyVmap);
