import { JwtDecoder } from '../../core/jwt/jwt-decoder.js';
import { Logger } from '../../core/logger/logger.js';
import { DTO } from '../../domain/dto.js';
import { Bus } from '../bus/bus.js';
import { JwtCreator } from '../jwt/jwt-creator.js';
import { JwtVerifier } from '../jwt/jwt-verifier.js';
import { RunMode, ServerConfig } from './types.js';

export type ServerResolves<JWT_P extends DTO> = {
  logger: Logger,
  runMode: RunMode,
  jwtDecoder: JwtDecoder<JWT_P>,
  jwtVerifier: JwtVerifier<JWT_P>,
  jwtCreator: JwtCreator<JWT_P>,
  serverConfig: ServerConfig,
}

export type BusServerResolves<JWT_P extends DTO> = ServerResolves<JWT_P> & {
  bus: Bus
}
