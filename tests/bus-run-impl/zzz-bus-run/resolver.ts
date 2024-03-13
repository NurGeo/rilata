import { Bus } from '../../../src/app/bus/bus';
import { TokenVerifier } from '../../../src/app/jwt/token-verifier.interface';
import { BusServerResolver } from '../../../src/app/server/bus-server-resolver';
import { ServerConfig } from '../../../src/app/server/types';
import { RunMode } from '../../../src/app/types';
import { ConsoleLogger } from '../../../src/common/logger/console-logger';
import { Logger } from '../../../src/common/logger/logger';
import { UuidType } from '../../../src/common/types';
import { OneServerBus } from '../../../src/infra/bus/one-server-bus';
import { FakeClassImplements } from '../../fixtures/fake-class-implements';

const serverConfig: ServerConfig = { hostname: 'localhost', port: 3000, loggerModes: 'all' as const };

export class BusRunServerResolver extends BusServerResolver {
  private logger = new ConsoleLogger(serverConfig.loggerModes);

  private tokenFerivier = new FakeClassImplements.TestTokenVerifier();

  private bus = new OneServerBus();

  getServerConfig(): ServerConfig {
    return serverConfig;
  }

  getLogger(): Logger {
    return this.logger;
  }

  getTokenVerifier(): TokenVerifier<{ userId: UuidType }> {
    return this.tokenFerivier;
  }

  getRunMode(): RunMode {
    return 'test';
  }

  getBus(): Bus {
    return this.bus;
  }
}
