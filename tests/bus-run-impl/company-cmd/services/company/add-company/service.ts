import { requestStoreDispatcher } from '../../../../../../src/api/request-store/request-store-dispatcher.js';
import { CommandService } from '../../../../../../src/api/service/concrete-service/command.service.js';
import { UowTransactionStrategy } from '../../../../../../src/api/service/transaction-strategy/uow.strategy.js';
import { ServiceResult } from '../../../../../../src/api/service/types.js';
import { failure } from '../../../../../../src/core/result/failure.js';
import { success } from '../../../../../../src/core/result/success.js';
import { Result } from '../../../../../../src/core/result/types.js';
import { dodUtility } from '../../../../../../src/core/utils/dod/dod-utility.js';
import { CompanyCmdARFactory } from '../../../domain-object/company/factory.js';
import { CompanyCmdRepository } from '../../../domain-object/company/repo.js';
import { CompanyAlreadyExistError } from '../../../domain-object/company/repo-errors.js';
import { CompanyCmdModuleResolver } from '../../../resolver.js';
import {
  AddCompanyServiceParams, AddCompanyOut, AddCompanyRequestDod, AddCompanyRequestDodAttrs,
} from './s.params.js';
import { addCompanyValidator } from './v.map.js';

export class AddingCompanyService extends CommandService<
  AddCompanyServiceParams, CompanyCmdModuleResolver
> {
  inputDodName = 'addCompany' as const;

  serviceName = 'AddingCompanyService' as const;

  moduleName = 'CompanyCmdModule' as const;

  aRootName = 'CompanyAR' as const;

  protected transactionStrategy = new UowTransactionStrategy(true);

  protected supportedCallers = ['DomainUser'] as const;

  protected validator = addCompanyValidator;

  async runDomain(
    input: AddCompanyRequestDod,
  ): Promise<ServiceResult<AddCompanyServiceParams>> {
    const { caller } = requestStoreDispatcher.getPayload();
    if (caller.type !== 'DomainUser') {
      throw this.logger.error(`not supported called by call: ${caller.type}`);
    }

    const existCompanyResult = await this.existCompany(input.attrs.bin);
    if (existCompanyResult.isFailure()) return failure(existCompanyResult.value);

    return this.addCompany(input.attrs);
  }

  protected async existCompany(bin: string): Promise<Result<CompanyAlreadyExistError, undefined>> {
    const companyRepo = CompanyCmdRepository.instance(this.moduleResolver);
    const getResult = await companyRepo.getByBin(bin);
    if (getResult.isSuccess()) {
      const err = dodUtility.getDomainError<CompanyAlreadyExistError>(
        'CompanyAlreadyExistError',
        'Компания с БИН {{bin}} уже существует',
        { bin },
      );
      return failure(err);
    }
    return success(undefined);
  }

  protected async addCompany(
    input: AddCompanyRequestDodAttrs,
  ): Promise<Result<CompanyAlreadyExistError, AddCompanyOut>> {
    const companyFactory = new CompanyCmdARFactory();
    const company = companyFactory.create(input);
    const companyRepo = CompanyCmdRepository.instance(this.moduleResolver);
    return companyRepo.addCompany(company);
  }
}
