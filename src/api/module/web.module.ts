/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-use-before-define */
import {
  FullServiceResult,
  GeneralCommandService, GeneralEventService,
  GeneralWebService, GeneraQueryService,
  GetServiceParams,
} from '../service/types.js';
import { GeneralModuleResolver } from './types.js';
import { GeneralEventDod, GeneralRequestDod, InputDod } from '../../domain/domain-data/domain-types.js';
import { failure } from '../../core/result/failure.js';
import { GeneralServerResolver } from '../server/types.js';
import { Caller } from '../controller/types.js';
import { WebReqeustStorePayload } from '../request-store/types.js';
import { requestStoreDispatcher } from '../request-store/request-store-dispatcher.js';
import { Module } from './module.js';
import { Result } from '#core/result/types.js';
import { dodUtility } from '#core/utils/dod/dod-utility.js';
import { WebModuleController } from '#api/controller/web.m-controller.js';
import { dtoUtility } from '#core/utils/dto/dto-utility.js';
import { ServiceBaseErrors } from '#api/service/error-types.js';
import { badRequestError, internalError } from '#api/service/constants.js';
import { success } from '#core/result/success.js';
import { AssertionException } from '#core/exeptions.js';

export abstract class WebModule extends Module {
  readonly abstract queryServices: GeneraQueryService[]

  readonly abstract commandServices: GeneralCommandService[];

  readonly abstract eventServices: GeneralEventService[];

  protected moduleController: WebModuleController = new WebModuleController();

  protected services!: GeneralWebService[];

  init(
    moduleResolver: GeneralModuleResolver,
    serverResolver: GeneralServerResolver,
  ): void {
    super.init(moduleResolver, serverResolver);
    this.services = [...this.queryServices, ...this.commandServices, ...this.eventServices];
    this.services.forEach((service) => service.init(moduleResolver));
  }

  /** Обеспачиват выполнение сервиса. */
  async executeService<S extends GeneralWebService>(
    inputDod: GetServiceParams<S>['input'], caller: Caller,
  ): Promise<FullServiceResult<S>> {
    try {
      const checkResult = this.checkInputData(inputDod);
      if (checkResult.isFailure()) {
        return checkResult;
      }
      return this.runService(checkResult.value, caller);
    } catch (e) {
      return this.catchRunModeError(inputDod, caller, e as Error);
    }
  }

  getServices(): GeneralWebService[] {
    return this.services;
  }

  getService<S extends GeneralWebService>(handleName: S['handleName']): S {
    const service = this.services.find((s) => s.handleName === handleName);
    if (!service) {
      const errStr = `Не найден обработчик для запроса ${handleName} в модуле ${this.moduleName}`;
      this.logger.warning(errStr);
      throw new AssertionException(errStr);
    }
    return service as S;
  }

  protected catchRunModeError(
    inputDod: unknown, caller: Caller, e: Error,
  ): Result<ServiceBaseErrors, never> {
    if (this.moduleResolver.getServerResolver().getRunMode().includes('test')) {
      throw e;
    }
    if (this.isRequestDod(inputDod)) {
      this.moduleResolver.getLogger().fatalError(
        'server internal error',
        { inputDod, caller },
        e,
      );
      return failure(internalError);
    }

    // event dod
    if (this.moduleResolver.getServerResolver().getRunMode() === 'test') {
      this.moduleResolver.getServerResolver().getServer().stop();
      throw e;
    }
    throw this.moduleResolver.getLogger().fatalError('server internal error', inputDod, e as Error);
  }

  protected async runService(
    inputDod: GeneralRequestDod | GeneralEventDod, caller: Caller,
  ): Promise<Result<unknown, unknown>> {
    let service: GeneralWebService;
    try {
      service = this.getService(inputDod.meta.name);
      const requestStore = requestStoreDispatcher.getRequestStore();
      return requestStore.run(
        this.getStorePayload(inputDod, caller),
        (serviceInput) => service.execute(serviceInput),
        inputDod,
      );
    } catch (e) {
      return this.catchServiceTypeError(inputDod, e as Error);
    }
  }

  protected catchServiceTypeError(
    inputDod: InputDod, err: Error,
  ): Result<typeof badRequestError, never> {
    if (this.isRequestDod(inputDod)) {
      return this.notFindedServiceError(err.message);
    }
    throw this.logger.error(err.message, { err, inputDod }, err);
  }

  protected checkInputData(
    input: unknown,
  ): Result<typeof badRequestError, GeneralRequestDod | GeneralEventDod> {
    if (typeof input !== 'object' || input === null) {
      return this.getBadRequestErr('Тело запроса должно быть объектом');
    }

    if (
      (input as any)?.meta?.name === undefined
      || (input as any)?.meta?.requestId === undefined
      || ['request', 'event'].includes((input as any)?.meta?.domainType) === false
    ) {
      return this.getBadRequestErr('Полезная нагрузка запроса не является объектом inputDod');
    }

    if (
      !(input as any).attrs
      || typeof (input as any).attrs !== 'object'
    ) {
      return this.getBadRequestErr('Не найдены атрибуты (attrs) объекта inputDod');
    }
    return success(input as GeneralRequestDod);
  }

  protected notFindedServiceError(errString: string): Result<typeof badRequestError, never> {
    const err = dodUtility.getAppError<typeof badRequestError>(
      'Bad request', errString, {},
    );
    return failure(err);
  }

  protected getBadRequestErr(errText: string): Result<typeof badRequestError, never> {
    const err = dtoUtility.replaceAttrs(badRequestError, { locale: {
      text: errText,
    } });
    return failure(err);
  }

  protected getStorePayload(inputDod: InputDod, caller: Caller): WebReqeustStorePayload {
    return {
      serviceName: inputDod.meta.name,
      moduleName: this.moduleName,
      caller,
      moduleResolver: this.moduleResolver,
      logger: this.logger,
      requestId: inputDod.meta.requestId,
      databaseErrorRestartAttempts: 1,
    };
  }

  protected isRequestDod(inputDod: unknown): inputDod is GeneralRequestDod {
    return (inputDod as any).meta?.domainType === 'request';
  }
}
