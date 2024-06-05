import { success } from '../../../core/result/success.js';
import { Result } from '../../../core/result/types.js';
import { BusMessageType } from '../../bus/types.js';
import { GeneralModuleResolver } from '../../module/types.js';
import { BaseService } from '../base.service.js';
import { TransactionStrategy } from '../transaction-strategy/strategy.js';
import { GeneralEventServiceParams, ServiceResult } from '../types.js';

export abstract class EventService<
  P extends GeneralEventServiceParams,
  RES extends GeneralModuleResolver
> extends BaseService<P, RES> {
  abstract busMessageType: BusMessageType;

  abstract eventModuleName: P['input']['meta']['moduleName'];

  abstract eventServiceName: P['input']['meta']['serviceName'];

  protected validator!: never;

  protected supportedCallers!: never;

  protected abstract transactionStrategy: TransactionStrategy;

  protected executeService(input: P['input']): Promise<ServiceResult<P>> {
    return this.transactionStrategy.executeDatabaseScope(this, input);
  }

  async execute(input: P['input']): Promise<ServiceResult<P>> {
    const result = await super.execute(input);
    if (result.isFailure()) {
      throw this.moduleResolver.getLogger().error(
        'recieved failure result for event service',
        { input, result },
      );
    }
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected runInitialChecks(input: P['input']): Result<never, undefined> {
    // Для событий не выполняется проверка разрешений и валидации
    return success(undefined);
  }
}
