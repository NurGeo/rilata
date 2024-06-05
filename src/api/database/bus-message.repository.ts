import { UuidType } from '../../core/types.js';
import { DelivererToBus } from '../bus/deliverer-to-bus.js';
import { DeliveryBusMessage } from '../bus/types.js';
import { GeneralModuleResolver } from '../module/types.js';
import { Repositoriable } from '../resolve/repositoriable.js';
import { Asyncable } from './types.js';

export interface BusMessageRepository<ASYNC extends boolean> {
  init(resovler: GeneralModuleResolver): void

  getNotPublished(): Asyncable<ASYNC, DeliveryBusMessage[]>

  markAsPublished(id: UuidType): Asyncable<ASYNC, unknown>

  subscribe(delivererToBus: DelivererToBus): unknown
}

type BusRepository = BusMessageRepository<boolean>;

export const BusMessageRepository = {
  instance(resolver: Repositoriable): BusRepository {
    return resolver.resolveRepo(BusMessageRepository) as BusRepository;
  },
};
