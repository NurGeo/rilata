import { InputDodValidator } from '../../../../../../src/api/service/types.js';
import { DtoFieldValidator } from '../../../../../../src/domain/validator/field-validator/dto-field-validator.js';
import { ValidatorMap } from '../../../../../../src/domain/validator/field-validator/types.js';
import { companyAttrsVMap } from '../../../domain-data/company/v-map.js';
import { AddCompanyRequestDod, AddCompanyRequestDodAttrs } from './s.params.js';

const addCompanyVmap: ValidatorMap<AddCompanyRequestDodAttrs> = {
  name: companyAttrsVMap.name,
  bin: companyAttrsVMap.bin,
  address: companyAttrsVMap.address,
};

export const addCompanyValidator: InputDodValidator<AddCompanyRequestDod> =
  new DtoFieldValidator('addCompany', true, { isArray: false }, 'dto', addCompanyVmap);
