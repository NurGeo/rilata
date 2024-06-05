import { QueryServiceParams } from '../../../../../../src/api/service/types.js';
import { UuidType } from '../../../../../../src/core/types.js';
import { RequestDod } from '../../../../../../src/domain/domain-data/domain-types.js';
import { UserAttrs, UserParams } from '../../../domain-data/user/params.js';

export type GetUsersRequestDodAttrs = {
  userIds: UuidType[],
}

export type GetUsersRequestDod = RequestDod<'getUsers', GetUsersRequestDodAttrs>

export type GetUsersOut = UserAttrs[]

export type GetUsersServiceParams = QueryServiceParams<
  'GettingUserService',
  UserParams,
  GetUsersRequestDod,
  GetUsersOut,
  never
>
