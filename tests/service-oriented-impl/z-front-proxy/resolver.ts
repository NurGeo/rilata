/* eslint-disable @typescript-eslint/no-unused-vars */
import { ModuleResolver } from '../../../src/api/module/m-resolver.js';
import { ServerResolver } from '../../../src/api/server/s-resolver.js';
import { ServerResolves } from '../../../src/api/server/s-resolves.js';
import { AuthFacade } from '../auth/facade.js';
import { UserJwtPayload } from '../auth/services/user/user-authentification/s-params.js';
import { CompanyFacade } from '../company/facade.js';
import { SubjectFacade } from '../subject/facade.js';
import { FrontProxyModule } from './module.js';
import { FrontendProxyResolves } from './resolves.js';

export class FrontendProxyModuleResolver extends ModuleResolver<
  ServerResolver<ServerResolves<UserJwtPayload>>, FrontendProxyResolves
> {
  init(
    module: FrontProxyModule,
    serverResolver: ServerResolver<ServerResolves<UserJwtPayload>>,
  ): void {
    this.module = module;
    this.serverResolver = serverResolver;
    this.resolves.authFacade.init(this);
    this.resolves.subjectFacade.init(this);
    this.resolves.companyFacade.init(this);
  }

  resolve(key: unknown): unknown {
    throw this.getLogger().error('Method getRealisation not implemented.');
  }

  resolveRepo(key: unknown): unknown {
    throw this.getLogger().error('not be called in read module');
  }

  resolveFacade(key: unknown): unknown {
    if (key === AuthFacade) return this.resolves.authFacade;
    if (key === SubjectFacade) return this.resolves.subjectFacade;
    if (key === CompanyFacade) return this.resolves.companyFacade;
    throw this.getLogger().error(`not find facade for key: ${key}`);
  }
}
