import { GeneralModuleResolver } from '../../../../../src/api/module/types.js';
import { Repositoriable } from '../../../../../src/api/resolve/repositoriable.js';
import { Result } from '../../../../../src/core/result/types.js';
import { CompanyDoesntExistByBinError } from '../../../company-cmd/domain-object/company/repo-errors.js';
import { CompanyOutAttrs } from './params.js';

export interface CompanyReadRepository {
  init(resolver: GeneralModuleResolver): void
  addCompany(attrs: CompanyOutAttrs): Promise<void>
  getByBin(bin: string): Promise<Result<CompanyDoesntExistByBinError, CompanyOutAttrs>>
}

export const CompanyReadRepository = {
  instance(resolver: Repositoriable): CompanyReadRepository {
    return resolver.resolveRepo(CompanyReadRepository) as CompanyReadRepository;
  },
};
