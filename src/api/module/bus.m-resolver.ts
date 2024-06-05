import { Bus } from '../bus/bus.js';
import { DelivererToBus } from '../bus/deliverer-to-bus.js';
import { BusMessageRepository } from '../database/bus-message.repository.js';

export interface BusModuleResolver {
  getBus(): Bus

  getBusMessageRepository(): BusMessageRepository<boolean>

  getDelivererToBus(): DelivererToBus
}
