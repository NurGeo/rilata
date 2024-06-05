import { DomainUser } from '../../../../../src/api/controller/types.js';
import { requestStoreDispatcher } from '../../../../../src/api/request-store/request-store-dispatcher.js';
import { QueryService } from '../../../../../src/api/service/concrete-service/query.service.js';
import { FullServiceResult, ServiceResult } from '../../../../../src/api/service/types.js';
import { failure } from '../../../../../src/core/result/failure.js';
import { success } from '../../../../../src/core/result/success.js';
import { UserId, UuidType } from '../../../../../src/core/types.js';
import { AuthFacade } from '../../../auth/facade.js';
import { CompanyFacade } from '../../../company/facade.js';
import { SubjectFacade } from '../../../subject/facade.js';
import { FullUser } from '../../domain-data/full-company/params.js';
import { FrontendProxyModuleResolver } from '../../resolver.js';
import { GetFullCompanyRequestDod, GetFullCompanyServiceParams } from './s-params.js';
import { getFullCompanyValidator } from './v-map.js';

export class GetingFullCompanyService extends QueryService<
  GetFullCompanyServiceParams, FrontendProxyModuleResolver
> {
  moduleName = 'FrontProxyModule' as const;

  serviceName = 'GetingFullCompanyService' as const;

  inputDodName = 'GetFullCompanyRequestDod' as const;

  aRootName = 'FullCompany' as const;

  protected supportedCallers = ['DomainUser'] as const;

  protected validator = getFullCompanyValidator;

  async runDomain(
    input: GetFullCompanyRequestDod,
  ): Promise<ServiceResult<GetFullCompanyServiceParams>> {
    const store = requestStoreDispatcher.getPayload();
    const { caller } = store;
    let domainUser: DomainUser;
    if (caller.type === 'DomainUser') {
      domainUser = caller;
    } else if (caller.type === 'ModuleCaller' && caller.user.type === 'DomainUser') {
      domainUser = caller.user;
    } else throw this.logger.error('supported only domain user caller');

    return this.getFullCompany(input.attrs.id, domainUser) as Promise<ServiceResult<GetFullCompanyServiceParams>>;
  }

  protected async getFullCompany(
    companyId: UuidType, domainUser: DomainUser,
  ): Promise<FullServiceResult<GetFullCompanyServiceParams>> {
    const companyFacade = CompanyFacade.instance(this.moduleResolver);
    const companyResult = await companyFacade.getCompany(companyId, domainUser);
    if (companyResult.isFailure()) return failure(companyResult.value);
    const companyAttrs = companyResult.value;
    const employees = await this.getFullUsers(companyAttrs.employees, domainUser);
    return success({
      ...companyAttrs,
      employees,
    });
  }

  protected async getFullUsers(userIds: UserId[], domainUser: DomainUser): Promise<FullUser[]> {
    const authFacade = AuthFacade.instance(this.moduleResolver);
    const usersResult = await authFacade.getUsers(userIds, domainUser);
    if (usersResult.isFailure()) {
      throw this.logger.error('метод getUsers не должен возвращать failure');
    }
    const users = usersResult.value;
    const subjectFacade = SubjectFacade.instance(this.moduleResolver);
    const personResults = await Promise.all(users.map(
      (userAttrs) => subjectFacade.getPersonByIin(userAttrs.personIin, domainUser),
    ));
    const persons = personResults.map((result) => {
      if (result.isFailure()) {
        throw this.logger.error(
          'Некоторые объекты персон для объектов пользователей не найдены',
          personResults.map((r) => ({ isSuccess: r.isSuccess(), value: r.value })),
        );
      }
      return result.value;
    });
    return users.map((user, index) => (
      {
        userId: user.userId,
        person: persons[index],
      }
    ));
  }
}
