import { MaybePromise } from '#core/types.js';
import { DTO } from '../../domain/dto.js';
import { TestRepository } from './test.repository.js';
import { TestBatchRecords } from './types.js';

export interface TestDatabase {
  addBatch<R extends TestRepository<string, DTO>>(
    batchRecords: TestBatchRecords<R>
  ): MaybePromise<void>

  clearDb(): MaybePromise<void | void[]>
}
