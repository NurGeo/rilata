import { AggregateRoot } from '../../../../../src/domain/domain-object/aggregate-root.js';
import { PersonAttrs, PersonParams } from '../../domain-data/person/params.js';
import { personInvariantsValidator } from '../../domain-data/person/v-map.js';

export class PersonAR extends AggregateRoot<PersonParams> {
  constructor(attrs: PersonAttrs, version: number) {
    super(attrs, personInvariantsValidator, 'PersonAR', 'id', version, ['contacts.techSupportComments']);
  }

  /** возвращает в формате Иванов И. И. */
  getShortName(): string {
    return `${this.attrs.lastName} ${this.attrs.firstName[0].toUpperCase}.`;
  }
}
