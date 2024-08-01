import { Logger } from '../../core/logger/logger.js';
import { UuidType } from '../../core/types.js';
import { Caller } from '../controller/types.js';
import { GeneralModuleResolver } from '../module/types.js';

export type RequestStorePayload = {
  type: 'request',
  requestId: UuidType,
  serviceName: string,
  moduleName: string,
  resolver: GeneralModuleResolver,
  caller: Caller,
  logger: Logger,
}

export type CommandRequestStorePayload = Omit<RequestStorePayload, 'type'> & {
  type: 'commandRequest',
  databaseErrorRestartAttempts: number;
  unitOfWorkId?: UuidType,
}

export type WebReqeustStorePayload = RequestStorePayload | CommandRequestStorePayload;

export type BotRequestStorePayload = {
  serviceName: string,
  moduleName: string,
  logger: Logger,
  moduleResolver: GeneralModuleResolver,
  telegramId: number,
}
