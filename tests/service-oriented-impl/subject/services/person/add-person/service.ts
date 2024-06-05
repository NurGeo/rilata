import { CommandService } from '../../../../../../src/api/service/concrete-service/command.service.js';
import { UowTransactionStrategy } from '../../../../../../src/api/service/transaction-strategy/uow.strategy.js';
import { ServiceResult } from '../../../../../../src/api/service/types.js';
import { PersonFactory } from '../../../domain-object/person/factory.js';
import { PersonRepository } from '../../../domain-object/person/repo.js';
import { SubjectModuleResolver } from '../../../resolver.js';
import { AddPersonRequestDod, AddPersonServiceParams } from './s-params.js';
import { addPersonValidator } from './v-map.js';

export class AddingPersonService extends CommandService<
  AddPersonServiceParams, SubjectModuleResolver
> {
  moduleName = 'SubjectModule' as const;

  serviceName = 'AddingPersonService' as const;

  inputDodName = 'addPerson' as const;

  aRootName = 'PersonAR' as const;

  protected supportedCallers = ['ModuleCaller', 'DomainUser'] as const;

  protected transactionStrategy = new UowTransactionStrategy(true);

  protected validator = addPersonValidator;

  async runDomain(
    input: AddPersonRequestDod,
  ): Promise<ServiceResult<AddPersonServiceParams>> {
    const factory = new PersonFactory();
    const person = factory.create(input.attrs);
    const repo = PersonRepository.instance(this.moduleResolver);
    return repo.addPerson(person);
  }
}
