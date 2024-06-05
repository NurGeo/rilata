import { GeneralModuleResolver } from '../../../../../src/api/module/types.js';
import { Repositoriable } from '../../../../../src/api/resolve/repositoriable.js';
import { Result } from '../../../../../src/core/result/types.js';
import { UuidType } from '../../../../../src/core/types.js';
import { CompanyAR } from './a-root.js';
import { CompanyDoesntExistByBinError, CompanyAlreadyExistError } from './repo-errors.js';

export interface CompanyCmdRepository {
  init(resolver: GeneralModuleResolver): void
  addCompany(company: CompanyAR): Promise<Result<CompanyAlreadyExistError, { id: UuidType }>>
  getByBin(bin: string): Promise<Result<CompanyDoesntExistByBinError, CompanyAR>>
}

export const CompanyCmdRepository = {
  instance(resolver: Repositoriable): CompanyCmdRepository {
    return resolver.resolveRepo(CompanyCmdRepository) as CompanyCmdRepository;
  },
};
