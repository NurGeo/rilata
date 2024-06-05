import { FakeClassImplements } from '../../../fixtures/fake-class-implements.js';
import { SubjectResolves } from '../../subject/resolves.js';
import { PersonRepositoryImpl } from '../../zz-infra/repositories/subject-module/person.js';

let db: FakeClassImplements.TestMemoryDatabase;

let subjectResolves: SubjectResolves;

export function getSubjectResolves(): SubjectResolves {
  if (!db) {
    db = new FakeClassImplements.TestMemoryDatabase();
  }

  if (!subjectResolves) {
    subjectResolves = {
      moduleName: 'SubjectModule',
      moduleUrls: ['/api/subject-module/'],
      db,
      eventRepo: new FakeClassImplements.TestEventRepository(db),
      personRepo: new PersonRepositoryImpl(db),
    };
  }

  return subjectResolves;
}
