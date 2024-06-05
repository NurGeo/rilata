import { JwtCreator } from '../../api/jwt/jwt-creator.js';
import { GeneralServerResolver, JwtConfig } from '../../api/server/types.js';
import { JwtPayload, JwtType } from '../../core/jwt/types.js';
import { JwtHmacHashUtils } from '../../core/utils/jwt/jwt-utils.js';
import { DTO } from '../../domain/dto.js';

export class JwtCreatorImpl<PAYLOAD extends DTO> implements JwtCreator<PAYLOAD> {
  protected resolver!: GeneralServerResolver;

  constructor(protected jwtSecret: string, protected jwtConfig: JwtConfig) {}

  init(resolver: GeneralServerResolver): void {
    this.resolver = resolver;
  }

  createToken(payload: PAYLOAD, type: JwtType): string {
    const jwtUtils = new JwtHmacHashUtils();
    return jwtUtils.sign(
      this.getJwtPayload(payload, type),
      this.jwtSecret,
      this.jwtConfig.algorithm === 'HS256' ? 'sha256' : 'sha512',
    );
  }

  protected getJwtPayload(payload: PAYLOAD, typ: JwtType): JwtPayload<PAYLOAD> {
    const expiredAsHour = typ === 'access'
      ? this.jwtConfig.jwtLifetimeAsHour
      : this.jwtConfig.jwtRefreshLifetimeAsHour;
    const iat = this.resolver.getJwtDecoder().getNow();

    const jwtLifetimeAsMs = expiredAsHour * 60 * 60 * 1000;
    const exp = iat + jwtLifetimeAsMs;

    return { ...payload, exp, typ };
  }
}
