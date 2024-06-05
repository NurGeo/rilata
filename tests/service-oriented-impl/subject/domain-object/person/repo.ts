import { Repositoriable } from '../../../../../src/api/resolve/repositoriable.js';
import { Result } from '../../../../../src/core/result/types.js';
import { UuidType } from '../../../../../src/core/types.js';
import { SubjectModuleResolver } from '../../resolver.js';
import { PersonAR } from './a-root.js';
import { PersonDoesntExistByIdError, PersonDoesntExistByIinError, PersonAlreadyExistsError } from './repo-errors.js';

export interface PersonRepository {
  init(resolver: SubjectModuleResolver): void
  addPerson(person: PersonAR): Promise<Result<PersonAlreadyExistsError, { id: UuidType }>>
  getById(id: string): Promise<Result<PersonDoesntExistByIdError, PersonAR>>
  getByIin(iin: string): Promise<Result<PersonDoesntExistByIinError, PersonAR>>
}

export const PersonRepository = {
  instance(resolver: Repositoriable): PersonRepository {
    return resolver.resolveRepo(PersonRepository) as PersonRepository;
  },
};
