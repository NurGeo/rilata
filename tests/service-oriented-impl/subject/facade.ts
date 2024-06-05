import { Caller, DomainUser } from '../../../src/api/controller/types.js';
import { GeneralModuleResolver } from '../../../src/api/module/types.js';
import { Facadable } from '../../../src/api/resolve/facadable.js';
import { FullServiceResult } from '../../../src/api/service/types.js';
import { AddPersonRequestDodAttrs, AddPersonServiceParams } from './services/person/add-person/s-params.js';
import { GetPersonByIinServiceParams } from './services/person/get-by-iin/s-params.js';

export interface SubjectFacade {
  init(resolver: GeneralModuleResolver): void
  getPersonByIin(
    iin: string, caller: Caller
  ): Promise<FullServiceResult<GetPersonByIinServiceParams>>
  addPerson(
    input: AddPersonRequestDodAttrs, caller: DomainUser
  ): Promise<FullServiceResult<AddPersonServiceParams>>
}

export const SubjectFacade = {
  instance(resolver: Facadable): SubjectFacade {
    return resolver.resolveFacade(SubjectFacade) as SubjectFacade;
  },
};
