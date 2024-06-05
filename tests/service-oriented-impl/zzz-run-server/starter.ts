import { ServerStarter } from '../../../src/api/server/server-starter.js';
import { serverResolves } from './resolves.js';
import { ServiceModulesBunServer } from './server.js';
import { AuthModule } from '../auth/module.js';
import { AuthModuleResolver } from '../auth/resolver.js';
import { CompanyModule } from '../company/module.js';
import { CompanyModuleResolver } from '../company/resolver.js';
import { SubjectModule } from '../subject/module.js';
import { SubjectModuleResolver } from '../subject/resolver.js';
import { FrontProxyModule } from '../z-front-proxy/module.js';
import { FrontendProxyModuleResolver } from '../z-front-proxy/resolver.js';
import { getAuthResolves } from './module-resolves/auth-resolves.js';
import { getCompanyResolves } from './module-resolves/company-resolves.js';
import { getFrontProxyResolves } from './module-resolves/front-proxy-resolves.js';
import { getSubjectResolves } from './module-resolves/subject-resolves.js';
import { ServerResolver } from '../../../src/api/server/s-resolver.js';

type AllServerModules = AuthModule | SubjectModule | CompanyModule | FrontProxyModule;

export const serverStarter = new ServerStarter<AllServerModules>(
  ServiceModulesBunServer,
  ServerResolver,
  serverResolves,
  [
    [AuthModule, AuthModuleResolver, getAuthResolves()],
    [SubjectModule, SubjectModuleResolver, getSubjectResolves()],
    [CompanyModule, CompanyModuleResolver, getCompanyResolves()],
    [FrontProxyModule, FrontendProxyModuleResolver, getFrontProxyResolves()],
  ],
);
