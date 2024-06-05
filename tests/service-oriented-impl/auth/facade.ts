import { DomainUser } from '../../../src/api/controller/types.js';
import { GeneralModuleResolver } from '../../../src/api/module/types.js';
import { Facadable } from '../../../src/api/resolve/facadable.js';
import { FullServiceResult } from '../../../src/api/service/types.js';
import { UuidType } from '../../../src/core/types.js';
import { AddUserServiceParams } from './services/user/add-user/s-params.js';
import { GetUsersServiceParams } from './services/user/get-users/s-params.js';

export interface AuthFacade {
  init(resolver: GeneralModuleResolver): void
  addUser(personIin: string, caller: DomainUser): Promise<FullServiceResult<AddUserServiceParams>>
  // eslint-disable-next-line max-len
  getUsers(userIds: UuidType[], caller: DomainUser): Promise<FullServiceResult<GetUsersServiceParams>>
}

export const AuthFacade = {
  instance(resolver: Facadable): AuthFacade {
    return resolver.resolveFacade(AuthFacade) as AuthFacade;
  },
};
