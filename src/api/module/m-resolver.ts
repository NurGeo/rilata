/* eslint-disable @typescript-eslint/no-explicit-any */
import { Repositoriable } from '../resolve/repositoriable';
import { Realisable } from '../resolve/realisable';
import { Facadable } from '../resolve/facadable';
import { DTO } from '../../domain/dto';
import { GetModule } from './types';
import { Module } from './module';
import { GetServerResolves } from '../server/types';
import { ServerResolver } from '../server/s-resolver';
import { ServerResolves } from '../server/s-resolves';
import { ModuleResolves } from './m-resolves';

export abstract class ModuleResolver<
  S_RES extends ServerResolver<ServerResolves<DTO>>, MR extends ModuleResolves<Module>,
>
implements Repositoriable, Realisable, Facadable {
  protected module!: GetModule<MR>;

  protected serverResolver!: S_RES;

  abstract resolve(...args: unknown[]): unknown

  abstract resolveRepo(...args: unknown[]): unknown

  abstract resolveFacade(...args: unknown[]): unknown

  constructor(protected resolves: MR) {}

  getModulePath(): string {
    // @ts-expect-error
    return import.meta.dir; // path/to/file
  }

  getProjectPath(): string {
    return this.serverResolver.getProjectPath();
  }

  init(module: GetModule<MR>, serverResolver: S_RES): void {
    this.module = module;
    this.serverResolver = serverResolver;

    this.initResolves();
    this.getDatabase().init(this);
  }

  stop(): void {
    this.getDatabase().stop();
  }

  getServerResolver(): S_RES {
    return this.serverResolver;
  }

  getModuleResolves(): MR {
    return this.resolves;
  }

  getLogger(): GetServerResolves<S_RES>['logger'] {
    return this.serverResolver.getLogger();
  }

  getDatabase(): MR['db'] {
    return this.resolves.db;
  }

  getModuleUrls(): MR['moduleUrls'] {
    return this.resolves.moduleUrls;
  }

  getModuleName(): MR['moduleName'] {
    return this.resolves.moduleName;
  }

  getModule(): GetModule<MR> {
    return this.module;
  }

  protected initResolves(): void {
    Object.values(this.resolves).forEach((resolveItem) => {
      if (
        (resolveItem as any).init
        && typeof (resolveItem as any).init === 'function'
      ) (resolveItem as any).init(this);
    });
  }
}
