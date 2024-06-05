import { OneServerBus } from '../../../src/api-infra/bus/one-server-bus.js';
import { JwtCreatorImpl } from '../../../src/api-infra/jwt/jwt-creator.js';
import { JwtVerifierImpl } from '../../../src/api-infra/jwt/jwt-verifier.js';
import { defaultJwtConfig, getServerConfig } from '../../../src/api/server/configs.js';
import { BusServerResolves } from '../../../src/api/server/s-resolves.js';
import { ServerStarter } from '../../../src/api/server/server-starter.js';
import { ModuleConstructors } from '../../../src/api/server/types.js';
import { getEnvLogMode } from '../../../src/core/index.js';
import { ConsoleLogger } from '../../../src/core/logger/console-logger.js';
import { Constructor } from '../../../src/core/types.js';
import { JwtDecoderImpl } from '../../service-oriented-impl/zz-infra/jwt/decoder.js';
import { CompanyCmdModule } from '../company-cmd/module.js';
import { CompanyCmdModuleResolver } from '../company-cmd/resolver.js';
import { CompanyReadModule } from '../company-read/module.js';
import { CompanyReadModuleResolver } from '../company-read/resolver.js';
import { UserJwtPayload } from '../types.js';
import { getCompanyCmdResolves } from './module-resolves/company-cmd-resolves.js';
import { getCompanyReadResolves } from './module-resolves/company-read-resolves.js';
import { BusRunServerResolver } from './s-resolver.js';
import { BusRunServer } from './server.js';

type AllServerModules = CompanyCmdModule | CompanyReadModule;

const jwtSecret = 'your-256-bit-secret';

class BusRunServerStarter extends ServerStarter<AllServerModules> {
  constructor(
    ServerCtor: Constructor<BusRunServer>,
    ServerResolverCtor: Constructor<BusRunServerResolver>,
    ModuleCtors: ModuleConstructors<AllServerModules>[],
    resolves?: Partial<BusServerResolves<UserJwtPayload>>,
  ) {
    const defaultResolves: BusServerResolves<UserJwtPayload> = {
      logger: new ConsoleLogger(getEnvLogMode() ?? 'all'),
      runMode: 'test',
      jwtDecoder: new JwtDecoderImpl(),
      jwtVerifier: new JwtVerifierImpl(jwtSecret, defaultJwtConfig),
      jwtCreator: new JwtCreatorImpl(jwtSecret, defaultJwtConfig),
      serverConfig: getServerConfig(),
      bus: new OneServerBus(),
    };
    super(ServerCtor, ServerResolverCtor, { ...defaultResolves, ...resolves }, ModuleCtors);
  }
}

export const serverStarter = new BusRunServerStarter(
  BusRunServer,
  BusRunServerResolver,
  [
    [CompanyCmdModule, CompanyCmdModuleResolver, getCompanyCmdResolves()],
    [CompanyReadModule, CompanyReadModuleResolver, getCompanyReadResolves()],
  ],
);
