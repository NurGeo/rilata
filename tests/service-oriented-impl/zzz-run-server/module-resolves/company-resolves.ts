import { FakeClassImplements } from '../../../fixtures/fake-class-implements.js';
import { AuthFacadeOneServerImpl } from '../../auth/one-server-facades/auth.js';
import { CompanyRepository } from '../../company/domain-object/company/repo.js';
import { CompanyResolves } from '../../company/resolves.js';
import { SubjectFacadeOneServerImpl } from '../../subject/infra/one-server-facades/subject.js';
import { CompanyRepositoryImpl } from '../../zz-infra/repositories/company-module/company.js';

let isResolved = false;

let companyResolves: CompanyResolves;

let db: FakeClassImplements.TestMemoryDatabase;

let eventRepo: FakeClassImplements.TestEventRepository;

let companyRepo: CompanyRepository;

export function getCompanyResolves(): CompanyResolves {
  if (isResolved === false) {
    db = new FakeClassImplements.TestMemoryDatabase();
    eventRepo = new FakeClassImplements.TestEventRepository(db);
    companyRepo = new CompanyRepositoryImpl(db);
    companyResolves = {
      moduleName: 'CompanyModule',
      moduleUrls: ['/api/company-module/'],
      db,
      eventRepo,
      companyRepo,
      subjectFacade: new SubjectFacadeOneServerImpl(),
      authFacade: new AuthFacadeOneServerImpl(),
    };
    // Object.freeze(companyResolves);
    isResolved = true;
  }

  return companyResolves;
}
