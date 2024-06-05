import { QueryService } from '../../../../../src/api/service/concrete-service/query.service.js';
import { ServiceResult } from '../../../../../src/api/service/types.js';
import { failure } from '../../../../../src/core/result/failure.js';
import { success } from '../../../../../src/core/result/success.js';
import { CompanyRepository } from '../../domain-object/company/repo.js';
import { CompanyModuleResolver } from '../../resolver.js';
import { GetCompanyRequestDod, GetCompanyServiceParams } from './s.params.js';
import { getCompanyValidator } from './v-map.js';

export class GetingCompanyService extends QueryService<
  GetCompanyServiceParams, CompanyModuleResolver
> {
  moduleName = 'CompanyModule' as const;

  serviceName = 'GettingCompanyService' as const;

  inputDodName = 'getCompany' as const;

  aRootName = 'CompanyAR' as const;

  protected supportedCallers = ['DomainUser', 'ModuleCaller'] as const;

  protected validator = getCompanyValidator;

  async runDomain(
    input: GetCompanyRequestDod,
  ): Promise<ServiceResult<GetCompanyServiceParams>> {
    const repo = CompanyRepository.instance(this.moduleResolver);
    const result = await repo.getById(input.attrs.id);
    if (result.isFailure()) return failure(result.value);
    return success(result.value.getAttrs());
  }
}
