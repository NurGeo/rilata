import { Bus } from '../../../src/api/bus/bus.js';
import { BusServerResolver } from '../../../src/api/server/bus.s-resolver.js';
import { ServerResolver } from '../../../src/api/server/s-resolver.js';
import { BusServerResolves } from '../../../src/api/server/s-resolves.js';
import { RilataServer } from '../../../src/api/server/server.js';
import { UserJwtPayload } from '../types.js';

export class BusRunServerResolver extends ServerResolver<BusServerResolves<UserJwtPayload>>
  implements BusServerResolver {
  init(server: RilataServer): void {
    super.init(server);
    this.resolves.bus.init(this);
  }

  getBus(): Bus {
    return this.resolves.bus;
  }
}
