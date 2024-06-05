import { AggregateRootParams, ARDT, DomainMeta } from '../../../../../src/domain/domain-data/domain-types.js';
import { PersonPhonesAddedEvent } from './add-phones/add-phones.params.js';
import { PersonAddedEvent } from './add-person/a-params.js';

export type PhoneTypes = 'mobile' | 'work' | 'home';

export type PhoneAttrs = {
  number: string,
  type: PhoneTypes,
}

export type EmailTypes = 'corporate' | 'private';

export type EmailAttrs = {
  email: string,
  type: EmailTypes,
}

export type ContactsAttrs = {
  phones?: PhoneAttrs[],
  emails?: EmailAttrs[],
  address?: string,
  techSupportComments?: string[],
}

export type PersonAttrs = {
  id: string,
  iin: string,
  firstName: string,
  lastName: string,
  contacts: ContactsAttrs,
}

export type PersonMeta = DomainMeta<'PersonAR', 'id'>;

// при вызове у агрегата personAR.getHelper().getOutput() вернется объект без комментов техподдержки
export type PersonParams = AggregateRootParams<
  PersonAttrs, PersonMeta, PersonAddedEvent | PersonPhonesAddedEvent, ['contacts.techSupportComments']
>;

export type PersonOutARDT = ARDT<PersonAttrs, PersonMeta, []>;
