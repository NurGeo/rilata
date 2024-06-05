import { DelivererToBus } from '../../api/bus/deliverer-to-bus.js';
import { DeliveryBusMessage, PublishBusMessage } from '../../api/bus/types.js';
import { BusModuleResolver } from '../../api/module/bus.m-resolver.js';
import { GeneralModuleResolver } from '../../api/module/types.js';
import { BusServerResolver } from '../../api/server/bus.s-resolver.js';

export class TimeoutCallbackDelivererToBus implements DelivererToBus {
  protected moduleResolver!: GeneralModuleResolver;

  init(moduleResolver: GeneralModuleResolver): void {
    this.moduleResolver = moduleResolver;
    const busResolver = moduleResolver as unknown as BusModuleResolver;
    busResolver.getBusMessageRepository().subscribe(this);
  }

  async handle(deliveryEvent: DeliveryBusMessage): Promise<void> {
    const publishEvent: PublishBusMessage = {
      ...deliveryEvent,
      publishModuleName: this.moduleResolver.getModuleName(),
    };

    // запускаем обработчик после выполнения всех обещаний, т.е. ставим в очередь
    setTimeout(async () => {
      const busResolver = this.moduleResolver.getServerResolver() as unknown as BusServerResolver;
      await busResolver.getBus().publish(publishEvent);
      const busModuleResolver = this.moduleResolver as unknown as BusModuleResolver;
      const busMsgRepo = busModuleResolver.getBusMessageRepository();
      busMsgRepo.markAsPublished(deliveryEvent.id);
    }, 0);
  }
}
