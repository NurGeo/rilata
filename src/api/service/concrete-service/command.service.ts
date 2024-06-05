import { GeneralCommandServiceParams, ServiceResult } from '../types.js';
import { GeneralModuleResolver } from '../../module/types.js';
import { TransactionStrategy } from '../transaction-strategy/strategy.js';
import { BaseService } from '../base.service.js';

/** Сервис для обработки команд */
export abstract class CommandService<
  P extends GeneralCommandServiceParams, RES extends GeneralModuleResolver
> extends BaseService<P, RES> {
  protected abstract transactionStrategy: TransactionStrategy;

  protected executeService(input: P['input']): Promise<ServiceResult<P>> {
    return this.transactionStrategy.executeDatabaseScope(this, input);
  }
}
