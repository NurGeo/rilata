import { uuidUtility } from '../../../../../src/core/utils/uuid/uuid-utility.js';
import { AggregateFactory } from '../../../../../src/domain/domain-object/aggregate-factory.js';
import { AddingPersonActionAttrs } from '../../domain-data/person/add-person/a-params.js';
import { PersonAttrs, PersonParams } from '../../domain-data/person/params.js';
import { PersonAR } from './a-root.js';

export class PersonFactory extends AggregateFactory<PersonParams> {
  create(actionAttrs: AddingPersonActionAttrs): PersonAR {
    const personAttrs: PersonAttrs = {
      ...actionAttrs,
      id: uuidUtility.getNewUUID(),
      contacts: { phones: [] },
    };
    const person = new PersonAR(personAttrs, 0);

    person.getHelper().registerEvent('PersonAddedEvent', personAttrs);
    return person;
  }

  restore(attrs: PersonAttrs, version: number): PersonAR {
    return new PersonAR(attrs, version);
  }
}
