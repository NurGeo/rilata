/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  describe, test, expect, beforeEach, spyOn, afterEach, Mock,
} from 'bun:test';
import { failure } from '../../../../../src/core/result/failure.js';
import { success } from '../../../../../src/core/result/success.js';
import { dodUtility } from '../../../../../src/core/utils/dod/dod-utility.js';
import { dtoUtility } from '../../../../../src/core/utils/dto/dto-utility.js';
import { uuidUtility } from '../../../../../src/core/utils/uuid/uuid-utility.js';
import { AuthFacade } from '../../../auth/facade.js';
import { PersonAlreadyExistsError, PersonDoesntExistByIinError } from '../../../subject/domain-object/person/repo-errors.js';
import { SubjectFacade } from '../../../subject/facade.js';
import { AddPersonRequestDodAttrs } from '../../../subject/services/person/add-person/s-params.js';
import { serverStarter } from '../../../zzz-run-server/starter.js';
import { ServiceModulesFixtures } from '../../../zzz-run-server/server-fixtures.js';
import { CompanyAR } from '../../domain-object/company/a-root.js';
import { CompanyRepository } from '../../domain-object/company/repo.js';
import { CompanyAlreadyExistError } from '../../domain-object/company/repo-errors.js';
import { CompanyModule } from '../../module.js';
import { RegisterCompanyRequestDod, RegisterCompanyOut, RegisterCompanyRequestDodAttrs } from './s.params.js';
import { RegisteringCompanyService } from './service.js';
import { TestDatabase } from '../../../../../src/api/database/test.database.js';
import { EventRepository } from '../../../../../src/api/database/event.repository.js';
import { DomainUser } from '../../../../../src/api/controller/types.js';
import { requestStoreMock } from '../../../../fixtures/request-store-mock.js';

describe('register company saga service tests', async () => {
  const requestId = 'c22fd027-a94b-4728-90eb-f6d4f96992c2';
  const testSever = serverStarter.start('all');
  const module = testSever.getModule<CompanyModule>('CompanyModule');
  const resolver = module.getModuleResolver();
  requestStoreMock({
    requestId,
    moduleResolver: resolver,
  });
  const sut = module.getServiceByInputDodName<RegisteringCompanyService>('registerCompany');

  const subjectFacade = SubjectFacade.instance(resolver);
  const authFacade = AuthFacade.instance(resolver);
  let addPersonMock: Mock<(...args: any[]) => any>;
  let getPersonMock: Mock<(...args: any[]) => any>;
  let addUserMock: Mock<(...args: any[]) => any>;

  beforeEach(async () => {
    const db = resolver.getDatabase() as unknown as TestDatabase<true>;
    await db.clear();
    await db.addBatch(ServiceModulesFixtures.repoFixtures);
    addPersonMock = spyOn(subjectFacade, 'addPerson');
    getPersonMock = spyOn(subjectFacade, 'getPersonByIin');
    addUserMock = spyOn(authFacade, 'addUser');
  });

  afterEach(() => {
    addPersonMock.mockRestore();
    getPersonMock.mockRestore();
    addUserMock.mockRestore();
  });

  describe('добавление компании с новой персоной админа requestType = newPerson', () => {
    const registerCompanyRequestDodAttrs: RegisterCompanyRequestDodAttrs = {
      person: {
        type: 'newPerson',
        firstName: 'Sergey',
        lastName: 'Brin',
        iin: '000111222333',
      },
      company: {
        name: 'Google corporation',
        bin: '222333444555',
        address: '1600 Amphitheatre Parkway in Mountain View, California',
      },
    };
    const registerCompanyRequestDod = dodUtility.getRequestDod<RegisterCompanyRequestDod>(
      'registerCompany',
      registerCompanyRequestDodAttrs,
      requestId,
    );
    const newPersonId = 'c7da4297-a958-4263-98ee-e0e0ec75ccf8';
    const newUserId = 'c6c0ac87-b6a5-4a70-a843-19cb92b899c8';

    test('успех, компания успешно добавлена, пользователь добавлен, персона добавлена', async () => {
      // preparation mocks
      addPersonMock.mockResolvedValueOnce(success({ id: newPersonId }));
      getPersonMock.mockImplementation(async () => { throw Error('not be called'); });
      addUserMock.mockResolvedValueOnce(success({ userId: newUserId }));

      // execute service
      const result = await sut.execute(dtoUtility.deepCopy(registerCompanyRequestDod));
      expect(result.isSuccess()).toBe(true);
      const addValue = (result.value as RegisterCompanyOut);
      expect(uuidUtility.isValidValue(addValue.id)).toBe(true);

      // subject facade called => person added
      expect(addPersonMock).toHaveBeenCalledTimes(1);
      expect(addPersonMock.mock.calls[0][0]).toEqual({
        firstName: 'Sergey',
        lastName: 'Brin',
        iin: '000111222333',
      });

      // subject facade get person not called
      expect(getPersonMock).toHaveBeenCalledTimes(0);

      // auth facade called => user added
      expect(addUserMock).toHaveBeenCalledTimes(1);
      expect(addUserMock.mock.calls[0][0]).toBe('000111222333');
      expect(addUserMock.mock.calls[0][1]).toEqual(
        { type: 'DomainUser', userId: 'fb8a83cf-25a3-2b4f-86e1-27f6de6d8374' },
      );

      // company added
      const companyRepo = CompanyRepository.instance(resolver);
      const getResult = await companyRepo.getById(addValue.id);
      expect(getResult.isSuccess()).toBe(true);
      const company = getResult.value as CompanyAR;
      expect(company.getAttrs()).toEqual({
        id: addValue.id,
        name: 'Google corporation',
        bin: '222333444555',
        address: '1600 Amphitheatre Parkway in Mountain View, California',
        employees: [newUserId],
        admins: [newUserId],
      });

      const eventRepo = EventRepository.instance(resolver);
      const events = await eventRepo.getAggregateEvents(company.getId());
      expect(events.length).toBe(1);
      expect(events[0].meta.name).toBe('CompanyRegisteredEvent');
    });

    test('провал, компания с таким БИН уже существует', async () => {
      // preparation mocks
      addPersonMock.mockImplementation(() => { throw Error('not be called'); });
      getPersonMock.mockImplementation(async () => { throw Error('not be called'); });
      addUserMock.mockImplementation(() => { throw Error('not be called'); });

      // execute service
      const existCompanyRequestDod = dtoUtility.replaceAttrs(registerCompanyRequestDod, {
        attrs: { company: { bin: '111222333444' } },
      });
      const result = await sut.execute(dtoUtility.deepCopy(existCompanyRequestDod));
      expect(result.isFailure()).toBe(true);
      const errValue = (result.value as CompanyAlreadyExistError);
      expect(errValue).toEqual({
        locale: {
          name: 'CompanyAlreadyExistError',
          text: 'Компания с БИН {{bin}} уже существует',
          hint: {
            bin: '111222333444',
          },
        },
        name: 'CompanyAlreadyExistError',
        meta: {
          domainType: 'error',
          errorType: 'domain-error',
        },
      });

      // facades not called
      expect(addPersonMock).toHaveBeenCalledTimes(0);
      expect(getPersonMock).toHaveBeenCalledTimes(0);
      expect(addUserMock).toHaveBeenCalledTimes(0);
    });

    test('провал, персона с таким ИИН уже существует', async () => {
      // preparation mocks
      addPersonMock.mockImplementation(
        async (attrs: AddPersonRequestDodAttrs, caller: DomainUser) => {
          const err = dodUtility.getDomainError<PersonAlreadyExistsError>(
            'PersonAlreadyExistsError',
            'Человек с данным ИИН уже существует в системе',
            { iin: attrs.iin },
          );
          return failure(err);
        },
      );
      getPersonMock.mockImplementation(async () => { throw Error('not be called'); });
      addUserMock.mockImplementation(() => { throw Error('not be called'); });

      // execute service
      const existPersonRequestDod = dtoUtility.replaceAttrs(registerCompanyRequestDod, {
        attrs: { person: { iin: '123123123123' } },
      });
      const result = await sut.execute(existPersonRequestDod);
      expect(result.isFailure()).toBe(true);
      const errValue = (result.value as PersonAlreadyExistsError);
      expect(errValue).toEqual({
        locale: {
          text: 'Человек с данным ИИН уже существует в системе',
          hint: { iin: '123123123123' },
          name: 'PersonAlreadyExistsError',
        },
        name: 'PersonAlreadyExistsError',
        meta: {
          domainType: 'error',
          errorType: 'domain-error',
        },
      });

      // facades not called
      expect(addPersonMock).toHaveBeenCalledTimes(1);
      expect(getPersonMock).toHaveBeenCalledTimes(0);
      expect(addUserMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('добавление компании с существующей персоной админа requestType=existPerson', () => {
    const registerCompanyRequestDodAttrs: RegisterCompanyRequestDodAttrs = {
      person: {
        type: 'existPerson',
        iin: '000111222333',
      },
      company: {
        name: 'Google corporation',
        bin: '222333444555',
        address: '1600 Amphitheatre Parkway in Mountain View, California',
      },
    };
    const registerCompanyRequestDod = dodUtility.getRequestDod<RegisterCompanyRequestDod>(
      'registerCompany',
      registerCompanyRequestDodAttrs,
      requestId,
    );
    const existPersonId = '03f991e6-4c4c-4538-8bb9-239f2df868fb';
    const newUserId = '62662641-3473-475f-80e8-6db254953a4b';

    test('успех, компания успешно добавлена, пользователь добавлен, персона существующая', async () => {
      // preparation mocks
      addPersonMock.mockImplementation(() => { throw Error('not be called'); });
      getPersonMock.mockImplementation(async (iin, caller) => (
        success({
          id: existPersonId,
          iin: '000111222333',
          firstName: 'Will',
          lastName: 'Smith',
          contacts: {
            phones: [],
          },
        })
      ));
      addUserMock.mockResolvedValueOnce(success({ userId: newUserId }));

      // execute service
      const result = await sut.execute(dtoUtility.deepCopy(registerCompanyRequestDod));
      expect(result.isSuccess()).toBe(true);
      const addValue = (result.value as RegisterCompanyOut);
      expect(uuidUtility.isValidValue(addValue.id)).toBe(true);

      // subject facade not be called
      expect(addPersonMock).toHaveBeenCalledTimes(0);

      // subject facade getPerson called => user returned
      expect(getPersonMock).toHaveBeenCalledTimes(1);
      expect(getPersonMock.mock.calls[0][0]).toEqual('000111222333');
      expect(getPersonMock.mock.calls[0][1]).toEqual(
        { type: 'DomainUser', userId: 'fb8a83cf-25a3-2b4f-86e1-27f6de6d8374' },
      );

      // auth facade called => user added
      expect(addUserMock).toHaveBeenCalledTimes(1);
      expect(addUserMock.mock.calls[0][0]).toBe('000111222333');
      expect(addUserMock.mock.calls[0][1]).toEqual(
        { type: 'DomainUser', userId: 'fb8a83cf-25a3-2b4f-86e1-27f6de6d8374' },
      );

      // company added
      const companyRepo = CompanyRepository.instance(resolver);
      const getResult = await companyRepo.getById(addValue.id);
      expect(getResult.isSuccess()).toBe(true);
      const company = getResult.value as CompanyAR;
      expect(company.getAttrs()).toEqual({
        id: addValue.id,
        name: 'Google corporation',
        bin: '222333444555',
        address: '1600 Amphitheatre Parkway in Mountain View, California',
        employees: [newUserId],
        admins: [newUserId],
      });

      const eventRepo = EventRepository.instance(resolver);
      const events = await eventRepo.getAggregateEvents(company.getId());
      expect(events.length).toBe(1);
      expect(events[0].meta.name).toBe('CompanyRegisteredEvent');
    });

    test('провал, персона с таким ИИН не зарегестрирована', async () => {
      // preparation mocks
      addPersonMock.mockImplementation(() => { throw Error('not be called'); });
      getPersonMock.mockImplementation(
        async () => {
          const err = dodUtility.getDomainError<PersonDoesntExistByIinError>(
            'PersonDoesntExistByIinError',
            'Не найден человек с ИИН: {{iin}}',
            { iin: '000000000001' },
          );
          return failure(err);
        },
      );
      addUserMock.mockResolvedValueOnce(success({ userId: newUserId }));

      // execute service
      const existPersonRequestDod = dtoUtility.replaceAttrs(registerCompanyRequestDod, {
        attrs: { person: { iin: '000000000001' } },
      });
      const result = await sut.execute(dtoUtility.deepCopy(existPersonRequestDod));
      expect(result.isFailure()).toBe(true);
      const errValue = (result.value as PersonDoesntExistByIinError);
      expect(errValue).toEqual({
        locale: {
          name: 'PersonDoesntExistByIinError',
          text: 'Не найден человек с ИИН: {{iin}}',
          hint: {
            iin: '000000000001',
          },
        },
        name: 'PersonDoesntExistByIinError',
        meta: {
          domainType: 'error',
          errorType: 'domain-error',
        },
      });

      // facades not called
      expect(addPersonMock).toHaveBeenCalledTimes(0);
      expect(getPersonMock).toHaveBeenCalledTimes(1);
      expect(getPersonMock.mock.calls[0][0]).toBe('000000000001');
      expect(getPersonMock.mock.calls[0][1]).toEqual(
        { type: 'DomainUser', userId: 'fb8a83cf-25a3-2b4f-86e1-27f6de6d8374' },
      );
      expect(addUserMock).toHaveBeenCalledTimes(0);
    });
  });
});
