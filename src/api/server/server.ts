import { Logger } from '../../core/logger/logger.js';
import { Module } from '../module/module.js';
import { GeneralServerResolver } from './types.js';

export abstract class RilataServer {
  protected resolver!: GeneralServerResolver;

  protected logger!: Logger;

  constructor(protected modules: Module[]) {}

  init(serverResolver: GeneralServerResolver): void {
    this.logger = serverResolver.getLogger();
    this.resolver = serverResolver;
    // инициализация модулей производится server-starter-ом
    serverResolver.init(this);
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
