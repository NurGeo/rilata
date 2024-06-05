import { EventRepository } from '../../../../../src/api/database/event.repository.js';
import { DatabaseObjectSavingError } from '../../../../../src/core/exeptions.js';
import { Logger } from '../../../../../src/core/logger/logger.js';
import { failure } from '../../../../../src/core/result/failure.js';
import { success } from '../../../../../src/core/result/success.js';
import { Result } from '../../../../../src/core/result/types.js';
import { UuidType } from '../../../../../src/core/types.js';
import { dodUtility } from '../../../../../src/core/utils/dod/dod-utility.js';
import { FakeClassImplements } from '../../../../fixtures/fake-class-implements.js';
import { UserRepository, UserRepositoryRecord } from '../../../auth/domain-object/user/repo.js';
import { UserDoesNotExistByIdError } from '../../../auth/domain-object/user/repo-errors.js';
import { AuthModuleResolver } from '../../../auth/resolver.js';
import { UserAddedEvent } from '../../../auth/services/user/add-user/s-params.js';

export class UserRepositoryImpl implements UserRepository {
  testRepo: FakeClassImplements.TestMemoryRepository<
    'user_repo', UserRepositoryRecord, 'userId'
  >;

  protected logger!: Logger;

  protected resolver!: AuthModuleResolver;

  constructor(testDb: FakeClassImplements.TestMemoryDatabase) {
    this.testRepo = new FakeClassImplements.TestMemoryRepository('user_repo', 'userId', testDb);
  }

  init(resolver: AuthModuleResolver): void {
    this.logger = resolver.getLogger();
    this.resolver = resolver;
  }

  async addUser(
    attrs: UserRepositoryRecord,
  ): Promise<Result<never, { userId: UuidType }>> {
    this.addEvent(attrs);

    const result = await this.testRepo.add({ ...attrs });
    if (result.isFailure()) {
      throw new DatabaseObjectSavingError(`user by id ${attrs.userId} is already exist`);
    }
    return success({ userId: attrs.userId });
  }

  async getUser(id: string): Promise<Result<UserDoesNotExistByIdError, UserRepositoryRecord>> {
    const result = await this.testRepo.find(id);
    if (result === undefined) {
      return failure(dodUtility.getDomainError<UserDoesNotExistByIdError>(
        'UserDoesNotExistByIdError',
        'Не найден пользователь с id {{id}}',
        { id },
      ));
    }
    return success(result);
  }

  async findByIin(iin: string): Promise<UserRepositoryRecord[]> {
    return this.testRepo.filterByAttrs({ personIin: iin });
  }

  async addEvent(attrs: UserRepositoryRecord): Promise<void> {
    const event = dodUtility.getEventDod<UserAddedEvent>(
      'UserAddedEvent',
      attrs,
      {
        attrs: { userId: attrs.userId, personIin: attrs.personIin },
        meta: {
          name: 'UserAR', idName: 'userId', domainType: 'aggregate', version: 0,
        },
      },
    );
    const eventRepo = EventRepository.instance(this.resolver);
    await eventRepo.addEvents([event]);
  }
}
