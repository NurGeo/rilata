import { Module } from '../../../src/api/module/module.js';
import { ModuleType } from '../../../src/api/module/types.js';
import { GeneralCommandService, GeneralEventService, GeneraQueryService } from '../../../src/api/service/types.js';
import { AddingUserService } from './services/user/add-user/service.js';
import { GetingUsersService } from './services/user/get-users/service.js';

export class AuthModule extends Module {
  moduleName = 'AuthModule' as const;

  moduleType: ModuleType = 'common-module' as const;

  queryServices: GeneraQueryService[] = [
    new GetingUsersService(),
  ];

  commandServices: GeneralCommandService[] = [
    new AddingUserService(),
  ];

  eventServices: GeneralEventService[] = [];
}
