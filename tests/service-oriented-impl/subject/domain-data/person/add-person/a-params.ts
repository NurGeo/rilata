import { EventDod } from '../../../../../../src/domain/domain-data/domain-types.js';
import { PersonAttrs, PersonOutARDT } from '../params.js';

export type AddingPersonActionAttrs = Omit<PersonAttrs, 'id' | 'contacts'>;

export type PersonAddedEvent = EventDod<
  'PersonAddedEvent', 'AddingPersonService', 'SubjectModule', PersonAttrs, PersonOutARDT
>;
