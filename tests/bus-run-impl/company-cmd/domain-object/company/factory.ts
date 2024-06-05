import { uuidUtility } from '../../../../../src/core/utils/uuid/uuid-utility.js';
import { AggregateFactory } from '../../../../../src/domain/domain-object/aggregate-factory.js';
import { CompanyAttrs, CompanyParams } from '../../domain-data/company/params.js';
import { CompanyAddedEvent, AddCompanyDomainCommand } from '../../domain-data/company/add-company/a-params.js';
import { CompanyAR } from './a-root.js';

export class CompanyCmdARFactory extends AggregateFactory<CompanyParams> {
  create(command: AddCompanyDomainCommand): CompanyAR {
    const attrs = { id: uuidUtility.getNewUUID(), ...command };
    const company = new CompanyAR(attrs, 0);
    company.getHelper().registerEvent<CompanyAddedEvent>('CompanyAddedEvent', command);
    return company;
  }

  restore(attrs: CompanyAttrs, version: number): CompanyAR {
    return new CompanyAR(attrs, version);
  }
}
