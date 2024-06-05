import { FakeClassImplements } from '../../../fixtures/fake-class-implements.js';
import { CompanyReadRepository } from '../../company-read/domain/company/repo.js';
import { CompanyReadResolves } from '../../company-read/resolves.js';
import { CompanyReadRepositoryImpl } from '../../zz-infra/repositories/company-read.js';

let isResolved = false;

let companyResolves: CompanyReadResolves;

let db: FakeClassImplements.TestMemoryDatabase;

let eventRepo: FakeClassImplements.TestEventRepository;

let companyRepo: CompanyReadRepository;

export function getCompanyReadResolves(): CompanyReadResolves {
  if (isResolved === false) {
    db = new FakeClassImplements.TestMemoryDatabase();
    eventRepo = new FakeClassImplements.TestEventRepository(db);
    companyRepo = new CompanyReadRepositoryImpl(db);
    companyResolves = {
      moduleName: 'CompanyReadModule',
      moduleUrls: ['/api/company-read-module/'],
      db,
      eventRepo,
      busMessageRepo: eventRepo,
      companyRepo,
    };
    Object.freeze(companyResolves);
    isResolved = true;
  }

  return companyResolves;
}
