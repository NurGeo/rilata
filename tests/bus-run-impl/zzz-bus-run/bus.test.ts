import {
  describe, test, expect, afterAll,
} from 'bun:test';
import { EventRepository } from '../../../src/api/database/event.repository.js';
import { BusBunServer } from '../../../src/api/server/bus-server.js';
import { dodUtility } from '../../../src/core/utils/dod/dod-utility.js';
import { dtoUtility } from '../../../src/core/utils/dto/dto-utility.js';
import { uuidUtility } from '../../../src/core/utils/uuid/uuid-utility.js';
import { AddCompanyRequestDod, AddCompanyRequestDodAttrs } from '../company-cmd/services/company/add-company/s.params.js';
import { CompanyOutAttrs } from '../company-read/domain/company/params.js';
import { CompanyReadRepository } from '../company-read/domain/company/repo.js';
import { CompanyReadModule } from '../company-read/module.js';
import { serverStarter } from './starter.js';

describe('add company service tests', async () => {
  function timeout() {
    // eslint-disable-next-line no-promise-executor-return
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  const requestId = 'c22fd027-a94b-4728-90eb-f6d4f96992c2';
  const testServer = serverStarter.start('all') as BusBunServer;
  testServer.run();
  const serverResolver = testServer.getServerResolver();

  afterAll(() => {
    testServer.stop();
  });

  const addCompanyRequestDodAttrs: AddCompanyRequestDodAttrs = {
    name: 'Google corporation',
    bin: '222333444555',
  };
  const addCompanyRequestDod = dodUtility.getRequestDod<AddCompanyRequestDod>(
    'addCompany', addCompanyRequestDodAttrs, requestId,
  );
  const authToken = serverResolver.getJwtCreator().createToken(
    { userId: '2a96aec7-1091-4449-8369-c3d9f91f1a56' },
    'access',
  );

  test('успех, компания успешно добавлена, событие доставлено до read-module и успешно обработано', async () => {
    // execute service
    const req = new Request(new URL('http://0.0.0.0:3000/api/company-cmd-module/'), {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authToken,
      },
      body: JSON.stringify(dtoUtility.deepCopy(addCompanyRequestDod)),
    });

    const resp = await testServer.fetch(req);
    const respJson = await resp.json();
    const newCompanyId = respJson?.payload?.id;

    // check response
    expect(uuidUtility.isValidValue(newCompanyId)).toBe(true);
    expect(respJson).toEqual({
      httpStatus: 200,
      success: true,
      payload: { id: newCompanyId },
    });

    // check event delivered and handled
    const readResolver = testServer
      .getModule<CompanyReadModule>('CompanyReadModule')
      .getModuleResolver();

    // выполним setTimeout, чтобы выполнились все отложенные задачи
    await timeout();

    const readRepo = CompanyReadRepository.instance(readResolver);
    const result = await readRepo.getByBin('222333444555');
    expect(result.isSuccess()).toBe(true);
    const companyAttrs = result.value as CompanyOutAttrs;
    expect(companyAttrs).toEqual({
      id: newCompanyId,
      name: 'Google corporation',
      bin: '222333444555',
      version: 0,
    });

    // check event added for read module
    const eventRepo = EventRepository.instance(readResolver);
    setTimeout(async () => {
      const events = await eventRepo.getAggregateEvents(newCompanyId);
      expect(events.length).toBe(1);
      const event = events[0];
      expect(event).toEqual({
        attrs: {
          bin: '222333444555',
          name: 'Google corporation',
        },
        meta: {
          domainType: 'event',
          eventId: event.meta.eventId,
          moduleName: 'CompanyReadModule',
          serviceName: 'CompanyAddedService',
          name: 'CompanyAddedEvent',
          requestId: 'c22fd027-a94b-4728-90eb-f6d4f96992c2',
          created: event.meta.created,
        },
        caller: {
          type: 'DomainUser',
          userId: '2a96aec7-1091-4449-8369-c3d9f91f1a56',
        },
        aRoot: {
          attrs: {
            bin: '222333444555',
            id: event.aRoot.attrs.id,
            name: 'Google corporation',
          },
          meta: {
            domainType: 'aggregate',
            idName: 'id',
            name: 'CompanyAR',
            version: 0,
          },
        },
      });
    }, 0);
    await timeout();
  });
});
