import { JwtType } from '../../core/jwt/types.js';
import { DTO } from '../../domain/dto.js';
import { ServerResolver } from '../server/s-resolver.js';
import { ServerResolves } from '../server/s-resolves.js';

export interface JwtCreator<PAYLOAD extends DTO> {
  init(resolver: ServerResolver<ServerResolves<PAYLOAD>>): void
  createToken(payload: PAYLOAD, type: JwtType): string;
}
