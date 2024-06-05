import { QueryService } from '../../../../../../src/api/service/concrete-service/query.service.js';
import { ServiceResult } from '../../../../../../src/api/service/types.js';
import { success } from '../../../../../../src/core/result/success.js';
import { dtoUtility } from '../../../../../../src/core/utils/dto/dto-utility.js';
import { UserAttrs } from '../../../domain-data/user/params.js';
import { UserRepository } from '../../../domain-object/user/repo.js';
import { AuthModuleResolver } from '../../../resolver.js';
import { GetUsersRequestDod, GetUsersServiceParams } from './s-params.js';
import { getUsersValidator } from './v-map.js';

export class GetingUsersService extends QueryService<
  GetUsersServiceParams, AuthModuleResolver
> {
  inputDodName = 'getUsers' as const;

  moduleName = 'AuthModule' as const;

  serviceName = 'GettingUserService' as const;

  aRootName = 'UserAR' as const;

  protected supportedCallers = ['DomainUser', 'ModuleCaller'] as const;

  protected validator = getUsersValidator;

  async runDomain(
    input: GetUsersRequestDod,
  ): Promise<ServiceResult<GetUsersServiceParams>> {
    const userRepo = UserRepository.instance(this.moduleResolver);
    const userResults = await Promise.all(input.attrs.userIds
      .map((id) => userRepo.getUser(id)));
    return success(
      userResults
        .filter((result) => result.isSuccess())
        .map((result) => dtoUtility.excludeAttrs(
          result.value as (UserAttrs & { version: number }), 'version',
        ) as UserAttrs),
    );
  }
}
