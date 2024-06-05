import { TestBatchRecords } from '../../../src/api/database/types.js';
import { UserRepositoryImpl } from '../zz-infra/repositories/auth-module/user.js';
import { CompanyRepositoryImpl } from '../zz-infra/repositories/company-module/company.js';
import { PersonRepositoryImpl } from '../zz-infra/repositories/subject-module/person.js';

export namespace ServiceModulesFixtures {
  export const repoFixtures: TestBatchRecords<
    CompanyRepositoryImpl['testRepo']
    | PersonRepositoryImpl['testRepo']
    | UserRepositoryImpl['testRepo']
  > = ({
    company_repo: [
      {
        id: '28081e4d-1f7e-48c2-92da-21bacd115829',
        name: 'Windows corp.',
        bin: '111222333444',
        address: '12, Honweywell st., Goodwill, Ogaio',
        employees: ['edc6bfdc-ae44-4e7d-a35e-f26a0e92ffdd'],
        admins: ['edc6bfdc-ae44-4e7d-a35e-f26a0e92ffdd'],
        version: 0,
      },
    ],
    person_repo: [
      {
        id: 'b433034e-8090-4c7d-8738-8cb78bbc6792',
        firstName: 'Bill',
        lastName: 'Geits',
        iin: '123123123123',
        contacts: {
          emails: [{ type: 'corporate', email: 'bill@microsoft.com' }],
          techSupportComments: ['you should never send letters'],
        },
        version: 0,
      },
    ],
    user_repo: [
      {
        userId: 'edc6bfdc-ae44-4e7d-a35e-f26a0e92ffdd',
        personIin: '123123123123',
        version: 0,
      },
    ],
  });
}
