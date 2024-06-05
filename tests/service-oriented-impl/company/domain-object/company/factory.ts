import { uuidUtility } from '../../../../../src/core/utils/uuid/uuid-utility.js';
import { AggregateFactory } from '../../../../../src/domain/domain-object/aggregate-factory.js';
import { CompanyAttrs, CompanyParams } from '../../domain-data/company/params.js';
import { CompanyRegisteredEvent, RegisterCompanyDomainCommand } from '../../domain-data/company/register-company/a-params.js';
import { CompanyAR } from './a-root.js';

export class CompanyARFactory extends AggregateFactory<CompanyParams> {
  create(command: RegisterCompanyDomainCommand): CompanyAR {
    const attrs = { id: uuidUtility.getNewUUID(), ...command };
    const company = new CompanyAR(attrs, 0);
    company.getHelper().registerEvent<CompanyRegisteredEvent>('CompanyRegisteredEvent', command);
    return company;
  }

  restore(attrs: CompanyAttrs, version: number): CompanyAR {
    return new CompanyAR(attrs, version);
  }
}
