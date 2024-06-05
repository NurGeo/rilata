import { Repositoriable } from '../../../../../src/api/resolve/repositoriable.js';
import { Result } from '../../../../../src/core/result/types.js';
import { UuidType } from '../../../../../src/core/types.js';
import { UserAttrs } from '../../domain-data/user/params.js';
import { AuthModuleResolver } from '../../resolver.js';
import { UserDoesNotExistByIdError } from './repo-errors.js';

export type UserRepositoryRecord = UserAttrs & { version: number }

export interface UserRepository {
  init(resolver: AuthModuleResolver): void
  addUser(attrs: UserRepositoryRecord): Promise<Result<never, { userId: UuidType }>>
  getUser(id: UuidType): Promise<Result<UserDoesNotExistByIdError, UserRepositoryRecord>>
  findByIin(iin: string): Promise<UserRepositoryRecord[]>
}

export const UserRepository = {
  instance(resolver: Repositoriable): UserRepository {
    return resolver.resolveRepo(UserRepository) as UserRepository;
  },
};
