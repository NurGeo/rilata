/* eslint-disable @typescript-eslint/no-unused-vars */
import { failure } from '../../core/result/failure.js';
import { success } from '../../core/result/success.js';
import { Result } from '../../core/result/types.js';
import {
  ServiceResult, InputDodValidator,
  GeneralBaseServiceParams, GetModuleName,
} from './types.js';
import { Service } from './service.js';
import { ValidationError } from './error-types.js';
import { GeneralModuleResolver } from '../module/types.js';
import { permissionDeniedError } from './constants.js';
import { CallerType } from '../controller/types.js';
import { dodUtility } from '../../core/utils/dod/dod-utility.js';
import { requestStoreDispatcher } from '../request-store/request-store-dispatcher.js';

export abstract class BaseService<
  P extends GeneralBaseServiceParams, RES extends GeneralModuleResolver
> extends Service<RES> {
  abstract override moduleName: GetModuleName<RES>;

  abstract override serviceName: P['serviceName'];

  abstract override inputDodName: P['input']['meta']['name'];

  abstract override aRootName: P['aRootName'];

  protected abstract supportedCallers: ReadonlyArray<CallerType>;

  protected abstract validator: InputDodValidator<P['input']>;

  /** Выполнить сервис */
  async execute(input: P['input']): Promise<ServiceResult<P>> {
    const checksResult = this.runInitialChecks(input);
    if (checksResult.isFailure()) return checksResult;
    return this.executeService(input);
  }

  /** Выполнить внутреннюю работу сервиса (БД, транзакции, доменого слоя) */
  protected abstract executeService(input: P['input']): Promise<ServiceResult<P>>

  /** Выполнить работу доменной логики */
  abstract runDomain(input: P['input']): Promise<ServiceResult<P>> | ServiceResult<P>

  /** Выполнить проверку разрешений пользователя и валидации */
  protected runInitialChecks(
    input: P['input'],
  ): Result<ValidationError | typeof permissionDeniedError, undefined> {
    const checkCallerResult = this.checkCallerPermission();
    if (checkCallerResult.isFailure()) return checkCallerResult;
    return this.checkValidations(input);
  }

  // eslint-disable-next-line max-len
  protected checkCallerPermission(): Result<typeof permissionDeniedError, undefined> {
    const { caller } = requestStoreDispatcher.getPayload();
    if (this.supportedCallers.includes(caller.type)) return success(undefined);
    return failure(permissionDeniedError);
  }

  protected checkValidations(
    input: P['input'],
  ): Result<ValidationError, undefined> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((input as any).attrs === undefined) {
      throw this.logger.error('validate implemented only requestDod and eventDod');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = this.validator.validate((input as any).attrs);

    if (result.isFailure()) {
      return failure(dodUtility.getValidationError(result.value));
    }
    return result;
  }
}
