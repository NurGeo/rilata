import { requestStoreDispatcher } from '../../../../src/api/request-store/request-store-dispatcher.js';
import { DatabaseObjectSavingError } from '../../../../src/core/exeptions.js';
import { Logger } from '../../../../src/core/logger/logger.js';
import { failure } from '../../../../src/core/result/failure.js';
import { success } from '../../../../src/core/result/success.js';
import { Result } from '../../../../src/core/result/types.js';
import { dodUtility } from '../../../../src/core/utils/dod/dod-utility.js';
import { FakeClassImplements } from '../../../fixtures/fake-class-implements.js';
import { CompanyDoesntExistByBinError } from '../../company-cmd/domain-object/company/repo-errors.js';
import { CompanyOutAttrs } from '../../company-read/domain/company/params.js';
import { CompanyReadRepository } from '../../company-read/domain/company/repo.js';
import { CompanyReadModuleResolver } from '../../company-read/resolver.js';

export class CompanyReadRepositoryImpl implements CompanyReadRepository {
  testRepo: FakeClassImplements.TestMemoryRepository<
    'company_read_repo', CompanyOutAttrs, 'id'
  >;

  protected logger!: Logger;

  protected resolver!: CompanyReadModuleResolver;

  constructor(testDb: FakeClassImplements.TestMemoryDatabase) {
    this.testRepo = new FakeClassImplements.TestMemoryRepository('company_read_repo', 'id', testDb);
  }

  init(resolver: CompanyReadModuleResolver): void {
    this.logger = resolver.getLogger();
    this.resolver = resolver;
  }

  async addCompany(attrs: CompanyOutAttrs): Promise<void> {
    const existCompany = await this.testRepo.findByAttrs({ bin: attrs.bin });
    if (existCompany) {
      throw this.logger.error(`company by bin: ${attrs.bin} is exist`, attrs);
    }

    const result = await this.testRepo.add({ ...attrs });
    if (result.isSuccess()) return undefined;

    const { requestId } = requestStoreDispatcher.getPayload();
    const errStr = `Компания с id: ${attrs.id} уже существует`;
    this.logger.error(errStr, { err: result.value, requestId });
    throw new DatabaseObjectSavingError(errStr);
  }

  async getByBin(bin: string): Promise<Result<CompanyDoesntExistByBinError, CompanyOutAttrs>> {
    const companyRecord = await this.testRepo.findByAttrs({ bin });
    if (companyRecord) {
      return success(companyRecord);
    }
    return failure(dodUtility.getDomainError<CompanyDoesntExistByBinError>(
      'CompanyDoesntExistByBinError',
      'Не найдена компания с БИН: {{bin}}',
      { bin },
    ));
  }
}
