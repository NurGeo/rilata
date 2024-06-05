/* eslint-disable no-use-before-define */
import { Logger } from '../../core/logger/logger.js';
import {
  FullServiceResult,
  GeneralCommandService,
  GeneralCommandServiceParams, GeneralEventService,
  GeneralQueryServiceParams, GeneraQueryService, ServiceResult,
} from '../service/types.js';
import { Service } from '../service/service.js';
import { GeneralModuleResolver, ModuleType } from './types.js';
import { GeneralEventDod } from '../../domain/domain-data/domain-types.js';
import { failure } from '../../core/result/failure.js';
import { Locale } from '../../domain/locale.js';
import { BadRequestError, InternalError } from '../service/error-types.js';
import { Result } from '../../core/result/types.js';
import { AssertionException } from '../../core/exeptions.js';
import { GeneralServerResolver } from '../server/types.js';
import { Caller } from '../controller/types.js';
import { dodUtility } from '../../core/utils/dod/dod-utility.js';
import { ModuleController } from '../controller/m-controller.js';
import { Controller } from '../controller/controller.js';
import { RequestStorePayload } from '../request-store/types.js';
import { requestStoreDispatcher } from '../request-store/request-store-dispatcher.js';

export abstract class Module {
  readonly abstract moduleName: string;

  readonly abstract moduleType: ModuleType;

  readonly abstract queryServices: GeneraQueryService[]

  readonly abstract commandServices: GeneralCommandService[];

  readonly abstract eventServices: GeneralEventService[];

  protected controllers: Controller<GeneralModuleResolver>[] = [];

  protected moduleResolver!: GeneralModuleResolver;

  protected services!: Service<GeneralModuleResolver>[];

  protected logger!: Logger;

  init(
    moduleResolver: GeneralModuleResolver,
    serverResolver: GeneralServerResolver,
  ): void {
    this.moduleResolver = moduleResolver;
    moduleResolver.init(this, serverResolver);
    this.logger = moduleResolver.getLogger();
    this.logger.info(`  | resolver for module ${this.moduleName} inited successfully`);

    this.controllers.push(this.getModuleController());
    this.controllers.forEach((controller) => { controller.init(this.moduleResolver); });

    this.services = [...this.queryServices, ...this.commandServices, ...this.eventServices];
  }

  stop(): void {
    this.moduleResolver.stop();
  }

  getModuleResolver(): GeneralModuleResolver {
    return this.moduleResolver;
  }

  getLogger(): Logger {
    return this.logger;
  }

  getModuleControllers(): Controller<GeneralModuleResolver>[] {
    return this.controllers;
  }

  async executeService<S extends GeneralQueryServiceParams | GeneralCommandServiceParams>(
    inputDod: S['input'],
    caller: Caller,
  ): Promise<FullServiceResult<S>> {
    try {
      const inputDodName = inputDod.meta.name;
      const service = this.getServiceByInputDodName(inputDodName);
      if (service === undefined) {
        return this.notFindedServiceByName(inputDodName);
      }

      const store: RequestStorePayload = {
        serviceName: inputDodName,
        moduleName: this.moduleName,
        caller,
        moduleResolver: this.moduleResolver,
        logger: this.logger,
        requestId: inputDod.meta.requestId,
        databaseErrorRestartAttempts: 1,
      };
      const requestStore = requestStoreDispatcher.getRequestStore();
      return requestStore.run(
        store,
        (serviceInput) => service.execute(serviceInput),
        inputDod,
      ) as unknown as ServiceResult<S>;
    } catch (e) {
      if (this.moduleResolver.getServerResolver().getRunMode().includes('test')) {
        throw e;
      }
      this.moduleResolver.getLogger().fatalError('server internal error', { requestDod: inputDod, caller }, e as Error);
      const err = dodUtility.getAppError<InternalError<Locale<'Internal error'>>>(
        'Internal error',
        'Извините, на сервере произошла ошибка',
        {},
      );
      return failure(err);
    }
  }

  protected getModuleController(): ModuleController {
    return new ModuleController();
  }

  async executeEventService(eventDod: GeneralEventDod): Promise<void> {
    try {
      const serviceName = eventDod.meta.name;
      const service = this.getServiceByInputDodName(serviceName);
      if (!service) {
        const errStr = `not finded service by name: ${serviceName} in module: ${this.moduleName}`;
        throw new AssertionException(errStr);
      }
      const caller = eventDod.caller.type === 'ModuleCaller'
        ? eventDod.caller.user
        : eventDod.caller;
      const store: RequestStorePayload = {
        serviceName,
        moduleName: this.moduleName,
        caller,
        moduleResolver: this.moduleResolver,
        logger: this.logger,
        requestId: eventDod.meta.requestId,
        databaseErrorRestartAttempts: 1,
      };
      const requestStore = requestStoreDispatcher.getRequestStore();
      await requestStore.run(
        store,
        (serviceInput) => service.execute(serviceInput),
        eventDod,
      );
    } catch (e) {
      if (this.moduleResolver.getServerResolver().getRunMode() === 'test') {
        this.moduleResolver.getServerResolver().getServer().stop();
        throw e;
      }
      throw this.moduleResolver.getLogger().fatalError('server internal error', eventDod, e as Error);
    }
  }

  getServiceByInputDodName<S extends Service<GeneralModuleResolver>>(name: S['inputDodName']): S {
    return this.services.find((s) => s.inputDodName === name) as S;
  }

  protected notFindedServiceByName(reqName: string): Result<BadRequestError<Locale<'Bad request'>>, never> {
    const err = dodUtility.getAppError<BadRequestError<Locale<'Bad request'>>>(
      'Bad request',
      `Не найден обработчик для запроса ${reqName} в модуле ${this.moduleName}`,
      {},
    );
    return failure(err);
  }
}
