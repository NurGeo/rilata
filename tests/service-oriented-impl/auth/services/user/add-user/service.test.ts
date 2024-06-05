import {
  beforeEach, describe, expect, spyOn, test,
} from 'bun:test';
import { dodUtility } from '../../../../../../src/core/utils/dod/dod-utility.js';
import { uuidUtility } from '../../../../../../src/core/utils/uuid/uuid-utility.js';
import { serverStarter } from '../../../../zzz-run-server/starter.js';
import { ServiceModulesFixtures } from '../../../../zzz-run-server/server-fixtures.js';
import { UserRepository } from '../../../domain-object/user/repo.js';
import { AuthModule } from '../../../module.js';
import { AddUserRequestDod, AddUserOut } from './s-params.js';
import { AddingUserService } from './service.js';
import { TestDatabase } from '../../../../../../src/api/database/test.database.js';
import { EventRepository } from '../../../../../../src/api/database/event.repository.js';
import { requestStoreMock } from '../../../../../fixtures/request-store-mock.js';

describe('add user service tests', async () => {
  const requestId = 'c22fd027-a94b-4728-90eb-f6d4f96992c2';
  const testSever = serverStarter.start(['AuthModule']);
  const module = testSever.getModule<AuthModule>('AuthModule');
  const resolver = module.getModuleResolver();
  requestStoreMock({
    requestId,
    moduleResolver: resolver,
  });

  beforeEach(async () => {
    const db = resolver.getDatabase() as unknown as TestDatabase<true>;
    await db.clear();
    await db.addBatch(ServiceModulesFixtures.repoFixtures);
  });

  test('успех, пользователь добавлен', async () => {
    const inputDod = dodUtility.getRequestDod<AddUserRequestDod>(
      'addUser',
      { personIin: '111333555777' },
      requestId,
    );
    const sut = module.getServiceByInputDodName<AddingUserService>('addUser');
    const result = await sut.execute(inputDod);
    expect(result.isSuccess()).toBe(true);
    const userAr = result.value as AddUserOut;
    expect(uuidUtility.isValidValue(userAr.userId)).toBe(true);

    const eventRepo = EventRepository.instance(resolver);
    const events = await eventRepo.getAggregateEvents(userAr.userId);
    expect(events.length).toBe(1);
    expect(events[0].aRoot.attrs.userId).toBe(userAr.userId);
  });

  test('провал, пользователь с таким id существует и service перезапустился', async () => {
    const inputDod = dodUtility.getRequestDod<AddUserRequestDod>(
      'addUser',
      { personIin: '111333555777' },
      requestId,
    );
    let mockCallCount = 0;
    const randomUuidMock = spyOn(uuidUtility, 'getNewUUID').mockImplementation(() => {
      mockCallCount += 1;
      return mockCallCount === 2
        ? 'edc6bfdc-ae44-4e7d-a35e-f26a0e92ffdd' // second call generate new userId
        : crypto.randomUUID(); // first callgenerate transactionId and other calls
    });

    const repoAddUserMock = spyOn(UserRepository.instance(resolver), 'addUser');
    randomUuidMock.mockClear();
    const sut = module.getServiceByInputDodName<AddingUserService>('addUser');
    const result = await sut.execute(inputDod);

    expect(result.isSuccess()).toBe(true);
    const userAr = result.value as AddUserOut;

    const eventRepo = EventRepository.instance(resolver);
    const events = await eventRepo.getAggregateEvents(userAr.userId);
    expect(events.length).toBe(1);
    expect(events[0].aRoot.attrs.userId).toBe(userAr.userId);

    // reexecute service by DatabaseObjectSavingError exception
    expect(repoAddUserMock).toHaveBeenCalledTimes(2);
    expect(repoAddUserMock.mock.calls[0][0].userId).toBe('edc6bfdc-ae44-4e7d-a35e-f26a0e92ffdd');
  });
});
