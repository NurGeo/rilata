import { Module } from '../../../src/api/module/module.js';
import { ModuleType } from '../../../src/api/module/types.js';
import { GeneralCommandService, GeneralEventService, GeneraQueryService } from '../../../src/api/service/types.js';
import { GetingCompanyService } from './services/get-company/service.js';
import { RegisteringCompanyService } from './services/register-company/service.js';

export class CompanyModule extends Module {
  moduleName = 'CompanyModule' as const;

  moduleType: ModuleType = 'common-module' as const;

  queryServices: GeneraQueryService[] = [
    new GetingCompanyService(),
  ];

  commandServices: GeneralCommandService[] = [
    new RegisteringCompanyService(),
  ];

  eventServices: GeneralEventService[] = [];
}
