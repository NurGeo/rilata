import { QueryService } from '../../../../../../src/api/service/concrete-service/query.service.js';
import { ServiceResult } from '../../../../../../src/api/service/types.js';
import { failure } from '../../../../../../src/core/result/failure.js';
import { success } from '../../../../../../src/core/result/success.js';
import { PersonRepository } from '../../../domain-object/person/repo.js';
import { SubjectModuleResolver } from '../../../resolver.js';
import { GetPersonByIinRequestDod, GetPersonByIinServiceParams } from './s-params.js';
import { getPersonByIinValidator } from './v-map.js';

export class GetingPersonByIinService extends QueryService<
  GetPersonByIinServiceParams, SubjectModuleResolver
> {
  moduleName = 'SubjectModule' as const;

  serviceName = 'GetingPersonByIinService' as const;

  inputDodName = 'getPersonByIin' as const;

  aRootName = 'PersonAR' as const;

  protected supportedCallers = ['DomainUser', 'ModuleCaller'] as const;

  protected validator = getPersonByIinValidator;

  async runDomain(
    input: GetPersonByIinRequestDod,
  ): Promise<ServiceResult<GetPersonByIinServiceParams>> {
    const personRepo = PersonRepository.instance(this.moduleResolver);
    const result = await personRepo.getByIin(input.attrs.iin);
    if (result.isFailure()) return failure(result.value);
    return success(result.value.getHelper().getOutput().attrs);
  }
}
