import { describe, expect, test } from 'bun:test';
import { DomainUser } from '../../../../../src/api/controller/types.js';
import { uuidUtility } from '../../../../../src/core/utils/uuid/uuid-utility.js';
import { CompanyModule } from '../../../company/module.js';
import { serverStarter } from '../../../zzz-run-server/starter.js';
import { PersonAR } from '../../domain-object/person/a-root.js';
import { PersonRepository } from '../../domain-object/person/repo.js';
import { SubjectFacade } from '../../facade.js';
import { SubjectModule } from '../../module.js';
import { AddPersonOut, AddPersonRequestDodAttrs } from '../../services/person/add-person/s-params.js';

describe('subject facade tests', async () => {
  const server = serverStarter.start([
    'SubjectModule',
    'CompanyModule',
  ]);
  const companyModule = server.getModule<CompanyModule>('CompanyModule');
  const companyResolver = companyModule.getModuleResolver();

  test('успех, service выполнился и пользователь добавился', async () => {
    const domainUser: DomainUser = { type: 'DomainUser', userId: uuidUtility.getNewUUID() };
    const sut = SubjectFacade.instance(companyResolver);
    const addPersonAttrs: AddPersonRequestDodAttrs = {
      iin: '135135135135',
      firstName: 'Will',
      lastName: 'Smith',
    };
    const result = await sut.addPerson(addPersonAttrs, domainUser);
    expect(result.isSuccess()).toBe(true);
    const successValue = result.value as AddPersonOut;
    expect(uuidUtility.isValidValue(successValue.id)).toBe(true);

    const subjectModuleResolver = server.getModule<SubjectModule>('SubjectModule').getModuleResolver();
    const personRepo = PersonRepository.instance(subjectModuleResolver);
    const getResult = await personRepo.getById(successValue.id);
    expect(getResult.isSuccess()).toBe(true);
    expect((getResult.value as PersonAR).getAttrs()).toEqual({
      id: successValue.id,
      iin: '135135135135',
      firstName: 'Will',
      lastName: 'Smith',
      contacts: {
        phones: [],
      },
    });
  });
});
