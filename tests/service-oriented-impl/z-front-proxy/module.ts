import { Module } from '../../../src/api/module/module.js';
import { ModuleType } from '../../../src/api/module/types.js';
import { GeneralCommandService, GeneralEventService, GeneraQueryService } from '../../../src/api/service/types.js';
import { GetingFullCompanyService } from './services/get-full-company/service.js';

export class FrontProxyModule extends Module {
  moduleType: ModuleType = 'read-module' as const;

  moduleName = 'FrontProxyModule' as const;

  queryServices: GeneraQueryService[] = [
    new GetingFullCompanyService(),
  ];

  commandServices: GeneralCommandService[] = [];

  eventServices: GeneralEventService[] = [];
}
