import { FakeClassImplements } from '../../../fixtures/fake-class-implements.js';
import { CompanyCmdRepository } from '../../company-cmd/domain-object/company/repo.js';
import { CompanyCmdResolves } from '../../company-cmd/resolves.js';
import { CompanyCmdRepositoryImpl } from '../../zz-infra/repositories/company-cmd.js';

let isResolved = false;

let companyResolves: CompanyCmdResolves;

let db: FakeClassImplements.TestMemoryDatabase;

let eventRepo: FakeClassImplements.TestEventRepository;

let companyRepo: CompanyCmdRepository;

export function getCompanyCmdResolves(): CompanyCmdResolves {
  if (isResolved === false) {
    db = new FakeClassImplements.TestMemoryDatabase();
    eventRepo = new FakeClassImplements.TestEventRepository(db);
    companyRepo = new CompanyCmdRepositoryImpl(db);
    companyResolves = {
      moduleName: 'CompanyCmdModule',
      moduleUrls: ['/api/company-cmd-module/'],
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
