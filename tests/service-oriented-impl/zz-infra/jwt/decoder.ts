import { BaseJwtDecoder } from '../../../../src/api-infra/jwt/base-jwt-decoder.js';
import { uuidUtility } from '../../../../src/core/utils/uuid/uuid-utility.js';
import { UserJwtPayload } from '../../auth/services/user/user-authentification/s-params.js';

export class JwtDecoderImpl extends BaseJwtDecoder<UserJwtPayload> {
  expiredTimeShiftAsMs: number;

  constructor() {
    super();
    this.expiredTimeShiftAsMs = 0;
  }

  payloadBodyIsValid(payload: UserJwtPayload): boolean {
    return uuidUtility.isValidValue(payload.userId);
  }
}
