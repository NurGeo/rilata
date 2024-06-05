/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  IncorrectTokenError, JwtDecodeErrors,
  NotValidTokenPayloadError, TokenExpiredError,
} from '../../core/jwt/jwt-errors.js';
import { DTO } from '../../domain/dto.js';
import { failure } from '../../core/result/failure.js';
import { success } from '../../core/result/success.js';
import { Result } from '../../core/result/types.js';
import { dodUtility } from '../../core/utils/dod/dod-utility.js';
import { dtoUtility } from '../../core/utils/dto/dto-utility.js';
import { JwtHmacHashUtils } from '../../core/utils/jwt/jwt-utils.js';
import { UnionToTuple } from '../../core/tuple-types.js';
import { JwtDecoder } from '../../core/jwt/jwt-decoder.js';
import { JwtPayload, JwtType } from '../../core/jwt/types.js';

/** Класс для декодирования JWT токена. */
export abstract class BaseJwtDecoder<
  PAYLOAD extends DTO
> implements JwtDecoder<PAYLOAD> {
  /** Уменьшает время реального истечения токена на указанное значение.
    Для бэка скорее всего 0, для фронта например 3000 */
  protected abstract expiredTimeShiftAsMs: number;

  /** Возвращает ответ, что тело payload соответвует требуемому */
  abstract payloadBodyIsValid(payload: PAYLOAD): boolean

  getTokenPayload(rawToken: string): Result<JwtDecodeErrors, PAYLOAD> {
    const decodedPayload = this.decodeJwt(rawToken);
    if (decodedPayload === undefined) return this.getError('IncorrectTokenError');

    if (this.dateIsExpired(decodedPayload)) return this.getError('TokenExpiredError');

    const keys: UnionToTuple<keyof JwtPayload<Record<never, unknown>>> = ['exp', 'typ'];
    const payload = dtoUtility.excludeAttrs(decodedPayload, keys) as unknown as PAYLOAD;
    return this.payloadBodyIsValid(payload) ? success(payload) : this.getError('NotValidTokenPayloadError');
  }

  getTokenType(rawToken: string): JwtType | undefined {
    const decodedPayload = this.decodeJwt(rawToken);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return decodedPayload?.typ;
  }

  dateIsExpired(rawOrPayload: string | JwtPayload<PAYLOAD>): boolean {
    const decodedPayload = typeof rawOrPayload === 'string'
      ? this.decodeJwt(rawOrPayload)
      : rawOrPayload;
    if (
      !decodedPayload
      || typeof decodedPayload?.exp !== 'number'
    ) return true;
    return (this.getNow() + this.expiredTimeShiftAsMs) - decodedPayload.exp > 0;
  }

  /** Добавлено для возможности мока в тестах */
  getNow(): number {
    return Date.now();
  }

  getError<E extends JwtDecodeErrors>(name: E['name']): Result<E, never> {
    if (name === 'IncorrectTokenError') {
      return failure(dodUtility.getDomainError<IncorrectTokenError>(
        'IncorrectTokenError',
        'Невозможно расшифровать токен. Токен имеет не верный формат.',
        {},
      )) as Result<E, never>;
    }
    if (name === 'NotValidTokenPayloadError') {
      return failure(dodUtility.getDomainError<NotValidTokenPayloadError>(
        'NotValidTokenPayloadError',
        'Невалидная полезная нагрузка в токене.',
        {},
      )) as Result<E, never>;
    }
    return failure(dodUtility.getDomainError<TokenExpiredError>(
      'TokenExpiredError',
      'Токен просрочен.',
      {},
    )) as Result<E, never>;
  }

  protected decodeJwt(rawToken: string): JwtPayload<PAYLOAD> | undefined {
    const jwtHmacUtils = new JwtHmacHashUtils();
    try {
      const result = jwtHmacUtils.getPayload(rawToken);
      return (
        !result
        || typeof result !== 'object'
        || typeof result?.exp !== 'number'
        || typeof result?.typ !== 'string'
        || ['access', 'refresh'].includes(result.typ) === false
      ) ? undefined : result as JwtPayload<PAYLOAD>;
    } catch (err) {
      return undefined;
    }
  }
}
