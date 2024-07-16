import { Logger } from '../../core/logger/logger.js';
import { GeneralModuleResolver } from '../module/types.js';

/** Обработчик входящих в модуль запросов */
export abstract class Service<R extends GeneralModuleResolver> {
  abstract aRootName: string;

  abstract serviceName: string;

  abstract moduleName: string;

  protected moduleResolver!: R;

  init(resolver: R): void {
    this.moduleResolver = resolver;
  }

  protected get logger(): Logger {
    return this.moduleResolver.getLogger();
  }

  abstract execute(...args: unknown[]): Promise<unknown>
}
