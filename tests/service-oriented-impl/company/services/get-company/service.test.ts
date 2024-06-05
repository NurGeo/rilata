import {
  describe, test, expect, beforeEach,
} from 'bun:test';
import { dodUtility } from '../../../../../src/core/utils/dod/dod-utility.js';
import { serverStarter } from '../../../zzz-run-server/starter.js';
import { ServiceModulesFixtures } from '../../../zzz-run-server/server-fixtures.js';
import { CompanyAttrs } from '../../domain-data/company/params.js';
import { CompanyDoesntExistByIdError } from '../../domain-object/company/repo-errors.js';
import { CompanyModule } from '../../module.js';
import { GetCompanyRequestDod } from './s.params.js';
import { GetingCompanyService } from './service.js';
import { TestDatabase } from '../../../../../src/api/database/test.database.js';
import { requestStoreMock } from '../../../../fixtures/request-store-mock.js';

describe('register company saga service tests', async () => {
  const requestId = '5611f332-f4d9-4c16-a561-04dabe864fc9';
  const testServer = serverStarter.start('all');
  const module = testServer.getModule<CompanyModule>('CompanyModule');
  const resolver = module.getModuleResolver();
  requestStoreMock({
    requestId,
    moduleResolver: resolver,
  });

  beforeEach(() => {
    const db = resolver.getDatabase() as unknown as TestDatabase<true>;
    db.clear();
    db.addBatch(ServiceModulesFixtures.repoFixtures);
  });

  test('успех, get запрос проходит успешно', async () => {
    const getCompanyRequestDod = dodUtility.getRequestDod<GetCompanyRequestDod>(
      'getCompany',
      { id: '28081e4d-1f7e-48c2-92da-21bacd115829' },
      requestId,
    );

    const sut = module.getServiceByInputDodName<GetingCompanyService>('getCompany');

    const result = await sut.execute(getCompanyRequestDod);
    expect(result.isSuccess()).toBe(true);
    expect(result.value as CompanyAttrs).toEqual({
      id: '28081e4d-1f7e-48c2-92da-21bacd115829',
      name: 'Windows corp.',
      bin: '111222333444',
      address: '12, Honweywell st., Goodwill, Ogaio',
      employees: ['edc6bfdc-ae44-4e7d-a35e-f26a0e92ffdd'],
      admins: ['edc6bfdc-ae44-4e7d-a35e-f26a0e92ffdd'],
    });
  });

  test('провал, нет такой компании', async () => {
    const sut = module.getServiceByInputDodName<GetingCompanyService>('getCompany');

    const notFindedRequestDod = dodUtility.getRequestDod<GetCompanyRequestDod>(
      'getCompany',
      { id: '1cd34c3b-3bc7-4966-973e-4b3671587b39' },
      requestId,
    );

    const result = await sut.execute(notFindedRequestDod);
    expect(result.isFailure()).toBe(true);
    expect(result.value as CompanyDoesntExistByIdError).toEqual({
      locale: {
        name: 'CompanyDoesntExistByIdError',
        text: 'Не найдена компания с id: {{id}}',
        hint: {
          id: '1cd34c3b-3bc7-4966-973e-4b3671587b39',
        },
      },
      name: 'CompanyDoesntExistByIdError',
      meta: {
        domainType: 'error',
        errorType: 'domain-error',
      },
    });
  });
});
