import { AggregateRoot } from '../../../../../src/domain/domain-object/aggregate-root.js';
import { CompanyAttrs, CompanyParams } from '../../domain-data/company/params.js';
import { companyInvariantsValidator } from '../../domain-data/company/v-map.js';

export class CompanyAR extends AggregateRoot<CompanyParams> {
  constructor(attrs: CompanyAttrs, version: number) {
    super(attrs, companyInvariantsValidator, 'CompanyAR', 'id', version, []);
  }

  getShortName(): string {
    return `Компания: "${this.attrs.name}"`;
  }
}
