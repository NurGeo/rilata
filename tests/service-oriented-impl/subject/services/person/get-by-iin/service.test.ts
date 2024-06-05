import {
  beforeEach, describe, expect, test,
} from 'bun:test';
import { ServiceModulesFixtures } from '../../../../zzz-run-server/server-fixtures.js';
import { SubjectModule } from '../../../module.js';
import { dodUtility } from '../../../../../../src/core/utils/dod/dod-utility.js';
import { GetPersonByIinRequestDod, GetPersonByIinOut } from './s-params.js';
import { GetingPersonByIinService } from './service.js';
import { PersonDoesntExistByIinError } from '../../../domain-object/person/repo-errors.js';
import { serverStarter } from '../../../../zzz-run-server/starter.js';
import { TestDatabase } from '../../../../../../src/api/database/test.database.js';
import { requestStoreMock } from '../../../../../fixtures/request-store-mock.js';

describe('get person by iin service tests', async () => {
  const requestId = 'c22fd027-a94b-4728-90eb-f6d4f96992c2';
  const testSever = serverStarter.start('all');
  const module = testSever.getModule<SubjectModule>('SubjectModule');
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

  test('успех, возвращен экз. персоны', async () => {
    const validRequestDod = dodUtility.getRequestDod<GetPersonByIinRequestDod>(
      'getPersonByIin',
      { iin: '123123123123' },
      requestId,
    );

    const sut = module.getServiceByInputDodName<GetingPersonByIinService>('getPersonByIin');
    const result = await sut.execute(validRequestDod);
    expect(result.isSuccess()).toBe(true);
    const person = result.value as GetPersonByIinOut;
    expect(person).toEqual({
      id: 'b433034e-8090-4c7d-8738-8cb78bbc6792',
      firstName: 'Bill',
      lastName: 'Geits',
      iin: '123123123123',
      contacts: {
        emails: [{ type: 'corporate', email: 'bill@microsoft.com' }],
        // not exported techSupportComments attribute
      },
    });
  });

  test('провал, персона с таким ИИН не найдена', async () => {
    const validRequestDod = dodUtility.getRequestDod<GetPersonByIinRequestDod>(
      'getPersonByIin',
      { iin: '111222111222' },
      requestId,
    );

    const sut = module.getServiceByInputDodName<GetingPersonByIinService>('getPersonByIin');
    const result = await sut.execute(validRequestDod);
    expect(result.isFailure()).toBe(true);
    const person = result.value as PersonDoesntExistByIinError;
    expect(person).toEqual({
      locale: {
        name: 'PersonDoesntExistByIinError',
        text: 'Не найден человек с ИИН: {{iin}}',
        hint: {
          iin: '111222111222',
        },
      },
      name: 'PersonDoesntExistByIinError',
      meta: {
        domainType: 'error',
        errorType: 'domain-error',
      },
    });
  });
});
