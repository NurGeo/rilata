import { JwtVerifier } from '../../api/jwt/jwt-verifier.js';
import { ServerResolver } from '../../api/server/s-resolver.js';
import { ServerResolves } from '../../api/server/s-resolves.js';
import { JwtConfig } from '../../api/server/types.js';
import { JwtVerifyError, JwtVerifyErrors } from '../../core/jwt/jwt-errors.js';
import { failure } from '../../core/result/failure.js';
import { Result } from '../../core/result/types.js';
import { dodUtility } from '../../core/utils/dod/dod-utility.js';
import { JwtHmacHashUtils } from '../../core/utils/jwt/jwt-utils.js';
import { DTO } from '../../domain/dto.js';

export class JwtVerifierImpl<PAYLOAD extends DTO> implements JwtVerifier<PAYLOAD> {
  protected resolver!: ServerResolver<ServerResolves<PAYLOAD>>;

  constructor(protected jwtSecret: string, protected jwtConfig: JwtConfig) {}

  init(resolver: ServerResolver<ServerResolves<PAYLOAD>>): void {
    this.resolver = resolver;
  }

  verifyToken(rawToken: string): Result<JwtVerifyErrors, PAYLOAD> {
    const { algorithm } = this.jwtConfig;
    const jwtUtils = new JwtHmacHashUtils();
    if (!jwtUtils.verify(rawToken, this.jwtSecret, algorithm === 'HS256' ? 'sha256' : 'sha512')) {
      return failure(dodUtility.getDomainError<JwtVerifyError>(
        'JwtVerifyError',
        'Токен не валидный',
        {},
      ));
    }
    return this.resolver.getJwtDecoder().getTokenPayload(rawToken);
  }
}
