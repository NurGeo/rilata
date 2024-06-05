import {
  beforeEach, describe, expect, test,
} from 'bun:test';
import { TestDatabase } from '../../../../../../src/api/database/test.database.js';
import { dodUtility } from '../../../../../../src/core/utils/dod/dod-utility.js';
import { requestStoreMock } from '../../../../../fixtures/request-store-mock.js';
import { UserRepositoryImpl } from '../../../../zz-infra/repositories/auth-module/user.js';
import { serverStarter } from '../../../../zzz-run-server/starter.js';
import { AuthModule } from '../../../module.js';
import { GetUsersRequestDod } from './s-params.js';
import { GetingUsersService } from './service.js';

describe('get users service test', async () => {
  const requestId = 'c22fd027-a94b-4728-90eb-f6d4f96992c2';
  const testSever = serverStarter.start(['AuthModule']);
  const module = testSever.getModule<AuthModule>('AuthModule');
  const resolver = module.getModuleResolver();
  requestStoreMock({
    requestId,
    moduleResolver: resolver,
  });
  const sut = module.getServiceByInputDodName<GetingUsersService>('getUsers');

  beforeEach(async () => {
    const db = resolver.getDatabase() as unknown as TestDatabase<true>;
    await db.clear();
    await db.addBatch<UserRepositoryImpl['testRepo']>({
      user_repo: [
        {
          userId: '2e1513af-4389-4137-95d8-1db4a200b683',
          version: 0,
          personIin: '333444333444',
        },
        {
          userId: 'fad938e0-3d9a-4db9-a597-aa814b454fac',
          version: 0,
          personIin: '444555444555',
        },
        {
          userId: 'b89fda64-a032-498c-9cb8-713014340360',
          version: 0,
          personIin: '333444333444',
        },
      ],
    });
  });

  test('успех, возвращены данные пользователей', async () => {
    const validDod = dodUtility.getRequestDod<GetUsersRequestDod>(
      'getUsers',
      {
        userIds: [
          '2e1513af-4389-4137-95d8-1db4a200b683',
          'b89fda64-a032-498c-9cb8-713014340360',
        ],
      },
    );
    const result = await sut.execute(validDod);
    expect(result.value).toEqual([
      {
        userId: '2e1513af-4389-4137-95d8-1db4a200b683',
        personIin: '333444333444',
      },
      {
        userId: 'b89fda64-a032-498c-9cb8-713014340360',
        personIin: '333444333444',
      },
    ]);
  });

  test('успех, возвращаются экземпляры только совпадающих значений id', async () => {
    const validDod = dodUtility.getRequestDod<GetUsersRequestDod>(
      'getUsers',
      {
        userIds: [
          'fad938e0-3d9a-4db9-a597-aa814b454fac',
          'c0374a83-4798-484b-a2e9-e4ab808e5916',
        ],
      },
    );
    const result = await sut.execute(validDod);
    expect(result.value).toEqual([
      {
        userId: 'fad938e0-3d9a-4db9-a597-aa814b454fac',
        personIin: '444555444555',
      },
    ]);
  });
});
