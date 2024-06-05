import { describe, test, expect } from 'bun:test';
import { dodUtility } from './dod-utility.js';
import { DODPrivateFixtures as DODF } from './dod-private-fixtures.js';

const sut = dodUtility;

describe('test DODUtility class', () => {
  describe('получение DOD ошибки уровня приложения', () => {
    test('получили объект attrs', () => {
      const appError = sut.getAppError<DODF.InternalAppError>('InternalAppError', 'Ошибка сервера', {
        traceback: 'any object',
      });

      expect(appError.locale.hint).toStrictEqual({ traceback: 'any object' });
    });

    test('получили ожидаемую метаинформацию', () => {
      const appError = sut.getAppError<DODF.InternalAppError>('InternalAppError', 'some error string', {
        traceback: 'any object',
      });

      expect(appError.name).toBe('InternalAppError');
      expect(appError.meta.domainType).toBe('error');
      expect(appError.meta.errorType).toBe('app-error');
    });

    test('получили ожидаемый DOD объект ошибки уровня приложения', () => {
      const errAttrs = { traceback: 'any object' } as const;
      const appError = sut.getAppError<DODF.InternalAppError>('InternalAppError', 'app-error', errAttrs);

      expect(appError).toEqual({
        locale: {
          name: 'InternalAppError',
          text: 'app-error',
          hint: {
            traceback: errAttrs.traceback,
          },
        },
        name: 'InternalAppError',
        meta: {
          domainType: 'error',
          errorType: 'app-error',
        },
      });
    });
  });

  describe('получение DOD доменной ошибки', () => {
    test('получили объект attrs', () => {
      const errAttrs = { personId: '5' };
      const domainError = sut
        .getDomainError<DODF.PersonNotExitsErrorDOD>('PersonNotExistError', 'domain-error', errAttrs);

      expect(domainError.locale.hint).toStrictEqual({ personId: '5' });
    });

    test('получили ожидаемую метаинформацию', () => {
      const errAttrs = { personId: '5' };
      const domainError = sut
        .getDomainError<DODF.PersonNotExitsErrorDOD>('PersonNotExistError', 'domain-error', errAttrs);

      expect(domainError.name).toEqual('PersonNotExistError');
      expect(domainError.meta.domainType).toEqual('error');
      expect(domainError.meta.errorType).toEqual('domain-error');
    });

    test('получили ожидаемый DOD объект доменной ошибки', () => {
      const errAttrs = { personId: '5' };
      const domainError = sut
        .getDomainError<DODF.PersonNotExitsErrorDOD>('PersonNotExistError', 'domain-error', errAttrs);

      expect(domainError).toStrictEqual({
        locale: {
          name: 'PersonNotExistError',
          text: 'domain-error',
          hint: {
            personId: errAttrs.personId,
          },
        },
        name: 'PersonNotExistError',
        meta: {
          domainType: 'error',
          errorType: 'domain-error',
        },
      });
    });
  });
});
