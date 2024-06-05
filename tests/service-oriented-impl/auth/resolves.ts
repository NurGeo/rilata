import { EventRepository } from '../../../src/api/database/event.repository.js';
import { ModuleResolves } from '../../../src/api/module/m-resolves.js';
import { UserRepository } from './domain-object/user/repo.js';
import { AuthModule } from './module.js';

export type AuthResolves = ModuleResolves<AuthModule> & {
  moduleUrls: ['/api/auth-module/'],
  userRepo: UserRepository,
  eventRepo: EventRepository<true>,
}
