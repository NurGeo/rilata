import { Logger } from '../../core/logger/logger.js';
import { domainStoreDispatcher } from '../../core/domain-store/domain-store-dispatcher.js';
import { Module } from '../module/module.js';
import { GeneralServerResolver } from './types.js';

export abstract class RilataServer {
  protected resolver!: GeneralServerResolver;

  protected logger!: Logger;

  constructor(protected modules: Module[]) {}

  init(serverResolver: GeneralServerResolver): void {
    serverResolver.init(this);
    // инициализация модулей производится server-starter-ом
    this.logger = serverResolver.getLogger();
    domainStoreDispatcher.setPaylod({ logger: this.logger });
    this.resolver = serverResolver;
  }

  stop(): void {
    this.resolver.stop();
    this.modules.forEach((m) => m.stop());
  }

  getModule<M extends Module>(name: M['moduleName']): M {
    const module = this.modules.find((m) => m.moduleName === name);
    if (module === undefined) {
      throw this.logger.error(`not finded module by name: ${name}`, this.modules);
    }
    return module as M;
  }

  getModules(): Module[] {
    return this.modules;
  }

  getServerResolver(): GeneralServerResolver {
    return this.resolver;
  }

  protected initStarted(): void {
    this.logger.info(`start init server ${this.constructor.name}`);
  }

  protected initFinished(): void {
    this.logger.info(`finish init server ${this.constructor.name}`);
  }
}
