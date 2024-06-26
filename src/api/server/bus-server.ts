import { EventService } from '#api/base.index.js';
import { SubcribeToBusMessage } from '../bus/types.js';
import { BunServer } from './bun-server.js';
import { BusServerResolver } from './bus.s-resolver.js';
import { GeneralServerResolver } from './types.js';

export abstract class BusBunServer extends BunServer {
  declare protected resolver: GeneralServerResolver;

  init(serverResolver: GeneralServerResolver): void {
    super.init(serverResolver);
    this.subscribeToBus();
  }

  protected subscribeToBus(): void {
    this.modules.forEach((module) => {
      const busResolver = this.resolver as unknown as BusServerResolver;
      const bus = busResolver.getBus();
      module.getServises().forEach((service) => {
        if (service instanceof EventService) {
          const eventSubscribe: SubcribeToBusMessage = {
            type: service.busMessageType,
            busMessageName: service.eventName,
            publishModuleName: service.eventModuleName,
            handlerModuleName: service.moduleName,
            handlerServiceName: service.serviceName,
          };
          bus.subscribe(eventSubscribe);
        }
      });
    });
  }
}
