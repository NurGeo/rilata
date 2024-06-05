import { Logger } from '../../core/logger/logger.js';
import { UuidType } from '../../core/types.js';
import { Caller } from '../controller/types.js';
import { GeneralModuleResolver } from '../module/types.js';

export type RequestStorePayload = {
  serviceName: string,
  moduleName: string,
  logger: Logger,
  caller: Caller,
  moduleResolver: GeneralModuleResolver,
  databaseErrorRestartAttempts: number;
  requestId: UuidType,
  unitOfWorkId?: UuidType, // доступна только после commandService.execute();
}

export type RequestStore<T extends RequestStorePayload> = {
  run<F, Fargs extends unknown[]>(store: T, fn: (...args: Fargs) => F, ...args: Fargs): F,

  /** Возвращает RequestStorePayload. Название метода привязано к AsyncLocalStorage API. */
  getStore(): T | undefined;
}
