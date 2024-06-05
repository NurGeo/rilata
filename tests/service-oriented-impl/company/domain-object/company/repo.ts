import { Repositoriable } from '../../../../../src/api/resolve/repositoriable.js';
import { Result } from '../../../../../src/core/result/types.js';
import { UuidType } from '../../../../../src/core/types.js';
import { CompanyModuleResolver } from '../../resolver.js';
import { CompanyAR } from './a-root.js';
import { CompanyDoesntExistByBinError, CompanyDoesntExistByIdError, CompanyAlreadyExistError } from './repo-errors.js';

export interface CompanyRepository {
  init(resolver: CompanyModuleResolver): void
  addCompany(company: CompanyAR): Promise<Result<CompanyAlreadyExistError, { id: UuidType }>>
  getById(id: string): Promise<Result<CompanyDoesntExistByIdError, CompanyAR>>
  getByBin(bin: string): Promise<Result<CompanyDoesntExistByBinError, CompanyAR>>
}

export const CompanyRepository = {
  instance(resolver: Repositoriable): CompanyRepository {
    return resolver.resolveRepo(CompanyRepository) as CompanyRepository;
  },
};
