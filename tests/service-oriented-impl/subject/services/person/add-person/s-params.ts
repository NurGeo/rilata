import { CommandServiceParams } from '../../../../../../src/api/service/types.js';
import { UuidType } from '../../../../../../src/core/types.js';
import { RequestDod } from '../../../../../../src/domain/domain-data/domain-types.js';
import { AddingPersonActionAttrs, PersonAddedEvent } from '../../../domain-data/person/add-person/a-params.js';
import { PersonParams } from '../../../domain-data/person/params.js';
import { PersonAlreadyExistsError } from '../../../domain-object/person/repo-errors.js';

export type AddPersonRequestDodAttrs = AddingPersonActionAttrs

export type AddPersonRequestDod = RequestDod<'addPerson', AddPersonRequestDodAttrs>

export type AddPersonOut = { id: UuidType }

export type AddPersonServiceParams = CommandServiceParams<
  'AddingPersonService',
  PersonParams,
  AddPersonRequestDod,
  AddPersonOut,
  PersonAlreadyExistsError,
  PersonAddedEvent[]
>
