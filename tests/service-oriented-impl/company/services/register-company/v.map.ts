import { ValidatorMap } from '../../../../../src/domain/validator/field-validator/types.js';
import {
  ExistPerson, NewPerson, RegisterCompanyRequestDodAttrs,
} from './s.params.js';
import { DtoFieldValidator } from '../../../../../src/domain/validator/field-validator/dto-field-validator.js';
import { companyAttrsVMap } from '../../domain-data/company/v-map.js';
import { personAttrsVMap } from '../../../subject/domain-data/person/v-map.js';
import { StrictEqualFieldValidator } from '../../../../../src/domain/validator/field-validator/prepared-fields/string/strict-equal.js';

const existPersonVmap: ValidatorMap<ExistPerson> = {
  type: new StrictEqualFieldValidator('type', 'existPerson'),
  iin: personAttrsVMap.iin,
};

const newPersonVmap: ValidatorMap<NewPerson> = {
  type: new StrictEqualFieldValidator('type', 'newPerson'),
  iin: personAttrsVMap.iin,
  firstName: personAttrsVMap.firstName,
  lastName: personAttrsVMap.lastName,
};

const companyVmap: ValidatorMap<RegisterCompanyRequestDodAttrs['company']> = {
  name: companyAttrsVMap.name,
  bin: companyAttrsVMap.bin,
  address: companyAttrsVMap.address,
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const f = (isExist: boolean) => ({
  person: isExist
    ? new DtoFieldValidator('person', true, { isArray: false }, 'dto', existPersonVmap)
    : new DtoFieldValidator('person', true, { isArray: false }, 'dto', newPersonVmap),
  company: new DtoFieldValidator('company', true, { isArray: false }, 'dto', companyVmap),
});

export class RegisterCompanyValidator extends DtoFieldValidator<
  'registerCompany', true, false, RegisterCompanyRequestDodAttrs
> {
  constructor(isExist: boolean) {
    super('registerCompany', true, { isArray: false }, 'dto', f(isExist));
  }
}
