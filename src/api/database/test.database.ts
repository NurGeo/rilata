import { DTO } from '../../domain/dto.js';
import { TestRepository } from './test.repository.js';
import { Asyncable, TestBatchRecords } from './types.js';

export interface TestDatabase<ASYNC extends boolean> {
  addBatch<R extends TestRepository<string, DTO, ASYNC>>(
    batchRecords: TestBatchRecords<R>
  ): Asyncable<ASYNC, void>

  clear(): Asyncable<ASYNC, void | void[]>
}
