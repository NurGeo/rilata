import { QueryServiceParams } from '../../../../../../src/api/service/types.js';
import { JwtDecodeErrors } from '../../../../../../src/core/jwt/jwt-errors.js';
import { UuidType } from '../../../../../../src/core/types.js';
import { RequestDod } from '../../../../../../src/domain/domain-data/domain-types.js';
import { UserParams } from '../../../domain-data/user/params.js';
import { UserDoesNotExistByLoginError } from '../../../domain-object/user/repo-errors.js';

export type UserAuthentificationRequestAttrs = {
  login: string,
  pass: string,
}

export type UserJwtPayload = {
  userId: UuidType,
}

export type UserAuthentificationRequestDod = RequestDod<'userAuthentificate', UserAuthentificationRequestAttrs>;

export type UserAuthentificationOut = string;

export type UserAuthentificationErrors = UserDoesNotExistByLoginError | JwtDecodeErrors;

export type UserAuthentificationServiceParams = QueryServiceParams<
  'AuthentificatingUserService',
  UserParams,
  UserAuthentificationRequestDod,
  UserAuthentificationOut,
  UserAuthentificationErrors
>
