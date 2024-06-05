import { GeneralServerResolver } from '../server/types.js';
import { PublishBusMessage, SubcribeToBusMessage } from './types.js';

export interface Bus {
  subscribe(eventSubscribe: SubcribeToBusMessage): Promise<void>

  publish(eventPublish: PublishBusMessage): Promise<void>

  init(resolver: GeneralServerResolver): Promise<void>

  stop(): void
}
