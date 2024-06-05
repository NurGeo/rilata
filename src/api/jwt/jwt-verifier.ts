import { JwtVerifyErrors } from '../../core/jwt/jwt-errors.js';
import { Result } from '../../core/result/types.js';
import { DTO } from '../../domain/dto.js';
import { ServerResolver } from '../server/s-resolver.js';
import { ServerResolves } from '../server/s-resolves.js';

export interface JwtVerifier<PAYLOAD extends DTO> {
  init(resolver: ServerResolver<ServerResolves<PAYLOAD>>): void
  /** Проверяет токен на соответствие шифрованию секретом */
  verifyToken(rawToken: string): Result<JwtVerifyErrors, PAYLOAD>
}
