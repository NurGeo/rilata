import { InputDodValidator } from '../../../../../src/api/service/types.js';
import { DtoFieldValidator } from '../../../../../src/domain/validator/field-validator/dto-field-validator.js';
import { ValidatorMap } from '../../../../../src/domain/validator/field-validator/types.js';
import { companyAttrsVMap } from '../../domain-data/company/v-map.js';
import { GetCompanyRequestDod } from './s.params.js';

const getCompanyVMap: ValidatorMap<GetCompanyRequestDod['attrs']> = {
  id: companyAttrsVMap.id,
};

export const getCompanyValidator: InputDodValidator<GetCompanyRequestDod> =
  new DtoFieldValidator('getCompany', true, { isArray: false }, 'dto', getCompanyVMap);
