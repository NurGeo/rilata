import { AuthFacadeOneServerImpl } from '../../auth/one-server-facades/auth.js';
import { CompanyFacadeOneServerImpl } from '../../company/infra/one-server-facade/company.js';
import { SubjectFacadeOneServerImpl } from '../../subject/infra/one-server-facades/subject.js';
import { FrontendProxyResolves } from '../../z-front-proxy/resolves.js';

let frontProxyResolves: FrontendProxyResolves;

export function getFrontProxyResolves(): FrontendProxyResolves {
  /** в read-module нет своих репозиториев, поэтому удалены ссылки на  */
  if (!frontProxyResolves) {
    frontProxyResolves = {
      moduleName: 'FrontProxyModule',
      moduleUrls: ['/api/frontend-proxy-module/'],
      companyFacade: new CompanyFacadeOneServerImpl(),
      subjectFacade: new SubjectFacadeOneServerImpl(),
      authFacade: new AuthFacadeOneServerImpl(),
      get db(): never {
        throw Error('read module not supported work with database, only facades');
      },
    };
  }

  return frontProxyResolves;
}
