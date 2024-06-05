import {
  ARDT, DomainMeta, ErrorDod, EventDod,
} from '../../../domain/domain-data/domain-types.js';

export namespace DODPrivateFixtures {
  export type PhoneAttrs = {
    number: string,
    type: string, // 'mobile' | 'work'
    noOutField: string,
  };

  export const phoneAttrs: PhoneAttrs = {
    number: '+7-777-287-81-82',
    type: 'mobile',
    noOutField: 'empty info',
  };

  export type EmailAttrs = {
    value: string,
    noOutField: string,
  };

  export const emailAttrs: EmailAttrs = {
    value: 'email@example.com',
    noOutField: 'empty info',
  };

  export type PersonContactsAttrs = {
    phones: PhoneAttrs[],
    email: EmailAttrs,
    address: string,
    noOutField: string,
  };

  export const personContactAttrs: PersonContactsAttrs = {
    phones: [phoneAttrs],
    email: emailAttrs,
    address: 'Kazakhstan, Uralsk, 27 Kurmangazy street',
    noOutField: 'he-he-he',
  };

  export type PersonAttrs = {
    id: string,
    name: string,
    lastName: string,
    birthday: number,
    age: number,
    contacts: PersonContactsAttrs,
  };

  export type PersonMeta = DomainMeta<'PersonAR', 'id'>

  export const personAttrs: PersonAttrs = {
    id: '1',
    name: 'Nur',
    lastName: 'Ama',
    birthday: new Date('1979-01-17').getTime(),
    age: 42,
    contacts: personContactAttrs,
  };

  export type PersonDOD = {
    attrs: PersonAttrs,
    meta: {
      name: 'Person',
      mutationType: 'read-model-object',
    },
  }

  export const personDOD: PersonDOD = {
    attrs: personAttrs,
    meta: {
      name: 'Person',
      mutationType: 'read-model-object',
    },
  };

  export type PersonARDT = ARDT<PersonAttrs, PersonMeta, [
    'contacts.noOutField', 'contacts.email.noOutField', 'contacts.phones.noOutField'
  ]>;

  export type PersonPhoneAddedEventDOD = EventDod<
    'PersonPhoneAddedEvent', 'AddingPersonPhoneService', 'SubjectModule', PhoneAttrs, PersonARDT
  >;

  export type InternalAppLocale = { text: string, hint: { traceback: 'any object' }, name: 'InternalAppError' };

  export type InternalAppError = ErrorDod<'InternalAppError', InternalAppLocale, 'app-error'>;

  export type PersonNotExitsErrorDOD = ErrorDod<'PersonNotExistError', { text: string, hint: { personId: string }, name: 'PersonNotExistError' }>;

  export type PersonEmailAddedEventDOD = EventDod<
    'PersonEmailAddedEvent', 'AddingPersonEmailService', 'SubjectModule', PersonAttrs, PersonARDT
  >;
}
