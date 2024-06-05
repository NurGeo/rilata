import { FakeClassImplements } from '../../../fixtures/fake-class-implements.js';
import { AuthResolves } from '../../auth/resolves.js';
import { UserRepositoryImpl } from '../../zz-infra/repositories/auth-module/user.js';

let db: FakeClassImplements.TestMemoryDatabase;

let authResolves: AuthResolves;

export function getAuthResolves(): AuthResolves {
  if (!db) {
    db = new FakeClassImplements.TestMemoryDatabase();
  }

  if (!authResolves) {
    authResolves = {
      moduleName: 'AuthModule',
      moduleUrls: ['/api/auth-module/'],
      db,
      eventRepo: new FakeClassImplements.TestEventRepository(db),
      userRepo: new UserRepositoryImpl(db),
    };
  }

  return authResolves;
}
