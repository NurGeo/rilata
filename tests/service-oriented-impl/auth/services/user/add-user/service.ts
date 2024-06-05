import { CommandService } from '../../../../../../src/api/service/concrete-service/command.service.js';
import { UowTransactionStrategy } from '../../../../../../src/api/service/transaction-strategy/uow.strategy.js';
import { ServiceResult } from '../../../../../../src/api/service/types.js';
import { uuidUtility } from '../../../../../../src/core/utils/uuid/uuid-utility.js';
import { UserRepository, UserRepositoryRecord } from '../../../domain-object/user/repo.js';
import { AuthModuleResolver } from '../../../resolver.js';
import { AddUserRequestDod, AddUserServiceParams } from './s-params.js';
import { addUserValidator } from './v-map.js';

export class AddingUserService extends CommandService<
  AddUserServiceParams, AuthModuleResolver
> {
  moduleName = 'AuthModule' as const;

  serviceName = 'AddingUserService' as const;

  inputDodName = 'addUser' as const;

  aRootName = 'UserAR' as const;

  protected transactionStrategy = new UowTransactionStrategy(true);

  protected supportedCallers = ['DomainUser', 'ModuleCaller'] as const;

  protected validator = addUserValidator;

  async runDomain(
    input: AddUserRequestDod,
  ): Promise<ServiceResult<AddUserServiceParams>> {
    const userRecord: UserRepositoryRecord = {
      userId: uuidUtility.getNewUUID(),
      personIin: input.attrs.personIin,
      version: 0,
    };
    const userRepo = UserRepository.instance(this.moduleResolver);
    return userRepo.addUser(userRecord);
  }
}
