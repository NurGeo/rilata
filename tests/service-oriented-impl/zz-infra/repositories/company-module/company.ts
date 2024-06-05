import { EventRepository } from '../../../../../src/api/database/event.repository.js';
import { requestStoreDispatcher } from '../../../../../src/api/request-store/request-store-dispatcher.js';
import { DatabaseObjectSavingError } from '../../../../../src/core/exeptions.js';
import { Logger } from '../../../../../src/core/logger/logger.js';
import { failure } from '../../../../../src/core/result/failure.js';
import { success } from '../../../../../src/core/result/success.js';
import { Result } from '../../../../../src/core/result/types.js';
import { UuidType } from '../../../../../src/core/types.js';
import { dodUtility } from '../../../../../src/core/utils/dod/dod-utility.js';
import { FakeClassImplements } from '../../../../fixtures/fake-class-implements.js';
import { CompanyAttrs } from '../../../company/domain-data/company/params.js';
import { CompanyAR } from '../../../company/domain-object/company/a-root.js';
import { CompanyARFactory } from '../../../company/domain-object/company/factory.js';
import { CompanyRepository } from '../../../company/domain-object/company/repo.js';
import { CompanyDoesntExistByBinError, CompanyDoesntExistByIdError, CompanyAlreadyExistError } from '../../../company/domain-object/company/repo-errors.js';
import { CompanyModuleResolver } from '../../../company/resolver.js';

export class CompanyRepositoryImpl implements CompanyRepository {
  testRepo: FakeClassImplements.TestMemoryRepository<
    'company_repo', CompanyAttrs & { version: number }, 'id'
  >;

  protected logger!: Logger;

  protected resolver!: CompanyModuleResolver;

  constructor(testDb: FakeClassImplements.TestMemoryDatabase) {
    this.testRepo = new FakeClassImplements.TestMemoryRepository('company_repo', 'id', testDb);
  }

  init(resolver: CompanyModuleResolver): void {
    this.logger = resolver.getLogger();
    this.resolver = resolver;
  }

  async addCompany(
    company: CompanyAR,
  ): Promise<Result<CompanyAlreadyExistError, { id: UuidType }>> {
    const attrs = company.getAttrs();
    const existCompany = await this.testRepo.findByAttrs({ bin: attrs.bin });
    if (existCompany) {
      return failure(dodUtility.getDomainError<CompanyAlreadyExistError>(
        'CompanyAlreadyExistError',
        'Компания с БИН {{bin}} уже существует',
        { bin: attrs.bin },
      ));
    }

    this.addEvents(company);

    const { version } = company.getHelper().getMeta();
    const result = await this.testRepo.add({ ...attrs, version });
    if (result.isSuccess()) return success({ id: attrs.id });

    const { requestId } = requestStoreDispatcher.getPayload();
    this.logger.error(`Компания с id: ${attrs.id} уже существует`, { err: result.value, requestId });
    throw new DatabaseObjectSavingError();
  }

  async getById(id: string): Promise<Result<CompanyDoesntExistByIdError, CompanyAR>> {
    const companyRecord = await this.testRepo.find(id);
    if (companyRecord) {
      const { version, ...attrs } = companyRecord;
      const factory = new CompanyARFactory();
      return success(factory.restore(attrs, version));
    }
    return failure(dodUtility.getDomainError<CompanyDoesntExistByIdError>(
      'CompanyDoesntExistByIdError',
      'Не найдена компания с id: {{id}}',
      { id },
    ));
  }

  async getByBin(bin: string): Promise<Result<CompanyDoesntExistByBinError, CompanyAR>> {
    const companyRecord = await this.testRepo.findByAttrs({ bin });
    if (companyRecord) {
      const { version, ...attrs } = companyRecord;
      const factory = new CompanyARFactory();
      return success(factory.restore(attrs, version));
    }
    return failure(dodUtility.getDomainError<CompanyDoesntExistByBinError>(
      'CompanyDoesntExistByBinError',
      'Не найдена компания с БИН: {{bin}}',
      { bin },
    ));
  }

  async addEvents(company: CompanyAR): Promise<void> {
    const eventRepo = EventRepository.instance(this.resolver);
    await eventRepo.addEvents(company.getHelper().getEvents());
    company.getHelper().cleanEvents();
  }
}
