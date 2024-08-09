import { getEnvLogMode } from '#core/logger/logger-modes.js';
import { JwtCreatorImpl } from '../../../src/api-infra/jwt/jwt-creator.js';
import { JwtVerifierImpl } from '../../../src/api-infra/jwt/jwt-verifier.js';
import { defaultJwtConfig, getPublicHost, getPublicPort, getServerConfig } from '../../../src/api/server/configs.js';
import { ServerResolves } from '../../../src/api/server/s-resolves.js';
import { ConsoleLogger } from '../../../src/core/logger/console-logger.js';
import { UserJwtPayload } from '../../service-oriented-impl/auth/services/user/user-authentification/s-params.js';
import { JwtDecoderImpl } from '../../service-oriented-impl/zz-infra/jwt/decoder.js';

const jwtSecretKey = 'your-256-bit-secret';

export const serverResolves: ServerResolves<UserJwtPayload> = {
  appName: 'service oriented server testing',
  logger: new ConsoleLogger(getEnvLogMode() ?? 'all'),
  runMode: 'test',
  publicHost: getPublicHost('localhost'),
  publicPort: getPublicPort(3000),
  jwtDecoder: new JwtDecoderImpl(),
  jwtVerifier: new JwtVerifierImpl(jwtSecretKey, defaultJwtConfig),
  jwtCreator: new JwtCreatorImpl(jwtSecretKey, defaultJwtConfig),
  serverConfig: getServerConfig(),
  httpsPorts: [443, 8443],
};
