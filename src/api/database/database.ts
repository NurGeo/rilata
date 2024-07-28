import { MaybePromise } from '#core/types.js';
import { DTO } from '#domain/dto.js';
import { GeneralModuleResolver } from '../module/types.js';
import { Repository } from './repository.ts';
import { DatabaseServiceStatus, BatchRecords } from './types.ts';

export interface Database {
  init(moduleResolver: GeneralModuleResolver, ...args: unknown[]): void

  getRepositories(): Repository<string, DTO>[]

  createDb(): MaybePromise<void>

  clearDb(): MaybePromise<void>

  migrateDb(): MaybePromise<void>

  creationStatus(): MaybePromise<DatabaseServiceStatus>

  migrationStatus(): MaybePromise<DatabaseServiceStatus>

  addBatch<R extends Repository<string, DTO>>(
    batchRecords: BatchRecords<R>
  ): MaybePromise<void>

  stop(): void
}
