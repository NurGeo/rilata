import { ErrorDod } from '../../domain/domain-data/domain-types.js';

type IncorrectTokenBody = {
  text: 'Невозможно расшифровать токен. Токен имеет не верный формат.',
  hint: Record<string, never>,
  name: 'IncorrectTokenError',
};

/** Некорректный тип токена. */
export type IncorrectTokenError = ErrorDod<'IncorrectTokenError', IncorrectTokenBody>

type NotValidTokenPayloadBody = {
    text: 'Невалидная полезная нагрузка в токене.',
    hint: Record<string, never>,
    name: 'NotValidTokenPayloadError',
};
/** Невалидная полезная нагрузка в токене. */
export type NotValidTokenPayloadError = ErrorDod<'NotValidTokenPayloadError', NotValidTokenPayloadBody>

type TokenExpiredErrorBody = {
    text: 'Токен просрочен.',
    hint: Record<string, never>,
    name: 'TokenExpiredError',
};

/** Токен просрочен. */
export type TokenExpiredError = ErrorDod<'TokenExpiredError', TokenExpiredErrorBody>;

export type JwtDecodeErrors =
  IncorrectTokenError
  | NotValidTokenPayloadError
  | TokenExpiredError

type JwtVerifyBody = {
    text: 'Токен не валидный',
    hint: Record<string, never>,
    name: 'JwtVerifyError',
};
/** Ошибка верификации. */
export type JwtVerifyError = ErrorDod<'JwtVerifyError', JwtVerifyBody>;

export type JwtVerifyErrors = JwtDecodeErrors | JwtVerifyError;
