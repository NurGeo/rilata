import { EventDod } from '../../../../../../src/domain/domain-data/domain-types.js';
import { PersonOutARDT, PhoneAttrs } from '../params.js';

export type AddPhonesActionDod = { phones: PhoneAttrs[] };

export type PersonPhonesAddedEvent = EventDod<
  'PersonPhoneAddedEvent', 'AddingPhoneService', 'SubjectModule', AddPhonesActionDod, PersonOutARDT
>;
