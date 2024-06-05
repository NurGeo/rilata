import {
  describe, expect, spyOn, test,
} from 'bun:test';
import { getEnvLogMode } from '#core/logger/logger-modes.js';
import { UserId } from '../../../src/core/types.js';
import { JwtCreator } from '../../api/jwt/jwt-creator.js';
import { JwtVerifier } from '../../api/jwt/jwt-verifier.js';
import { defaultJwtConfig } from '../../api/server/configs.js';
import { ServerResolver } from '../../api/server/s-resolver.js';
import { ServerResolves } from '../../api/server/s-resolves.js';
import { JwtConfig } from '../../api/server/types.js';
import { JwtDecoder } from '../../core/jwt/jwt-decoder.js';
import { IncorrectTokenError, JwtVerifyErrors, NotValidTokenPayloadError, TokenExpiredError } from '../../core/jwt/jwt-errors.js';
import { ConsoleLogger } from '../../core/logger/console-logger.js';
import { Logger } from '../../core/logger/logger.js';
import { uuidUtility } from '../../core/utils/uuid/uuid-utility.js';
import { BaseJwtDecoder } from './base-jwt-decoder.js';
import { JwtCreatorImpl } from './jwt-creator.js';
import { JwtVerifierImpl } from './jwt-verifier.js';

type TestJwtPayload = {
  userId: UserId,
};

const jwtExpiredTime = new Date('1970-01-26T23:25:55.302Z').getTime(); // 2244355302
const refreshJwtExpiredTime = new Date('1970-01-28T23:25:55.302Z').getTime(); // 2417155302
const jwtSecret = 'your-256-bit-secret';
const jwtConfig: JwtConfig = {
  algorithm: 'HS256',
  jwtLifetimeAsHour: 24,
  jwtRefreshLifetimeAsHour: 24 * 3,
};

class TestJwtDecoder extends BaseJwtDecoder<TestJwtPayload> {
  constructor(public expiredTimeShiftAsMs: number) {
    super();
  }

  payloadBodyIsValid(payload: TestJwtPayload): boolean {
    return uuidUtility.isValidValue(payload.userId);
  }

  getNow(): number {
    return jwtExpiredTime - 2000; // tokenTime - 2 second;
  }
}

function getJwtFakeResolver(
  expiredTimeShiftAsMs: number,
): ServerResolver<ServerResolves<TestJwtPayload>> {
  const decoder = new TestJwtDecoder(expiredTimeShiftAsMs);
  const creator = new JwtCreatorImpl<TestJwtPayload>(jwtSecret, jwtConfig);
  const verifier = new JwtVerifierImpl<TestJwtPayload>(jwtSecret, jwtConfig);

  const resolver = {
    getLogger(): Logger {
      return new ConsoleLogger(getEnvLogMode() ?? 'all');
    },

    getJwtDecoder(): JwtDecoder<TestJwtPayload> {
      return decoder;
    },

    getJwtCreator(): JwtCreator<TestJwtPayload> {
      return creator;
    },

    getJwtVerifier(): JwtVerifier<TestJwtPayload> {
      return verifier;
    },

    getJwtSecretKey(): string {
      return 'your-256-bit-secret';
    },

    getJwtConfig(): Required<JwtConfig> {
      return defaultJwtConfig;
    },
  } as unknown as ServerResolver<ServerResolves<TestJwtPayload>>;

  creator.init(resolver);
  verifier.init(resolver);
  return resolver;
}

const backendJwtResolver = getJwtFakeResolver(0); // backend expired jwt shift time === 0

const incorectTokenError: IncorrectTokenError = {
  locale: {
    text: 'Невозможно расшифровать токен. Токен имеет не верный формат.',
    hint: {},
    name: 'IncorrectTokenError',
  },
  name: 'IncorrectTokenError',
  meta: {
    domainType: 'error',
    errorType: 'domain-error',
  },
};
const correctToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MzZlNzQ2My1iMjRkLTRlN2ItYmFkOS0yYmQyZWQ4MDExZmQiLCJleHAiOjIyNDQzNTUzMDIsInR5cCI6ImFjY2VzcyJ9.JMAJlarkXQ-Za9FVpJdt42r0iv8GcE6vg81d9kxRVog';
const incorrectToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cc2VySWQiOiI1MzZlNzQ2My1iMjRkLTRlN2ItYmFkOS0yYmQyZWQ4MDExZmQiLCJleHAiOjIyNDQzNTUzMDIsInR5cCI6ImFjY2VzcyJ9.JMAJlarkXQ-Za9FVpJdt42r0iv8GcE6vg81d9kxRVog';

describe('all jwt tests', () => {
  describe('decode jwt tests', () => {
    const sut = backendJwtResolver.getJwtDecoder();

    test('Успех, получена полезная нагрузка с токена', () => {
      const result = sut.getTokenPayload(correctToken);
      expect(result.isSuccess()).toBe(true);
      const payloadValue = result.value as TestJwtPayload;
      expect(payloadValue.userId).toBe('536e7463-b24d-4e7b-bad9-2bd2ed8011fd');
      expect(Object.keys(payloadValue)).toEqual(['userId']);
    });

    test('Провал, тело токена невалидно.', () => {
      const payload = sut.getTokenPayload(incorrectToken);
      expect(payload.isFailure()).toBe(true);
      expect(payload.value as IncorrectTokenError).toEqual(incorectTokenError);
    });

    test('Провал, тело токена невалидно - дата истечения не является числом', () => {
      const expIncorrectToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MzZlNzQ2My1iMjRkLTRlN2ItYmFkOS0yYmQyZWQ4MDExZmQiLCJleHAiOiIyMjQ0czU1MzAyIiwidHlwIjoiYWNjZXNzIn0.PtT9E3rkntF4-u8osWisrnTfBjkSVvEnH3PBlFhUby8';
      const payload = sut.getTokenPayload(expIncorrectToken);
      expect(payload.isFailure()).toBe(true);
      expect(payload.value as IncorrectTokenError).toEqual(incorectTokenError);
    });

    test('Провал, тело токена невалидно - поле типа токена не валидно', () => {
      const refreshIncorrectToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MzZlNzQ2My1iMjRkLTRlN2ItYmFkOS0yYmQyZWQ4MDExZmQiLCJleHAiOjIyNDQ1NTMwMiwidHlwIjoiYWNjZXMifQ.c84pXgs-mkkz7_Qeiq3HZmYHyUt-h2fJfwitjetG_XM';
      const payload = sut.getTokenPayload(refreshIncorrectToken);
      expect(payload.isFailure()).toBe(true);
      expect(payload.value as IncorrectTokenError).toEqual(incorectTokenError);
    });

    test('Провал, тело токена невалидно - по валидации тела токена', () => {
      const notValidPayloadToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MzZlNzQ2LWIyNGQtNGU3Yi1iYWQ5LTJiZDJlZDgwMTFmZCIsImV4cCI6MjI0NDM1NTMwMiwidHlwIjoiYWNjZXNzIn0.vw2WkOGp8KZJ6bdtGsKRxiS5cFu8CtBafMvr0abdSgU';
      const payload = sut.getTokenPayload(notValidPayloadToken);
      expect(payload.isFailure()).toBe(true);
      expect(payload.value as NotValidTokenPayloadError).toEqual({
        locale: {
          text: 'Невалидная полезная нагрузка в токене.',
          hint: {},
          name: 'NotValidTokenPayloadError',
        },
        name: 'NotValidTokenPayloadError',
        meta: {
          domainType: 'error',
          errorType: 'domain-error',
        },
      });
    });

    describe('time expired tests', () => {
      test('Провал, время токена истекло', () => {
        spyOn(sut, 'getNow').mockReturnValueOnce(jwtExpiredTime + 10);
        const payload = sut.getTokenPayload(correctToken);
        expect(payload.isFailure()).toBe(true);
        expect(payload.value as TokenExpiredError).toEqual({
          locale: {
            text: 'Токен просрочен.',
            hint: {},
            name: 'TokenExpiredError',
          },
          name: 'TokenExpiredError',
          meta: {
            domainType: 'error',
            errorType: 'domain-error',
          },
        });
      });

      test('Провал, время токена истекло - случай для фронта с timeshift равной 3 секунды', () => {
        const frontendResolver = getJwtFakeResolver(3000); // frontend jwt expired timeshift 3000 ms
        const frontendSut = frontendResolver.getJwtDecoder();
        const payload = frontendSut.getTokenPayload(correctToken);
        expect(payload.isFailure()).toBe(true);
        expect(payload.value as TokenExpiredError).toEqual({
          locale: {
            text: 'Токен просрочен.',
            hint: {},
            name: 'TokenExpiredError',
          },
          name: 'TokenExpiredError',
          meta: {
            domainType: 'error',
            errorType: 'domain-error',
          },
        });
      });
    });

    describe('refresh token tests', () => {
      const refreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MzZlNzQ2My1iMjRkLTRlN2ItYmFkOS0yYmQyZWQ4MDExZmQiLCJleHAiOjI0MTcxNTUzMDIsInR5cCI6InJlZnJlc2gifQ.oRmLhBnREiTzVn7fuW3M6Fo4jR3nIrgBHgO3bAyZti0';

      test('успех, время рефреш токена не истекло', () => {
        // эмулирует время после истечения срока действия access токена (на всякий случай)
        const getNowMock = spyOn(sut, 'getNow').mockReturnValueOnce(jwtExpiredTime + 1000);
        getNowMock.mockClear();
        const result = sut.getTokenPayload(refreshToken);
        expect(result.isSuccess()).toBe(true);
        expect(result.value as TestJwtPayload).toEqual({
          userId: '536e7463-b24d-4e7b-bad9-2bd2ed8011fd',
        });
        expect(getNowMock).toHaveBeenCalledTimes(1);
      });

      test('провал, время рефреш токена истекло', () => {
        const getNowMock = spyOn(sut, 'getNow').mockReturnValueOnce(refreshJwtExpiredTime + 10);
        getNowMock.mockClear();
        const result = sut.getTokenPayload(correctToken);
        expect(result.isFailure()).toBe(true);
        expect(result.value as TokenExpiredError).toEqual({
          locale: {
            text: 'Токен просрочен.',
            hint: {},
            name: 'TokenExpiredError',
          },
          name: 'TokenExpiredError',
          meta: {
            domainType: 'error',
            errorType: 'domain-error',
          },
        });
        expect(getNowMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('create jwt tests', () => {
    const sut = backendJwtResolver.getJwtCreator();
    const decoder = backendJwtResolver.getJwtDecoder();

    test('успех, токен создан успешно', () => {
      const jwtLifeTimeAsMs = jwtConfig.jwtLifetimeAsHour * 60 * 60 * 1000;
      const getNowMock = spyOn(decoder, 'getNow').mockReturnValueOnce(jwtExpiredTime - jwtLifeTimeAsMs);
      getNowMock.mockClear();
      const jwt = sut.createToken({ userId: '536e7463-b24d-4e7b-bad9-2bd2ed8011fd' }, 'access');
      expect(jwt).toBe(correctToken);
      expect(getNowMock).toHaveBeenCalledTimes(1);

      const payloadResult = decoder.getTokenPayload(jwt);
      expect(payloadResult.isSuccess()).toBeTrue();
      expect(payloadResult.value).toEqual({ userId: '536e7463-b24d-4e7b-bad9-2bd2ed8011fd' });
      expect(getNowMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('verify jwt tests', () => {
    const sut = backendJwtResolver.getJwtVerifier();

    test('успех, верификация access прошла усешно', () => {
      const refreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MzZlNzQ2My1iMjRkLTRlN2ItYmFkOS0yYmQyZWQ4MDExZmQiLCJleHAiOjIyNDQzNTUzMDIsInR5cCI6InJlZnJlc2gifQ.hqUjb_WCnBqiNDrtH8Pkn7RsKAbgFEyrDkJKXz48wrU';
      const verifyResult = sut.verifyToken(refreshToken);
      expect(verifyResult.isSuccess()).toBeTrue();
      expect(verifyResult.value).toEqual({ userId: '536e7463-b24d-4e7b-bad9-2bd2ed8011fd' });
    });

    test('успех, верификация refresh прошла усешно', () => {
      const verifyResult = sut.verifyToken(correctToken);
      expect(verifyResult.isSuccess()).toBeTrue();
      expect(verifyResult.value).toEqual({ userId: '536e7463-b24d-4e7b-bad9-2bd2ed8011fd' });
    });

    test('провал, верификация прошла неуспешно', () => {
      const verifyResult = sut.verifyToken(incorrectToken);
      expect(verifyResult.isFailure()).toBeTrue();
      expect((verifyResult.value as JwtVerifyErrors).name).toBe('JwtVerifyError');
    });

    test('провал, верификация прошла неусешно по секретному ключу', () => {
      // token generated by secret key = 'your-256-bit-secre'. Valid key = 'your-256-bit-secret'
      const incorrectTokenBySecretKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MzZlNzQ2My1iMjRkLTRlN2ItYmFkOS0yYmQyZWQ4MDExZmQiLCJleHAiOjIyNDQzNTUzMDIsInR5cCI6ImFjY2VzcyJ9.6yTj1JMXATmmyzUKCOVUVWULtNCGRWv1hNe2ues6eic';
      const verifyResult = sut.verifyToken(incorrectTokenBySecretKey);
      expect(verifyResult.isFailure()).toBeTrue();
      expect((verifyResult.value as JwtVerifyErrors).name).toBe('JwtVerifyError');
    });
  });
});
