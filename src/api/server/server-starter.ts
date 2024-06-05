/* eslint-disable @typescript-eslint/no-unused-vars */
import { Constructor } from '../../core/types.js';
import { DTO } from '../../domain/dto.js';
import { Module } from '../module/module.js';
import { RilataServer } from './server.js';
import { ServerResolves } from './s-resolves.js';
import { GeneralServerResolver, ModuleConstructors } from './types.js';

export class ServerStarter<M extends Module> {
  protected server!: RilataServer;

  protected serverResolver!: GeneralServerResolver;

  constructor(
    protected ServerCtor: Constructor<RilataServer>,
    protected ServerResolverCtor: Constructor<GeneralServerResolver>,
    protected resolves:ServerResolves<DTO>,
    protected ModuleCtors: ModuleConstructors<M>[],
  ) {}

  start(runModuleNames: M['moduleName'][] | 'all'): RilataServer {
    this.serverResolver = new this.ServerResolverCtor(this.resolves);
    this.server = new this.ServerCtor(this.runModules(runModuleNames));
    this.server.init(this.serverResolver);
    return this.server;
  }

  protected runModules(runModuleNames: M['moduleName'][] | 'all'): M[] {
    const { logger } = this.resolves;
    if (runModuleNames === 'all') {
      runModuleNames = this.ModuleCtors.map(([Mctor, _1, _2]) => Mctor.name);
    }

    logger.info(`start init modules, count: ${runModuleNames.length}`);
    return runModuleNames.map((name) => {
      logger.info(`--- start init of module: ${name}`);
      const Ctors = this.ModuleCtors.find(
        ([ModuleCtor, _1, _2]) => ModuleCtor.name === name,
      );
      if (Ctors === undefined) {
        throw logger.error(`not finded module by name: ${name}`);
      }

      const [ModuleCtor, ModuleResolverCtor, resolves] = Ctors;
      const module = new ModuleCtor();
      // eslint-disable-next-line max-len
      const moduleResolver = new ModuleResolverCtor(resolves);
      module.init(moduleResolver, this.serverResolver);

      logger.info(`  | end init module: ${name}`);
      return module;
    });
  }
}
